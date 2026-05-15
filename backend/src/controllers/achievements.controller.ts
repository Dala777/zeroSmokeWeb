import type { Request, Response } from "express"
import UserProgress from "../models/UserProgress"
import UserGamification from "../models/UserGamification"
import SmokingRecord from "../models/SmokingRecord"
import DailyCheckin from "../models/DailyCheckin"
import DailyPlan from "../models/DailyPlan"
import { UserPlan } from "../models/UserPlan"

interface AuthRequest extends Request {
  userId?: string
}

const startOfDay = (date: Date): Date => {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

const buildDateKey = (date: Date): string => {
  const value = startOfDay(date)
  const year = value.getFullYear()
  const month = `${value.getMonth() + 1}`.padStart(2, "0")
  const day = `${value.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

const countRecordsInRange = async (userId: string, start: Date, end: Date): Promise<number> => {
  const records = await SmokingRecord.find({
    userId,
    timestamp: { $gte: start, $lt: end },
  })
  let checkinTotal = 0
  let manualTotal = 0
  const seenCheckinDays = new Set<string>()

  for (const record of records) {
    const isCheckin = Array.isArray(record.contextTags) && record.contextTags.includes("daily-checkin")
    if (isCheckin) {
      const key = buildDateKey(new Date(record.timestamp))
      if (!seenCheckinDays.has(key)) {
        seenCheckinDays.add(key)
        checkinTotal += Number(record.smokedCount) || 1
      }
    } else {
      manualTotal += Number(record.smokedCount) || 1
    }
  }

  return manualTotal + checkinTotal
}

const calculateStreaks = async (userId: string): Promise<{ currentStreak: number; bestStreak: number }> => {
  const today = startOfDay(new Date())
  const start = await UserProgress.findOne({ userId }).then((p) => (p ? startOfDay(p.startDate) : today))

  const records = await SmokingRecord.find({
    userId,
    timestamp: { $gte: start },
  }).sort({ timestamp: 1 })

  const smokedDateKeys = new Set(records.map((r: any) => buildDateKey(new Date(r.timestamp))))

  let currentStreak = 0
  let cursor = new Date(today)
  while (cursor >= start && !smokedDateKeys.has(buildDateKey(cursor))) {
    currentStreak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  let bestStreak = 0
  let running = 0
  const iter = new Date(start)
  while (iter <= today) {
    if (smokedDateKeys.has(buildDateKey(iter))) {
      bestStreak = Math.max(bestStreak, running)
      running = 0
    } else {
      running += 1
    }
    iter.setDate(iter.getDate() + 1)
  }
  bestStreak = Math.max(bestStreak, running)

  return { currentStreak, bestStreak }
}

const getStreakDays = async (userId: string): Promise<number> => {
  const { currentStreak } = await calculateStreaks(userId)
  return currentStreak
}

const getTotalActivitiesCompleted = async (userId: string): Promise<number> => {
  const plans = await DailyPlan.find({ userId })
  let total = 0
  for (const plan of plans) {
    for (const act of plan.activities) {
      if (act.isCompleted) total += 1
    }
  }
  return total
}

const getTotalCheckins = async (userId: string): Promise<number> => {
  return await DailyCheckin.countDocuments({ userId })
}

const getWeeklyReduction = async (userId: string): Promise<number> => {
  const userProgress = await UserProgress.findOne({ userId })
  if (!userProgress) return 0

  const today = new Date()
  const weekStart = new Date(today)
  const dayOfWeek = (today.getDay() + 6) % 7
  weekStart.setDate(today.getDate() - dayOfWeek)
  weekStart.setHours(0, 0, 0, 0)

  let totalSmokedThisWeek = 0
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart)
    day.setDate(weekStart.getDate() + i)
    const dayEnd = new Date(day)
    dayEnd.setDate(day.getDate() + 1)
    totalSmokedThisWeek += await countRecordsInRange(userId, day, dayEnd)
  }

  const baselineWeekly = Number(userProgress.cigarettesPerDay) * 7
  if (baselineWeekly <= 0) return 0
  const reduction = Math.max(0, ((baselineWeekly - totalSmokedThisWeek) / baselineWeekly) * 100)
  return Math.round(reduction)
}

interface AchievementCalc {
  code: string
  title: string
  description: string
  icon: string
  color: string
  rewardPoints: number
  progress: number
  progressPercentage: number
  unlocked: boolean
  unlockedAt: string | null
}

export const getDynamicAchievements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" })
      return
    }

    const streakDays = await getStreakDays(userId)
    const { bestStreak } = await calculateStreaks(userId)
    const userProgress = await UserProgress.findOne({ userId })
    const gamification = await UserGamification.findOne({ userId })
    const completedAchievements = gamification?.completedAchievements || []

    const moneySaved = Number(userProgress?.moneySaved) || 0
    const totalActivities = await getTotalActivitiesCompleted(userId)
    const totalCheckins = await getTotalCheckins(userId)
    const weeklyReduction = await getWeeklyReduction(userId)

    const isUnlocked = (code: string): boolean => {
      return completedAchievements.some((a: any) => a.code === code)
    }

    const getUnlockedDate = (code: string): string | null => {
      const ach = completedAchievements.find((a: any) => a.code === code)
      return ach ? ach.completedAt?.toISOString?.() || ach.completedAt : null
    }

    const achievements: AchievementCalc[] = [
      {
        code: "first_day",
        title: "Primer día sin fumar",
        description: "Completaste tu primer día sin fumar",
        icon: "calendar_today",
        color: "#4A90D9",
        rewardPoints: 50,
        progress: Math.min(streakDays / 1, 1),
        progressPercentage: Math.min(Math.round((streakDays / 1) * 100), 100),
        unlocked: streakDays >= 1 || isUnlocked("first_day"),
        unlockedAt: getUnlockedDate("first_day"),
      },
      {
        code: "three_days",
        title: "3 días sin fumar",
        description: "3 días consecutivos sin fumar",
        icon: "calendar_view_day",
        color: "#5BA0E8",
        rewardPoints: 75,
        progress: Math.min(streakDays / 3, 1),
        progressPercentage: Math.min(Math.round((streakDays / 3) * 100), 100),
        unlocked: streakDays >= 3 || isUnlocked("three_days"),
        unlockedAt: getUnlockedDate("three_days"),
      },
      {
        code: "first_week",
        title: "1 semana sin fumar",
        description: "Completaste una semana sin fumar",
        icon: "calendar_view_week",
        color: "#6DC9A1",
        rewardPoints: 100,
        progress: Math.min(streakDays / 7, 1),
        progressPercentage: Math.min(Math.round((streakDays / 7) * 100), 100),
        unlocked: streakDays >= 7 || isUnlocked("first_week"),
        unlockedAt: getUnlockedDate("first_week"),
      },
      {
        code: "first_month",
        title: "1 mes sin fumar",
        description: "Completaste un mes sin fumar",
        icon: "calendar_month",
        color: "#F6A623",
        rewardPoints: 200,
        progress: Math.min(streakDays / 30, 1),
        progressPercentage: Math.min(Math.round((streakDays / 30) * 100), 100),
        unlocked: streakDays >= 30 || isUnlocked("first_month"),
        unlockedAt: getUnlockedDate("first_month"),
      },
      {
        code: "money_saved_50",
        title: "Ahorrar $50",
        description: "Has ahorrado $50 al no fumar",
        icon: "savings",
        color: "#F5A623",
        rewardPoints: 50,
        progress: Math.min(moneySaved / 50, 1),
        progressPercentage: Math.min(Math.round((moneySaved / 50) * 100), 100),
        unlocked: moneySaved >= 50 || isUnlocked("money_saved_50"),
        unlockedAt: getUnlockedDate("money_saved_50"),
      },
      {
        code: "money_saved_200",
        title: "Ahorrar $200",
        description: "Has ahorrado $200 al no fumar",
        icon: "account_balance",
        color: "#F5A623",
        rewardPoints: 75,
        progress: Math.min(moneySaved / 200, 1),
        progressPercentage: Math.min(Math.round((moneySaved / 200) * 100), 100),
        unlocked: moneySaved >= 200 || isUnlocked("money_saved_200"),
        unlockedAt: getUnlockedDate("money_saved_200"),
      },
      {
        code: "activities_7",
        title: "Completar 7 actividades",
        description: "Completaste 7 actividades del plan diario",
        icon: "task_alt",
        color: "#7ED321",
        rewardPoints: 50,
        progress: Math.min(totalActivities / 7, 1),
        progressPercentage: Math.min(Math.round((totalActivities / 7) * 100), 100),
        unlocked: totalActivities >= 7 || isUnlocked("activities_7"),
        unlockedAt: getUnlockedDate("activities_7"),
      },
      {
        code: "activities_30",
        title: "Completar 30 actividades",
        description: "Completaste 30 actividades del plan diario",
        icon: "assignment_turned_in",
        color: "#7ED321",
        rewardPoints: 100,
        progress: Math.min(totalActivities / 30, 1),
        progressPercentage: Math.min(Math.round((totalActivities / 30) * 100), 100),
        unlocked: totalActivities >= 30 || isUnlocked("activities_30"),
        unlockedAt: getUnlockedDate("activities_30"),
      },
      {
        code: "checkins_7",
        title: "Registrar 7 check-ins",
        description: "Registraste 7 check-ins diarios",
        icon: "fact_check",
        color: "#B088F9",
        rewardPoints: 50,
        progress: Math.min(totalCheckins / 7, 1),
        progressPercentage: Math.min(Math.round((totalCheckins / 7) * 100), 100),
        unlocked: totalCheckins >= 7 || isUnlocked("checkins_7"),
        unlockedAt: getUnlockedDate("checkins_7"),
      },
      {
        code: "reduction_50",
        title: "Reducir consumo semanal 50%",
        description: "Redujiste tu consumo semanal de tabaco en un 50%",
        icon: "trending_down",
        color: "#F08A84",
        rewardPoints: 100,
        progress: Math.min(weeklyReduction / 50, 1),
        progressPercentage: Math.min(Math.round((weeklyReduction / 50) * 100), 100),
        unlocked: weeklyReduction >= 50 || isUnlocked("reduction_50"),
        unlockedAt: getUnlockedDate("reduction_50"),
      },
    ]

    const motivationPoints = gamification?.motivationPoints || 0

    res.status(200).json({
      success: true,
      data: achievements,
      motivationPoints,
    })
  } catch (err) {
    const error = err as Error
    console.error("[achievements] Error getting dynamic achievements:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener logros dinámicos",
      error: error.message,
    })
  }
}
