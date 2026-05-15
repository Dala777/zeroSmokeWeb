import type { Request, Response } from "express"
import UserProgress from "../models/UserProgress"
import DailyPlan from "../models/DailyPlan"
import DailyCheckin from "../models/DailyCheckin"
import SmokingRecord from "../models/SmokingRecord"
import UserGamification from "../models/UserGamification"
import { Plan } from "../models/Plan"
import { UserPlan } from "../models/UserPlan"
import { ensureUserPlanForProgress, normalizePlanLevels } from "../services/userPlan.service"
import { saveRiskSnapshot } from "../services/risk.service"
import { v4 as uuidv4 } from "uuid"
import { createHash } from "crypto"
import fs from "fs"
import path from "path"

const getLegacyValue = (entry: any, keys: string[]): any => {
  for (const key of keys) {
    if (entry && entry[key] !== undefined) {
      return entry[key]
    }
  }
  return undefined
}

const toNonEmptyText = (value: unknown): string => {
  return typeof value === "string" ? value.trim() : ""
}

const normalizeStatKey = (value: unknown): string => {
  if (typeof value !== "string") return ""
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
}

const formatStatLabel = (key: string): string => {
  return key
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

const addNormalizedStat = (source: Map<string, number>, value: unknown, amount = 1): void => {
  const key = normalizeStatKey(value)
  if (!key) return
  source.set(key, (source.get(key) || 0) + amount)
}

const buildLegacyActivityDescription = (mainTitle: string, secondaryTitle: string, justification: string): string => {
  if (justification) return justification
  if (secondaryTitle) return `Actividad secundaria sugerida: ${secondaryTitle}`
  if (mainTitle) return `Completa esta actividad del plan diario: ${mainTitle}`
  return "Completa esta actividad de tu plan diario."
}

const calculateDayFromStartDate = (startDate: Date, targetDate: Date): number => {
  const start = new Date(startDate)
  const target = new Date(targetDate)
  start.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.floor((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

const getLegacyDailyPlanDay = async (userId: string, targetDate: Date, userProgress?: any): Promise<number> => {
  const userPlan = await UserPlan.findOne({ userId, isCompleted: false }).populate("planId")
  if (userPlan) {
    const rawDay = calculateDayFromStartDate(new Date(userPlan.startDate), targetDate)
    const duration = Number((userPlan.planId as any)?.duration || 0)
    if (duration > 0) {
      return Math.min(Math.max(rawDay, 1), duration)
    }
    return Math.max(rawDay, 1)
  }

  const progress = userProgress || await UserProgress.findOne({ userId })
  return progress ? progress.daysWithoutSmoking + 1 : 1
}

const formatDailyPlanResponse = (dailyPlan: any): any => {
  const plain = typeof dailyPlan.toObject === "function" ? dailyPlan.toObject() : dailyPlan
  return {
    ...plain,
    id: plain.id || plain._id?.toString?.() || plain._id,
    userId: plain.userId?.toString?.() || plain.userId,
  }
}

const getMondayFirstDayIndex = (date: Date): number => {
  return (date.getDay() + 6) % 7
}

const getValidDate = (value?: string | Date): Date => {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number)
    return new Date(year, month - 1, day)
  }
  const date = value ? new Date(value) : new Date()
  return Number.isNaN(date.getTime()) ? new Date() : date
}

const normalizeDailyCigarettes = (dailyCigarettes?: number[]): number[] => {
  const normalized = Array.isArray(dailyCigarettes) ? [...dailyCigarettes] : []
  while (normalized.length < 7) {
    normalized.push(0)
  }
  return normalized.slice(0, 7).map((count) => Number(count) || 0)
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

const startOfWeek = (date: Date): Date => {
  const value = startOfDay(date)
  value.setDate(value.getDate() - getMondayFirstDayIndex(value))
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
  }).sort({ updatedAt: -1, timestamp: -1 })
  const checkinRecordsByDay = new Map<string, any>()
  let manualTotal = 0

  records.forEach((record: any) => {
    const isCheckinRecord = Array.isArray(record.contextTags) && record.contextTags.includes("daily-checkin")
    if (!isCheckinRecord) {
      manualTotal += Number(record.smokedCount) || 1
      return
    }

    const key = buildDateKey(new Date(record.timestamp))
    if (!checkinRecordsByDay.has(key)) {
      checkinRecordsByDay.set(key, record)
    }
  })

  const checkinTotal = [...checkinRecordsByDay.values()]
    .reduce((total: number, record: any) => total + (Number(record.smokedCount) || 1), 0)
  return manualTotal + checkinTotal
}

const calculateStreaksFromSmokingRecords = async (userId: string, startDate: Date): Promise<{ currentStreak: number; bestStreak: number }> => {
  const today = startOfDay(new Date())
  const start = startOfDay(startDate || new Date())
  const records = await SmokingRecord.find({
    userId,
    timestamp: { $gte: start },
  }).sort({ timestamp: 1 })

  const smokedDateKeys = new Set(records.map((record: any) => buildDateKey(new Date(record.timestamp))))
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

const getActivePlanProgress = async (userId: string): Promise<{ currentDay: number; totalDays: number; planProgress: number; planStartDate: Date | null }> => {
  const userPlan = await UserPlan.findOne({ userId, isCompleted: false }).populate("planId")
  if (!userPlan) return { currentDay: 0, totalDays: 0, planProgress: 0, planStartDate: null }

  const totalDays = Number((userPlan.planId as any)?.durationDays || (userPlan.planId as any)?.duration || 0)
  const computedDay = calculateDayFromStartDate(new Date(userPlan.startDate), new Date())
  const currentDay = totalDays > 0 ? Math.min(Math.max(computedDay, 1), totalDays) : Math.max(computedDay, 1)
  if (userPlan.currentDay !== currentDay) {
    userPlan.currentDay = currentDay
    await userPlan.save()
  }
  return {
    currentDay,
    totalDays,
    planProgress: totalDays > 0 ? Math.min(currentDay / totalDays, 1) : 0,
    planStartDate: userPlan.startDate,
  }
}

const buildWeeklyProgress = async (userId: string, userProgress: any): Promise<any> => {
  const weekStart = startOfWeek(new Date())
  const dailyCigarettes: number[] = []
  for (let index = 0; index < 7; index += 1) {
    const day = new Date(weekStart)
    day.setDate(weekStart.getDate() + index)
    dailyCigarettes.push(await countRecordsInRange(userId, day, endOfDay(day)))
  }

  const totalSmoked = dailyCigarettes.reduce((total, count) => total + count, 0)
  const baselineDaily = Math.max(Number(userProgress.cigarettesPerDay) || 0, 0)
  const baselineExpected = baselineDaily * 7
  const cigarettesAvoided = Math.max(baselineExpected - totalSmoked, 0)
  const reductionPercentage = baselineExpected > 0 ? Math.round((cigarettesAvoided / baselineExpected) * 100) : 0

  return {
    weekStart,
    dailyCigarettes,
    weeklyGoal: baselineExpected,
    baselineExpected,
    totalSmoked,
    cigarettesAvoided,
    reductionPercentage,
    label: `${cigarettesAvoided} evitados de ${baselineExpected} esperados`,
  }
}

const getGamification = async (userId: string): Promise<any> => {
  return await UserGamification.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, motivationPoints: 0, completedAchievements: [] } },
    { upsert: true, new: true },
  )
}

