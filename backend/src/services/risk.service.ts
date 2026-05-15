import DailyCheckin from "../models/DailyCheckin"
import DailyPlan from "../models/DailyPlan"
import RiskSnapshot from "../models/RiskSnapshot"
import SmokingRecord from "../models/SmokingRecord"
import UserProgress from "../models/UserProgress"

export interface RiskResult {
  level: "bajo" | "moderado" | "alto"
  score: number
  factors: string[]
}

const startOfDay = (date: Date): Date => {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

const endOfDay = (date: Date): Date => {
  const value = startOfDay(date)
  value.setDate(value.getDate() + 1)
  return value
}

export const calculateRisk = async (userId: string): Promise<RiskResult> => {
  const today = new Date()
  const [checkin, progress, smokingRecords, dailyPlan] = await Promise.all([
    DailyCheckin.findOne({
      userId,
      date: { $gte: startOfDay(today), $lt: endOfDay(today) },
    }).sort({ updatedAt: -1 }),
    UserProgress.findOne({ userId }),
    SmokingRecord.find({ userId, timestamp: { $gte: startOfDay(today), $lt: endOfDay(today) } }),
    DailyPlan.findOne({ userId, date: { $gte: startOfDay(today), $lt: endOfDay(today) } }),
  ])

  let score = 0
  const factors: string[] = []
  const cravingLevel = Number(checkin?.cravingLevel) || 0
  const negativeMoods = new Set(["triste", "terrible", "ansioso", "estresado", "mal"])
  const smokedToday = smokingRecords.length > 0 || checkin?.smokedToday === true
  const incompleteActivities = Array.isArray((dailyPlan as any)?.activities)
    ? (dailyPlan as any).activities.filter((activity: any) => !activity.isCompleted).length
    : 0

  if (cravingLevel >= 7) {
    score += 35
    factors.push("antojo alto")
  } else if (cravingLevel >= 4) {
    score += 20
    factors.push("antojo moderado")
  }

  if (smokedToday) {
    score += 35
    factors.push("registro de cigarro hoy")
  }

  if (negativeMoods.has(String(checkin?.mood || "").toLowerCase())) {
    score += 15
    factors.push("estado emocional vulnerable")
  }

  if ((Number(progress?.daysWithoutSmoking) || 0) <= 1) {
    score += 10
    factors.push("racha actual corta")
  }

  if (incompleteActivities > 0) {
    score += 5
    factors.push("actividades pendientes del plan")
  }

  const boundedScore = Math.min(score, 100)
  const level = boundedScore >= 65 ? "alto" : boundedScore >= 30 ? "moderado" : "bajo"
  return { level, score: boundedScore, factors }
}

export const saveRiskSnapshot = async (userId: string): Promise<void> => {
  try {
    const today = new Date()
    const year = today.getFullYear()
    const month = `${today.getMonth() + 1}`.padStart(2, "0")
    const day = `${today.getDate()}`.padStart(2, "0")
    const dateKey = `${year}-${month}-${day}`

    const [checkin, progress, smokingRecords, dailyPlan] = await Promise.all([
      DailyCheckin.findOne({
        userId,
        date: { $gte: startOfDay(today), $lt: endOfDay(today) },
      }).sort({ updatedAt: -1 }),
      UserProgress.findOne({ userId }),
      SmokingRecord.find({ userId, timestamp: { $gte: startOfDay(today), $lt: endOfDay(today) } }),
      DailyPlan.findOne({ userId, date: { $gte: startOfDay(today), $lt: endOfDay(today) } }),
    ])

    const risk = await calculateRisk(userId)
    const planActivities = Array.isArray((dailyPlan as any)?.activities)
      ? (dailyPlan as any).activities
      : []
    const completedCount = planActivities.filter((a: any) => a.isCompleted).length

    await RiskSnapshot.findOneAndUpdate(
      { userId, dateKey },
      {
        userId,
        dateKey,
        riskLevel: risk.level,
        riskScore: risk.score,
        factors: risk.factors,
        cravingLevel: Number(checkin?.cravingLevel) || 0,
        mood: checkin?.mood || "",
        smokedToday: smokingRecords.length > 0 || checkin?.smokedToday === true,
        currentStreak: Number(progress?.daysWithoutSmoking) || 0,
        completedActivities: completedCount,
      },
      { upsert: true, new: true },
    )

    console.log("[risk] Snapshot saved", { userId, dateKey, riskLevel: risk.level, riskScore: risk.score })
  } catch (err) {
    console.error("[risk] Error saving snapshot:", err)
  }
}