const awardGamification = async (
  userId: string,
  code: string,
  title: string,
  points: number,
  source: string,
  description?: string,
): Promise<void> => {
  const gamification = await getGamification(userId)
  gamification.completedAchievements = gamification.completedAchievements.filter((achievement: any) => {
    return typeof achievement.code === "string" && achievement.code.length <= 60
  })
  const safeCode = code.length > 60 ? compactCode("ach", code) : code
  const exists = gamification.completedAchievements.some((achievement: any) => achievement.code === safeCode)
  if (exists) return
  gamification.completedAchievements.push({
    code: safeCode,
    title,
    description,
    completedAt: new Date(),
    pointsAwarded: points,
    source,
  })
  gamification.motivationPoints += points
  await gamification.save()
}

const compactCode = (prefix: string, ...parts: Array<string | number | undefined | null>): string => {
  const raw = parts.filter((part) => part !== undefined && part !== null).join(":")
  const hash = createHash("sha1").update(raw).digest("hex").slice(0, 16)
  return `${prefix}_${hash}`
}

const getCheckinInsights = async (userId: string): Promise<{ emotions: any[]; symptoms: any[] }> => {
  const since = new Date()
  since.setDate(since.getDate() - 30)
  const checkins = await DailyCheckin.find({ userId, date: { $gte: since } }).sort({ updatedAt: -1 })
  const smokingRecords = await SmokingRecord.find({ userId, timestamp: { $gte: since } }).sort({ timestamp: -1 })
  const emotionCounts = new Map<string, number>()
  const symptomCounts = new Map<string, number>()
  const latestCheckinByDay = new Map<string, any>()

  checkins.forEach((checkin: any) => {
    const key = checkin.dateKey || buildDateKey(new Date(checkin.date))
    if (!latestCheckinByDay.has(key)) {
      latestCheckinByDay.set(key, checkin)
    }
  })

  latestCheckinByDay.forEach((checkin: any) => {
    addNormalizedStat(emotionCounts, checkin.mood)
    ;(checkin.symptoms || []).forEach((symptom: string) => {
      addNormalizedStat(symptomCounts, symptom)
    })
  })

  smokingRecords.forEach((record: any) => {
    const emotions = Array.isArray(record.emotions) && record.emotions.length
      ? record.emotions
      : record.emotion
        ? [record.emotion]
        : []
    emotions.forEach((emotion: string) => addNormalizedStat(emotionCounts, emotion))
    const symptoms = Array.isArray(record.physicalSymptoms) && record.physicalSymptoms.length
      ? record.physicalSymptoms
      : Array.isArray(record.symptoms)
        ? record.symptoms
        : []
    symptoms.forEach((symptom: string) => addNormalizedStat(symptomCounts, symptom))
  })

  const toSortedStats = (source: Map<string, number>) =>
    [...source.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name: formatStatLabel(name), count }))

  return {
    emotions: toSortedStats(emotionCounts),
    symptoms: toSortedStats(symptomCounts),
  }
}

const syncProgressMetrics = async (userId: string, userProgress: any): Promise<any> => {
  const today = startOfDay(new Date())
  const cigarettesSmokedToday = await countRecordsInRange(userId, today, endOfDay(today))
  const streaks = await calculateStreaksFromSmokingRecords(userId, userProgress.startDate)
  const weekly = await buildWeeklyProgress(userId, userProgress)
  const plan = await getActivePlanProgress(userId)
  const gamification = await getGamification(userId)
  const insights = await getCheckinInsights(userId)

  userProgress.daysWithoutSmoking = streaks.currentStreak
  userProgress.bestStreak = Math.max(Number(userProgress.bestStreak) || 0, streaks.bestStreak)
  userProgress.cigarettesAvoided = weekly.cigarettesAvoided
  userProgress.moneySaved = ((weekly.cigarettesAvoided / 20) * (Number(userProgress.packagePrice) || 0))
  userProgress.healthProgress = plan.planProgress
  userProgress.weeklyData = [weekly]
  await userProgress.save()

  return {
    cigarettesSmokedToday,
    bestStreak: userProgress.bestStreak,
    weekly,
    plan,
    gamification,
    insights,
  }
}

const buildProgressResponse = async (userId: string, userProgress: any): Promise<any> => {
  const metrics = await syncProgressMetrics(userId, userProgress)
  const plain = typeof userProgress.toObject === "function" ? userProgress.toObject() : userProgress
  return {
    ...plain,
    cigarettesSmokedToday: metrics.cigarettesSmokedToday,
    bestStreak: metrics.bestStreak,
    planCurrentDay: metrics.plan.currentDay,
    planTotalDays: metrics.plan.totalDays,
    planProgress: metrics.plan.planProgress,
    planStartDate: metrics.plan.planStartDate,
    motivationPoints: metrics.gamification.motivationPoints,
    completedGamification: metrics.gamification.completedAchievements,
    emotionStats: metrics.insights.emotions,
    symptomStats: metrics.insights.symptoms,
  }
}

const LEGACY_PLAN_FIELDS = {
  day: ["D\u00eda", "Dia", "day"],
  mainActivity: ["Actividad Principal", "Actividades"],
  secondaryActivity: ["Actividad Secundaria (opcional)", "Actividad Secundaria"],
  justification: ["Justificaci\u00f3n", "Respaldo cient\u00edfico", "Fundamento"],
}

const readJsonFileWithoutBom = (filePath: string): any => {
  let text = fs.readFileSync(filePath, "utf8")
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1)
  }
  return JSON.parse(text)
}

// cargar configuracion de planes una sola vez
let planConfig: any = null
try {
  const configPath = path.join(__dirname, "../config/planes_zerosmoke.json")
  console.log("Cargando configuracion de planes desde", configPath)
  planConfig = readJsonFileWithoutBom(configPath)
  console.log("Configuracion de planes cargada, planes disponibles:", planConfig?.planes_zerosmoke?.length)
} catch (err) {
  console.error("Error loading plan config:", err)
}

// obtiene array de días para un nivel de dependencia
const getDaysForPlan = (dependencyLevel: string): Array<any> => {
  if (!planConfig || !Array.isArray(planConfig.planes_zerosmoke)) return []
  const lvl = dependencyLevel.toLowerCase()
  let planEntry = planConfig.planes_zerosmoke.find((p: any) => {
    if (lvl.includes("leve") || lvl.includes("baja")) return p.plan === "PLAN 1"
    if (lvl.includes("moder")) return p.plan === "PLAN 2"
    if (lvl.includes("alta") || lvl.includes("severo")) return p.plan === "PLAN 3"
    return false
  })
  if (!planEntry) return []
  let days: any[] = []
  planEntry.sections.forEach((sec: any) => {
    if (Array.isArray(sec.days)) days = days.concat(sec.days)
  })
  return days
}

// obtener actividades según día y nivel (retorna una única actividad principal con posible secundaria)
const getConfigActivities = (dayNumber: number, dependencyLevel: string): Array<any> | null => {
  const days = getDaysForPlan(dependencyLevel)
  const dayObj = days.find(d => String(getLegacyValue(d, LEGACY_PLAN_FIELDS.day)) === String(dayNumber))
  if (!dayObj) {
    console.log(`No hay configuración para día ${dayNumber} (dependencia ${dependencyLevel})`) // debug
    return null
  }

  const mainTitle = toNonEmptyText(getLegacyValue(dayObj, LEGACY_PLAN_FIELDS.mainActivity))
  // la clave secundaria puede variar en el json entre con o sin "(opcional)"
  const secondaryTitle = toNonEmptyText(getLegacyValue(dayObj, LEGACY_PLAN_FIELDS.secondaryActivity))
  const justification = toNonEmptyText(getLegacyValue(dayObj, LEGACY_PLAN_FIELDS.justification))

  const acts: Array<any> = []
  if (mainTitle) {
    const activity: any = {
      title: mainTitle,
      description: buildLegacyActivityDescription(mainTitle, secondaryTitle, justification),
      type: 'exercise',
      durationMinutes: 10,
      justification,
    }
    if (secondaryTitle) {
      activity.secondary = {
        title: secondaryTitle,
        isOptional: true,
      }
    }
    acts.push(activity)
  }

  return acts
}

// Extendemos el tipo Request para incluir el userId
interface AuthRequest extends Request {
  userId?: string
}

// Guardar resultados del test inicial
export const saveInitialTest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      })
      return
    }

    // Verificar si ya existe un progreso para este usuario
    const existingProgress = await UserProgress.findOne({ userId })
    if (existingProgress) {
      res.status(400).json({
        success: false,
        message: "Ya existe un test inicial para este usuario",
      })
      return
    }

    let { cigarettesPerDay, packagePrice, dependencyLevel, motivations, fagerstromScore } = req.body

    // Normalizar nivel de dependencia para que coincida con el enum interno
    const normalizeLevel = (lvl: string): string => {
      if (!lvl) return lvl
      const lower = lvl.toLowerCase()
      if (lower.includes('baja') || lower === 'leve') return 'Leve'
      if (lower.includes('moderada') || lower === 'moderado') return 'Moderado'
      if (lower.includes('alta') || lower === 'severo') return 'Severo'
      return lvl
    }
    dependencyLevel = normalizeLevel(dependencyLevel)

    // Crear nuevo progreso
    const userProgress = new UserProgress({
      userId,
      startDate: new Date(),
      cigarettesPerDay,
      packagePrice,
      dependencyLevel,
      fagerstromScore: fagerstromScore || 0,
      motivations,
      daysWithoutSmoking: 0,
      cigarettesAvoided: 0,
      moneySaved: 0,
      healthProgress: 0,
      achievements: {
        firstDay: {
          title: "Primer día sin fumar",
          description: "Completaste tu primer día sin fumar",
          completed: false
        },
        firstWeek: {
          title: "Una semana sin fumar",
          description: "Completaste una semana sin fumar",
          completed: false
        },
        firstMonth: {
          title: "Un mes sin fumar",
          description: "Completaste un mes sin fumar",
          completed: false,
          progress: 0
        },
        moneySaved: {
          title: "Ahorrar $200",
          description: "Has ahorrado $200 al no fumar",
          completed: false,
          progress: 0
        }
      },
      weeklyData: [{
        weekStart: new Date(),
        dailyCigarettes: [0, 0, 0, 0, 0, 0, 0],
        weeklyGoal: cigarettesPerDay * 7,
        totalSmoked: 0
      }]
    })

    await userProgress.save()

    // Asignar un plan concreto si existe en la coleccion Plan y sincronizar UserPlan
    try {
      const score = fagerstromScore || 0
      const lvl = normalizePlanLevels(dependencyLevel, score).plan
      // buscar plan que corresponda al nivel y rango de Fagerström
      const planDoc = await Plan.findOne({
        dependencyLevel: lvl,
        isActive: true,
        "fagerstromRange.min": { $lte: score },
        "fagerstromRange.max": { $gte: score },
      })
      if (planDoc) {
        userProgress.assignedPlan = planDoc._id.toString();
        await userProgress.save()
      }
      await ensureUserPlanForProgress(userId, userProgress)
    } catch (err) {
      console.warn("No se pudo asignar plan automático:", err)
    }

    // Crear el primer plan diario
    await createInitialDailyPlan(userId)

    // volver a cargar el progreso para incluir el plan poblado
    const resultProgress = await UserProgress.findById(userProgress._id).populate('assignedPlan')

    res.status(201).json({
      success: true,
      message: "Test inicial guardado correctamente",
      data: resultProgress,
    })
  } catch (err) {
    const error = err as Error
    console.error("Error al guardar test inicial:", error)
    res.status(500).json({
      success: false,
      message: "Error al guardar el test inicial",
      error: error.message,
    })
  }
}

// Obtener progreso del usuario
export const getUserProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      })
      return
    }

    // incluir datos del plan asignado
    const userProgress = await UserProgress.findOne({ userId }).populate('assignedPlan')
    if (!userProgress) {
      res.status(404).json({
        success: false,
        message: "No se encontró progreso para este usuario",
      })
      return
    }

    res.status(200).json({
      success: true,
      message: "Progreso obtenido correctamente",
      data: await buildProgressResponse(userId, userProgress),
    })
  } catch (err) {
    const error = err as Error
    console.error("Error al obtener progreso:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener el progreso",
      error: error.message,
    })
  }
}

// Actualizar progreso del usuario
export const updateUserProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      })
      return
    }

    const userProgress = await UserProgress.findOne({ userId })
    if (!userProgress) {
      res.status(404).json({
        success: false,
        message: "No se encontró progreso para este usuario",
      })
      return
    }

    // Actualizar campos
    const updatedFields = req.body

    // Forma segura de actualizar campos
    const allowedFields = [
      "cigarettesPerDay",
      "packagePrice",
      "cigarettesAvoided",
      "moneySaved",
      "daysWithoutSmoking",
      "healthProgress",
      "dependencyLevel",
      "fagerstromScore",
      "motivations",
      "healthMetrics",
      "achievements",
    ]

    // cuando se actualiza el nivel, también normalizamos
    const normalizeLevel = (lvl: string): string => {
      if (!lvl) return lvl
      const lower = lvl.toLowerCase()
      if (lower.includes('baja') || lower === 'leve') return 'Leve'
      if (lower.includes('moderada') || lower === 'moderado') return 'Moderado'
      if (lower.includes('alta') || lower === 'severo') return 'Severo'
      return lvl
    }

    let dependencyChanged = false
    allowedFields.forEach((field) => {
      if (updatedFields[field] !== undefined) {
        // Normalizar antes de asignar
        const value = field === 'dependencyLevel' ? normalizeLevel(updatedFields[field]) : updatedFields[field]
        ;(userProgress as any)[field] = value
        if (field === 'dependencyLevel') {
          dependencyChanged = true
        }
      }
    })

    // si cambió el nivel de dependencia, buscamos un nuevo plan correspondiente
    if (dependencyChanged) {
      try {
        const lvl = normalizePlanLevels(userProgress.dependencyLevel, userProgress.fagerstromScore || 0).plan
        // también podría filtrarse por score si existe
        const planDoc = await Plan.findOne({ dependencyLevel: lvl, isActive: true })
        if (planDoc) {
          userProgress.assignedPlan = planDoc._id.toString();
        }
      } catch (err) {
        console.warn('Error al reasignar plan tras actualización:', err)
      }
    }

    await userProgress.save()

    try {
      await ensureUserPlanForProgress(userId, userProgress)
    } catch (err) {
      console.warn("No se pudo sincronizar UserPlan tras actualizar progreso:", err)
    }

    res.status(200).json({
      success: true,
      message: "Progreso actualizado correctamente",
      data: await buildProgressResponse(userId, userProgress),
    })
  } catch (err) {
    const error = err as Error
    console.error("Error al actualizar progreso:", error)
    res.status(500).json({
      success: false,
      message: "Error al actualizar el progreso",
      error: error.message,
    })
  }
}

// Guardar registro de cigarrillo
export const saveSmokingRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      })
      return
    }

    const { timestamp, emotion, symptoms, note } = req.body

    const smokingRecord = new SmokingRecord({
      userId,
      timestamp: timestamp || new Date(),
      emotion,
      symptoms,
      note,
    })

    await smokingRecord.save()

    saveRiskSnapshot(userId).catch((err) => console.warn("[risk] snapshot after smoking record failed:", err))

    // Actualizar datos semanales
    const userProgress = await UserProgress.findOne({ userId })
    
    if (userProgress) {
      // Asegurarse de que hay datos semanales
      if (!userProgress.weeklyData || userProgress.weeklyData.length === 0) {
        userProgress.weeklyData = [{
          weekStart: new Date(),
          dailyCigarettes: [0, 0, 0, 0, 0, 0, 0],
          weeklyGoal: userProgress.cigarettesPerDay * 7,
          totalSmoked: 0
        }];
      }
      
      // Obtener el día de la semana alineado con Flutter (0 = Lunes, 6 = Domingo)
      const recordDate = getValidDate(timestamp);
      const dayOfWeek = getMondayFirstDayIndex(recordDate);
      
      // Incrementar el contador del día
      userProgress.weeklyData[0].dailyCigarettes = normalizeDailyCigarettes(userProgress.weeklyData[0].dailyCigarettes);
      userProgress.weeklyData[0].dailyCigarettes[dayOfWeek]++;
      userProgress.weeklyData[0].totalSmoked++;
      
      await userProgress.save();
    }

    res.status(201).json({
      success: true,
      message: "Registro guardado correctamente",
      data: smokingRecord,
    })
  } catch (err) {
    const error = err as Error
    console.error("Error al guardar registro:", error)
    res.status(500).json({
      success: false,
      message: "Error al guardar el registro",
      error: error.message,
    })
  }
}

// Obtener plan diario
export const getDailyPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      })
      return
    }

    const dateStr = req.query.date as string

    let queryDate: Date
    if (dateStr) {
      queryDate = new Date(dateStr)
    } else {
      queryDate = new Date()
    }

    // Establecer hora a 00:00:00 para comparar solo la fecha
    queryDate.setHours(0, 0, 0, 0)

    // Buscar plan para la fecha especificada
    let dailyPlan = await DailyPlan.findOne({
      userId,
      date: {
        $gte: queryDate,
        $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000),
      },
    })
    const userProgress = await UserProgress.findOne({ userId })
    const expectedDayNumber = await getLegacyDailyPlanDay(userId, queryDate, userProgress)

    // Si ya existía, comprobar si coincide con la configuración actual
    if (dailyPlan) {
      try {
        const dependency = userProgress ? userProgress.dependencyLevel : 'Moderado'
        const configActs = getConfigActivities(expectedDayNumber, dependency)
        if (configActs && configActs.length > 0) {
          const firstConfig = configActs[0].title || ''
          // si el título principal almacenado difiere del configurado, regeneramos
          if (dailyPlan.dayNumber !== expectedDayNumber || !dailyPlan.activities.some((act: any) => act.title === firstConfig)) {
            console.log(
              `Plan diario existente (día ${dailyPlan.dayNumber}) no coincide con config día ${expectedDayNumber}, regenerando`
            )
            // eliminar el plan antiguo para evitar duplicados
            await DailyPlan.deleteOne({ _id: dailyPlan._id })
            dailyPlan = await createDailyPlan(userId, queryDate, expectedDayNumber)
          }
        }
      } catch (e) {
        console.warn('Error verificando plan contra configuración:', e)
      }
    }

    // Si no existe, crear uno nuevo
    if (!dailyPlan) {
      dailyPlan = await createDailyPlan(userId, queryDate, expectedDayNumber)
    }

    res.status(200).json({
      success: true,
      message: "Plan diario obtenido correctamente",
      data: formatDailyPlanResponse(dailyPlan),
    })
  } catch (err) {
    const error = err as Error
    console.error("Error al obtener plan diario:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener el plan diario",
      error: error.message,
    })
  }
}

// Marcar actividad como completada
export const completeActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      })
      return
    }

    const { planId, activityId } = req.params

    const dailyPlan = await DailyPlan.findOne({
      _id: planId,
      userId,
    })

    if (!dailyPlan) {
      res.status(404).json({
        success: false,
        message: "Plan diario no encontrado",
      })
      return
    }

    // Buscar la actividad y marcarla como completada
    const activity = dailyPlan.activities.find((act: any) => act.id === activityId)
    if (!activity) {
      res.status(404).json({
        success: false,
        message: "Actividad no encontrada",
      })
      return
    }

    const wasCompleted = activity.isCompleted
    activity.isCompleted = true

    saveRiskSnapshot(userId).catch((err) => console.warn("[risk] snapshot after activity failed:", err))

    if (!wasCompleted) {
      await awardGamification(
        userId,
        compactCode("act", dailyPlan._id?.toString(), activityId),
        "Actividad completada",
        10,
        "daily-plan",
        activity.title,
      )
    }

    // Verificar si todas las actividades están completadas
    const allCompleted = dailyPlan.activities.every((act: any) => act.isCompleted)
    if (allCompleted) {
      dailyPlan.isCompleted = true

      // Actualizar progreso del usuario
      await updateProgressOnPlanCompletion(userId, dailyPlan.dayNumber)
    }

    await dailyPlan.save()

    const updatedProgress = await UserProgress.findOne({ userId })

    res.status(200).json({
      success: true,
      message: "Actividad marcada como completada",
      data: {
        ...formatDailyPlanResponse(dailyPlan),
        progress: updatedProgress ? await buildProgressResponse(userId, updatedProgress) : null,
      },
    })
  } catch (err) {
    const error = err as Error
    console.error("Error al completar actividad:", error)
    res.status(500).json({
      success: false,
      message: "Error al completar la actividad",
      error: error.message,
    })
  }
}

// Guardar check-in diario persistente
export const saveDailyCheckin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" })
      return
    }

    const { mood, cravingLevel, smokedToday, symptoms, physicalSymptoms, note, date, cigarettesSmokedCount } = req.body
    const checkinDate = getValidDate(date)
    const dayStart = startOfDay(checkinDate)
    const dayEnd = endOfDay(checkinDate)
    const payload = {
      userId,
      date: checkinDate,
      dateKey: buildDateKey(checkinDate),
      mood: toNonEmptyText(mood) || "normal",
      cravingLevel: Math.min(Math.max(Number(cravingLevel) || 0, 0), 10),
      smokedToday: Boolean(smokedToday),
      cigarettesSmokedCount: Boolean(smokedToday) ? Math.max(Number(cigarettesSmokedCount) || 0, 0) : 0,
      symptoms: Array.isArray(symptoms) ? symptoms : Array.isArray(physicalSymptoms) ? physicalSymptoms : [],
      note: toNonEmptyText(note),
    }

    const existingByDateKey = await DailyCheckin.findOne({ userId, dateKey: payload.dateKey })
    const existingByDay = existingByDateKey
      ? null
      : await DailyCheckin.findOne({
        userId,
        date: { $gte: dayStart, $lt: dayEnd },
      }).sort({ updatedAt: -1 })
    const existingCheckin = existingByDateKey || existingByDay
    const autoCheckinRecord = await SmokingRecord.findOne({
      userId,
      timestamp: { $gte: dayStart, $lt: dayEnd },
      contextTags: "daily-checkin",
    })
    const manualRecordsToday = await SmokingRecord.countDocuments({
      userId,
      timestamp: { $gte: dayStart, $lt: dayEnd },
      contextTags: { $ne: "daily-checkin" },
    })

    if (payload.smokedToday) {
      const smokingPayload = {
        userId,
        timestamp: checkinDate,
        emotion: payload.mood,
        symptoms: payload.symptoms,
        note: payload.note,
        smokedCount: Math.max(payload.cigarettesSmokedCount || 1, 1),
        contextTags: ["daily-checkin"],
      }
      if (autoCheckinRecord) {
        autoCheckinRecord.set(smokingPayload)
        await autoCheckinRecord.save()
      } else if (manualRecordsToday === 0) {
        await new SmokingRecord(smokingPayload).save()
      }
    } else if (autoCheckinRecord) {
      await autoCheckinRecord.deleteOne()
    }

    const checkin = existingCheckin
      ? await DailyCheckin.findByIdAndUpdate(existingCheckin._id, payload, { new: true, runValidators: true })
      : await new DailyCheckin(payload).save()
    console.log("[daily-checkin/save]", {
      userId,
      dateKey: payload.dateKey,
      timezoneOffsetMinutes: checkinDate.getTimezoneOffset(),
      updatedExisting: Boolean(existingCheckin),
      checkinId: checkin?._id?.toString?.(),
      smokedToday: payload.smokedToday,
      manualRecordsToday,
      hasAutoCheckinRecord: Boolean(autoCheckinRecord),
    })

    const userProgress = await UserProgress.findOne({ userId })
    const progress = userProgress ? await buildProgressResponse(userId, userProgress) : null

    saveRiskSnapshot(userId).catch((err) => console.warn("[risk] snapshot after checkin failed:", err))

    res.status(200).json({
      success: true,
      message: "Check-in diario guardado correctamente",
      hasCheckin: true,
      checkin,
      data: { checkin, progress },
    })
  } catch (err) {
    const error = err as Error
    console.error("Error al guardar check-in diario:", error)
    res.status(500).json({
      success: false,
      message: "Error al guardar el check-in diario",
      error: error.message,
    })
  }
}

// Obtener check-in de hoy
export const getTodayDailyCheckin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" })
      return
    }

    const today = new Date()
    const todayKey = buildDateKey(today)
    const checkin = await DailyCheckin.findOne({
      userId,
      $or: [
        { dateKey: todayKey },
        { date: { $gte: startOfDay(today), $lt: endOfDay(today) } },
      ],
    }).sort({ updatedAt: -1 })
    console.log("[daily-checkin/today]", {
      userId,
      todayKey,
      timezoneOffsetMinutes: today.getTimezoneOffset(),
      hasCheckin: Boolean(checkin),
      checkinId: checkin?._id?.toString?.(),
      checkinDateKey: checkin?.dateKey,
    })
    res.status(200).json({
      success: true,
      message: checkin ? "Check-in diario obtenido correctamente" : "No hay check-in para hoy",
      hasCheckin: Boolean(checkin),
      checkin,
      data: checkin,
      dateKey: todayKey,
      timezoneOffsetMinutes: today.getTimezoneOffset(),
    })
  } catch (err) {
    const error = err as Error
    console.error("Error al obtener check-in diario:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener el check-in diario",
      error: error.message,
    })
  }
}

// Obtener progreso semanal
export const getWeeklyProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
      return;
    }
    
    const userProgress = await UserProgress.findOne({ userId });
    
    if (!userProgress) {
      res.status(404).json({
        success: false,
        message: "No se encontró progreso para este usuario",
      });
      return;
    }
    
    const weekly = await buildWeeklyProgress(userId, userProgress)
    userProgress.weeklyData = [weekly]
    await userProgress.save()
    
    res.status(200).json({
      success: true,
      message: "Progreso semanal obtenido correctamente",
      data: weekly
    });
  } catch (err) {
    const error = err as Error;
    console.error("Error al obtener progreso semanal:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el progreso semanal",
      error: error.message,
    });
  }
};

// Obtener logros
export const getAchievements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
      return;
    }
    
    const userProgress = await UserProgress.findOne({ userId });
    
    if (!userProgress) {
      res.status(404).json({
        success: false,
        message: "No se encontró progreso para este usuario",
      });
      return;
    }
    
    // Si no hay logros, inicializarlos
    if (!userProgress.achievements) {
      userProgress.achievements = {
        firstDay: {
          title: "Primer día sin fumar",
          description: "Completaste tu primer día sin fumar",
          completed: false
        },
        firstWeek: {
          title: "Una semana sin fumar",
          description: "Completaste una semana sin fumar",
          completed: false
        },
        firstMonth: {
          title: "Un mes sin fumar",
          description: "Completaste un mes sin fumar",
          completed: false,
          progress: 0
        },
        moneySaved: {
          title: "Ahorrar $200",
          description: "Has ahorrado $200 al no fumar",
          completed: false,
          progress: 0
        }
      };
      await userProgress.save();
    }
    
    await syncProgressMetrics(userId, userProgress)
    await updateAchievements(userId);
    
    // Obtener el progreso actualizado
    const updatedProgress = await UserProgress.findOne({ userId });
    
    const gamification = await getGamification(userId)

    res.status(200).json({
      success: true,
      message: "Logros obtenidos correctamente",
      data: updatedProgress ? {
        ...updatedProgress.achievements,
        motivationPoints: gamification.motivationPoints,
      } : {}
    });
  } catch (err) {
    const error = err as Error;
    console.error("Error al obtener logros:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los logros",
      error: error.message,
    });
  }
};

// Obtener resumen de progreso
export const getProgressSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
      return;
    }
    
    const userProgress = await UserProgress.findOne({ userId });
    
    if (!userProgress) {
      res.status(404).json({
        success: false,
        message: "No se encontró progreso para este usuario",
      });
      return;
    }
    
    // Calcular porcentaje de reducción
    const reductionPercentage = calculateReductionPercentage(userProgress);
    
    const summary = {
      reductionPercentage,
      daysWithoutSmoking: userProgress.daysWithoutSmoking,
      moneySaved: userProgress.moneySaved,
      message: generateMotivationalMessage(reductionPercentage)
    };
    
    res.status(200).json({
      success: true,
      message: "Resumen de progreso obtenido correctamente",
      data: summary
    });
  } catch (err) {
    const error = err as Error;
    console.error("Error al obtener resumen de progreso:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el resumen de progreso",
      error: error.message,
    });
  }
};

// Actualizar registro de cigarrillo y progreso semanal
export const updateSmokingRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
      return;
    }
    
    const { date, count } = req.body;
    const recordDate = getValidDate(date);
    const dayOfWeek = getMondayFirstDayIndex(recordDate); // 0 = Lunes, 6 = Domingo
    
    // Obtener progreso del usuario
    const userProgress = await UserProgress.findOne({ userId });
    
    if (!userProgress) {
      res.status(404).json({
        success: false,
        message: "No se encontró progreso para este usuario",
      });
      return;
    }
    
    // Asegurarse de que hay datos semanales
    if (!userProgress.weeklyData || userProgress.weeklyData.length === 0) {
      userProgress.weeklyData = [{
        weekStart: new Date(),
        dailyCigarettes: [0, 0, 0, 0, 0, 0, 0],
        weeklyGoal: userProgress.cigarettesPerDay * 7,
        totalSmoked: 0
      }];
    }
    
    // Actualizar el contador del día
    userProgress.weeklyData[0].dailyCigarettes = normalizeDailyCigarettes(userProgress.weeklyData[0].dailyCigarettes);
    userProgress.weeklyData[0].dailyCigarettes[dayOfWeek] = count;
    
    // Recalcular total fumado
    userProgress.weeklyData[0].totalSmoked = userProgress.weeklyData[0].dailyCigarettes.reduce((a: number, b: number) => a + b, 0);
    
    await userProgress.save();
    
    res.status(200).json({
      success: true,
      message: "Registro de cigarrillos actualizado correctamente",
      data: userProgress.weeklyData[0]
    });
  } catch (err) {
    const error = err as Error;
    console.error("Error al actualizar registro de cigarrillos:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el registro de cigarrillos",
      error: error.message,
    });
  }
};

// Función auxiliar para crear el plan diario inicial
// delega en createDailyPlan para aprovechar la lógica basada en nivel de dependencia
const createInitialDailyPlan = async (userId: string): Promise<any> => {
  return await createDailyPlan(userId, new Date());
}

// Función para crear un plan diario para una fecha específica
// ahora tiene en cuenta el nivel de dependencia almacenado en el progreso del usuario
const createDailyPlan = async (userId: string, date: Date, dayNumberOverride?: number): Promise<any> => {
  // Obtener el progreso del usuario para saber en qué día va
  const userProgress = await UserProgress.findOne({ userId })
  const dayNumber = dayNumberOverride || await getLegacyDailyPlanDay(userId, date, userProgress)
  const dependencyLevel = userProgress ? userProgress.dependencyLevel : 'Moderado'

  // intentar obtener del JSON de configuración
  let activities: any[] = []
  const configActs = getConfigActivities(dayNumber, dependencyLevel)
  if (configActs && configActs.length > 0) {
    console.log(`Usando configuración para día ${dayNumber}, dependencia ${dependencyLevel}`)
    activities = configActs.map(act => {
      const title = toNonEmptyText(act.title) || `Actividad del dia ${dayNumber}`
      const description =
        toNonEmptyText(act.description) ||
        toNonEmptyText(act.justification) ||
        `Completa esta actividad del plan diario: ${title}`

      const activity: any = {
        id: uuidv4(),
        title,
        description,
        type: act.type || 'education',
        durationMinutes: act.durationMinutes || 10,
        justification: toNonEmptyText(act.justification),
        isCompleted: false,
      }
      // si la configuración incluye un objeto secondary, incrustarlo
      if (act.secondary) {
        activity.secondaryActivity = {
          title: act.secondary.title || '',
          description: act.secondary.description || '',
          isOptional: act.secondary.isOptional || false,
        }
      }
      return activity
    })
  } else {
    console.log(`Usando generador genérico para día ${dayNumber}, dependencia ${dependencyLevel}`)
    // fallback al generador genérico
    activities = generateActivitiesForDay(dayNumber, dependencyLevel)
  }

  // Mensaje informativo de cabecera según dependencia
  let message = `Día ${dayNumber} de tu viaje sin tabaco. ¡Sigue adelante!`;
  if (dependencyLevel === 'Leve') {
    message = `Día ${dayNumber} - Dependencia baja. Avanza con confianza.`;
  } else if (dependencyLevel === 'Moderado') {
    message = `Día ${dayNumber} - Dependencia moderada. Mantén el ritmo.`;
  } else if (dependencyLevel === 'Severo') {
    message = `Día ${dayNumber} - Dependencia alta. Toma medidas extra de autocuidado.`;
  }

  const dailyPlan = new DailyPlan({
    userId,
    date,
    activities,
    isCompleted: false,
    message,
    dayNumber,
  })

  return await dailyPlan.save()
}

// Función para generar actividades basadas en el día y nivel de dependencia
const generateActivitiesForDay = (dayNumber: number, dependencyLevel: string): Array<any> => {
  // actividades base comunes a todos los niveles
  const activities: Array<any> = [
    {
      id: uuidv4(),
      title: "Ejercicio de respiración",
      description: "Realiza 10 respiraciones profundas cuando sientas ansiedad",
      type: "breathing",
      durationMinutes: 3,
      isCompleted: false,
    },
    {
      id: uuidv4(),
      title: "Beber agua",
      description: "Bebe al menos 8 vasos de agua durante el día",
      type: "health",
      durationMinutes: 1,
      isCompleted: false,
    },
  ]

  // Ajustes según nivel de dependencia
  if (dependencyLevel === 'Severo') {
    // añadir tareas adicionales de apoyo emocional o físico
    activities.push({
      id: uuidv4(),
      title: "Soporte social",
      description: "Contacta a un amigo o familiar y comparte cómo te sientes",
      type: "social",
      durationMinutes: 10,
      isCompleted: false,
    })
    activities.push({
      id: uuidv4(),
      title: "Respiración profunda extra",
      description: "Cuando sientas un antojo fuerte, haz 15 respiraciones profundas",
      type: "breathing",
      durationMinutes: 5,
      isCompleted: false,
    })
  } else if (dependencyLevel === 'Moderado') {
    // actividades moderadas adicionales
    activities.push({
      id: uuidv4(),
      title: "Mini paseo",
      description: "Da una caminata de 10 minutos para despejarte",
      type: "exercise",
      durationMinutes: 10,
      isCompleted: false,
    })
  } else if (dependencyLevel === 'Leve') {
    // plan más ligero
    // puede mantener solo las actividades base
  }

  // Actividades periódicas basadas en el día
  if (dayNumber % 3 === 0) {
    activities.push({
      id: uuidv4(),
      title: "Ejercicio físico",
      description: "Realiza 15 minutos de actividad física moderada",
      type: "exercise",
      durationMinutes: 15,
      isCompleted: false,
    })
  }

  if (dayNumber % 7 === 0) {
    activities.push({
      id: uuidv4(),
      title: "Reflexión semanal",
      description: "Reflexiona sobre tu progreso durante esta semana",
      type: "reflection",
      durationMinutes: 10,
      isCompleted: false,
    })
  }

  return activities
}

// Función auxiliar para calcular el porcentaje de reducción
const calculateReductionPercentage = (userProgress: any): number => {
  if (!userProgress.weeklyData || userProgress.weeklyData.length === 0) {
    return 0;
  }
  
  const weeklyData = userProgress.weeklyData[0];
  const totalSmoked = weeklyData.totalSmoked;
  const weeklyGoal = weeklyData.weeklyGoal;
  
  if (weeklyGoal === 0) return 0;
  
  // Calcular porcentaje de reducción
  const reduction = Math.max(0, (weeklyGoal - totalSmoked) / weeklyGoal * 100);
  return Math.round(reduction);
};

// Función auxiliar para generar mensaje motivacional
const generateMotivationalMessage = (reductionPercentage: number): string => {
  if (reductionPercentage >= 90) {
    return "¡Excelente! Has reducido significativamente tu consumo de tabaco.";
  } else if (reductionPercentage >= 50) {
    return "¡Sigue así! Has reducido significativamente tu consumo de tabaco.";
  } else if (reductionPercentage >= 20) {
    return "¡Buen progreso! Estás en camino de reducir tu consumo de tabaco.";
  } else {
    return "¡Ánimo! Cada paso cuenta en tu camino para dejar de fumar.";
  }
};

// Función auxiliar para actualizar logros
const updateAchievements = async (userId: string): Promise<void> => {
  const userProgress = await UserProgress.findOne({ userId });
  
  if (!userProgress) return;
  
  const now = new Date();
  const currentStreak = Number(userProgress.daysWithoutSmoking) || 0;
  const bestStreak = Number(userProgress.bestStreak) || currentStreak;
  
  // Actualizar logros basados en días sin fumar
  if (bestStreak >= 1 && !userProgress.achievements.firstDay.completed) {
    userProgress.achievements.firstDay.completed = true;
    userProgress.achievements.firstDay.date = now.toISOString();
    await awardGamification(userId, "first_day", userProgress.achievements.firstDay.title, 50, "achievement");
  }
  
  if (bestStreak >= 7 && !userProgress.achievements.firstWeek.completed) {
    userProgress.achievements.firstWeek.completed = true;
    userProgress.achievements.firstWeek.date = now.toISOString();
    await awardGamification(userId, "first_week", userProgress.achievements.firstWeek.title, 100, "achievement");
  }
  
  if (bestStreak < 30 && !userProgress.achievements.firstMonth.completed) {
    userProgress.achievements.firstMonth.progress = Math.min(bestStreak / 30, 1);
  } else if (bestStreak >= 30 && !userProgress.achievements.firstMonth.completed) {
    userProgress.achievements.firstMonth.completed = true;
    userProgress.achievements.firstMonth.date = now.toISOString();
    await awardGamification(userId, "first_month", userProgress.achievements.firstMonth.title, 200, "achievement");
  }
  
  // Actualizar logro de dinero ahorrado
  if (userProgress.moneySaved < 200 && !userProgress.achievements.moneySaved.completed) {
    userProgress.achievements.moneySaved.progress = userProgress.moneySaved / 200;
  } else if (userProgress.moneySaved >= 200 && !userProgress.achievements.moneySaved.completed) {
    userProgress.achievements.moneySaved.completed = true;
    userProgress.achievements.moneySaved.date = now.toISOString();
    await awardGamification(userId, "money_saved_200", userProgress.achievements.moneySaved.title, 75, "achievement");
  }
  
  await userProgress.save();
};

// Función para actualizar el progreso cuando se completa un plan diario
const updateProgressOnPlanCompletion = async (userId: string, dayNumber: number): Promise<void> => {
  const userProgress = await UserProgress.findOne({ userId });
  if (!userProgress) return;

  // Actualizar días sin fumar si es mayor que el valor actual
  await awardGamification(userId, `daily_plan_${dayNumber}`, `Día ${dayNumber} completado`, 25, "daily-plan", "Completaste todas las actividades del día")
  await syncProgressMetrics(userId, userProgress)
  await updateAchievements(userId);

  if (false && dayNumber > userProgress.daysWithoutSmoking) {
    userProgress.daysWithoutSmoking = dayNumber;

    // Calcular cigarrillos evitados
    userProgress.cigarettesAvoided = userProgress.cigarettesPerDay * dayNumber;

    // Calcular dinero ahorrado (asumiendo 20 cigarrillos por paquete)
    const packetsPerDay = userProgress.cigarettesPerDay / 20;
    userProgress.moneySaved = dayNumber * packetsPerDay * userProgress.packagePrice;

    // Actualizar progreso de salud (simplificado)
    userProgress.healthProgress = Math.min(dayNumber / 30, 1); // Máximo 100% después de 30 días

    // Actualizar logros
    await updateAchievements(userId);

    await userProgress.save();
  }
};
