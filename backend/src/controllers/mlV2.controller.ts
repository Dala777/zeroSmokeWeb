import { Request, Response } from "express"
import axios from "axios"
import DailyCheckin from "../models/DailyCheckin"
import type { IDailyCheckin, ICigaretteLog, IUserPlan } from "../models/interfaces"
import CigaretteLog from "../models/CigaretteLog"
import RiskSnapshot from "../models/RiskSnapshot"
import { UserPlan } from "../models/UserPlan"

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:5001"

const POSITIVE_EMOTIONS = new Set([
  "happy", "great", "excellent", "fantastic", "good", "fine", "calm",
  "relaxed", "ok", "okay", "normal", "neutral", "hopeful", "motivated",
  "grateful", "peaceful", "confident", "energetic", "content", "joyful",
])

const STRESS_KEYWORDS = new Set([
  "stressed", "anxious", "nervous", "worried", "overwhelmed", "tense",
  "pressure", "panic", "stress", "frustrated", "irritable",
])

function emotionScore(mood: string, emotions: string[] = []): number {
  const all = [mood, ...emotions].filter(Boolean).map((e) => e.toLowerCase().trim())
  if (all.length === 0) return 0.5
  let negCount = 0
  for (const e of all) {
    if (!POSITIVE_EMOTIONS.has(e)) negCount++
  }
  return Math.min(negCount / all.length, 1)
}

function symptomScore(symptoms: string[] = []): number {
  return Math.min((symptoms.length || 0) / 5, 1)
}

function stressIndicator(mood: string, emotions: string[] = []): number {
  const all = [mood, ...emotions].filter(Boolean).map((e) => e.toLowerCase().trim())
  return all.some((e) => STRESS_KEYWORDS.has(e)) ? 1 : 0
}

function hourSegment(date: Date): number {
  return new Date(date).getHours()
}

const MOOD_RISK_MAP: Record<string, number> = {
  happy: 0.1, great: 0.1, excellent: 0.1, fantastic: 0.1,
  good: 0.2, fine: 0.2, calm: 0.2, relaxed: 0.2,
  ok: 0.3, okay: 0.3, normal: 0.3, neutral: 0.3,
  tired: 0.5, bored: 0.5, sleepy: 0.5,
  sad: 0.6, anxious: 0.7, nervous: 0.7, worried: 0.6,
  stressed: 0.8, frustrated: 0.7, angry: 0.8, irritable: 0.7,
  depressed: 0.9, hopeless: 0.9, restless: 0.6, craving: 0.8,
}

function moodRisk(mood: string): number {
  if (!mood) return 0.4
  return MOOD_RISK_MAP[mood.toLowerCase().trim()] ?? 0.4
}

function computeRelapseRisk(fields: {
  smokedToday: boolean
  cravingLevel: number
  symptoms: string[]
  mood: string
}): number {
  const smokedScore = fields.smokedToday ? 1 : 0
  const cravingScore = Math.min(fields.cravingLevel / 10, 1)
  const symptomCount = Math.min((fields.symptoms || []).length, 5) / 5
  const moodVal = moodRisk(fields.mood)
  const raw = smokedScore * 0.35 + cravingScore * 0.30 + symptomCount * 0.20 + moodVal * 0.15
  return Math.round(Math.min(raw, 1) * 100)
}

interface RiskSnapshotFields {
  userId: { toString(): string }
  dateKey: string
  riskScore: number
}

interface FeatureRow {
  emotion_score: number
  symptom_score: number
  completed_activity_rate: number
  hour_segment: number
  past_week_risk: number
  consecutive_smoke_days: number
  stress_indicator: number
}

function buildFeatureRow(overrides: Partial<FeatureRow>): FeatureRow {
  return {
    emotion_score: 0.5,
    symptom_score: 0,
    completed_activity_rate: 0,
    hour_segment: 12,
    past_week_risk: 50,
    consecutive_smoke_days: 0,
    stress_indicator: 0,
    ...overrides,
  }
}

export const trainMultipleRegression = async (req: Request, res: Response): Promise<void> => {
  try {
    const [checkins, smokingRecords, riskSnapshots, userPlans] = await Promise.all([
      DailyCheckin.find<IDailyCheckin>({ cravingLevel: { $type: "number" } })
        .select("userId date dateKey cravingLevel smokedToday symptoms mood cigarettesSmokedCount createdAt")
        .sort({ userId: 1, date: 1 })
        .lean(),
      CigaretteLog.find<ICigaretteLog>({ cravingLevel: { $type: "number" } })
        .select("userId timestamp cravingLevel emotion emotions")
        .sort({ userId: 1, timestamp: 1 })
        .lean(),
      RiskSnapshot.find<RiskSnapshotFields>({}).select("userId dateKey riskScore").lean(),
      UserPlan.find<IUserPlan>({}).select("userId completionPercentage status").lean(),
    ])

    const riskByKey = new Map<string, number>()
    for (const rs of riskSnapshots) {
      riskByKey.set(`${rs.userId.toString()}_${rs.dateKey}`, rs.riskScore)
    }

    const completionByUser = new Map<string, number>()
    for (const up of userPlans) {
      const uid = up.userId.toString()
      const existing = completionByUser.get(uid) ?? 0
      if (up.completionPercentage > existing) {
        completionByUser.set(uid, up.completionPercentage)
      }
    }

    const smokingByUser = new Map<string, Array<{ timestamp: Date; cravingLevel: number; emotion?: string; emotions: string[] }>>()
    for (const s of smokingRecords) {
      const uid = s.userId.toString()
      if (!smokingByUser.has(uid)) smokingByUser.set(uid, [])
      smokingByUser.get(uid)!.push({
        timestamp: s.timestamp,
        cravingLevel: s.cravingLevel,
        emotion: s.emotion,
        emotions: s.emotions || [],
      })
    }

    const checkinsByUser = new Map<string, Array<typeof checkins[0]>>()
    for (const c of checkins) {
      const uid = c.userId.toString()
      if (!checkinsByUser.has(uid)) checkinsByUser.set(uid, [])
      checkinsByUser.get(uid)!.push(c)
    }

    const features: FeatureRow[] = []
    const target: number[] = []
    const featureDetails: Array<{ userId: string; dateKey: string; cravingLevel: number; relapseRisk: number; features: FeatureRow }> = []

    for (const [userId, userCheckins] of checkinsByUser) {
      let consecutiveSmokeDays = 0
      const userSmoking = smokingByUser.get(userId) || []

      const userSmokingByDate = new Map<string, typeof userSmoking>()
      for (const s of userSmoking) {
        const dk = new Date(s.timestamp).toISOString().slice(0, 10)
        if (!userSmokingByDate.has(dk)) userSmokingByDate.set(dk, [])
        userSmokingByDate.get(dk)!.push(s)
      }

      const pastWeekRisks: number[] = []

      for (let i = 0; i < userCheckins.length; i++) {
        const c = userCheckins[i]
        const dateKey = c.dateKey

        if (c.smokedToday) {
          consecutiveSmokeDays++
        } else {
          consecutiveSmokeDays = 0
        }

        const storedRisk = riskByKey.get(`${userId}_${dateKey}`)
        const relapseRisk = storedRisk ?? computeRelapseRisk({
          smokedToday: c.smokedToday,
          cravingLevel: c.cravingLevel,
          symptoms: c.symptoms || [],
          mood: c.mood,
        })

        pastWeekRisks.push(relapseRisk)
        if (pastWeekRisks.length > 7) pastWeekRisks.shift()
        const avgPastWeekRisk = pastWeekRisks.length > 0
          ? pastWeekRisks.reduce((a, b) => a + b, 0) / pastWeekRisks.length
          : 50

        const daySmokingRecords = userSmokingByDate.get(dateKey) || []
        const allEmotions = [c.mood, ...daySmokingRecords.flatMap((s) => [s.emotion || "", ...s.emotions])]

        const compRate = completionByUser.get(userId) ?? 0
        const smokingTimestamps = daySmokingRecords.map((s) => s.timestamp)
        const hour = smokingTimestamps.length > 0
          ? hourSegment(smokingTimestamps[0])
          : hourSegment(c.date || c.createdAt)

        const row = buildFeatureRow({
          emotion_score: emotionScore(c.mood, daySmokingRecords.flatMap((s) => s.emotions || [])),
          symptom_score: symptomScore(c.symptoms),
          completed_activity_rate: compRate,
          hour_segment: hour,
          past_week_risk: Math.round(avgPastWeekRisk),
          consecutive_smoke_days: consecutiveSmokeDays,
          stress_indicator: stressIndicator(c.mood, daySmokingRecords.flatMap((s) => [s.emotion || "", ...s.emotions])),
        })

        features.push(row)
        target.push(relapseRisk)
        featureDetails.push({
          userId,
          dateKey,
          cravingLevel: c.cravingLevel,
          relapseRisk,
          features: row,
        })
      }
    }

    if (features.length < 10) {
      res.status(200).json({
        success: false,
        message: `Datos insuficientes: ${features.length} muestras (requeridas ≥10)`,
        datasetSize: features.length,
      })
      return
    }

    const mlResponse = await axios.post(`${ML_SERVICE_URL}/train-regression`, {
      features,
      target,
    })

    res.status(200).json({
      success: true,
      message: "Modelo entrenado correctamente",
      ...mlResponse.data,
      datasetSize: features.length,
      samples: featureDetails.slice(0, 100),
    })

  } catch (error: any) {
    if (error.code === "ECONNREFUSED" || error.code === "ECONNRESET") {
      res.status(503).json({
        success: false,
        message: "Microservicio Python no disponible. Ejecute: cd backend-python && python app.py",
        error: "ML_SERVICE_UNAVAILABLE",
      })
      return
    }
    console.error("[ml-v2] Error training multiple regression:", error)
    res.status(500).json({
      success: false,
      message: "Error al entrenar regresión múltiple",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

export const predictRisk = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body
    if (!userId) {
      res.status(400).json({ success: false, message: "Se requiere userId" })
      return
    }

    const [recentCheckin, recentSmoking, userPlan] = await Promise.all([
      DailyCheckin.findOne<IDailyCheckin>({ userId, cravingLevel: { $type: "number" } })
        .sort({ date: -1 })
        .select("userId date dateKey cravingLevel smokedToday symptoms mood createdAt")
        .lean(),
      CigaretteLog.find<ICigaretteLog>({ userId, cravingLevel: { $type: "number" } })
        .sort({ timestamp: -1 })
        .limit(1)
        .select("userId timestamp cravingLevel emotion emotions")
        .lean(),
      UserPlan.findOne<IUserPlan>({ userId }).select("completionPercentage status").lean(),
    ])

    if (!recentCheckin) {
      res.status(404).json({ success: false, message: "No hay datos de check-in para este usuario" })
      return
    }

    const prevCheckins = await DailyCheckin.find<IDailyCheckin>({
      userId,
      date: { $lt: recentCheckin.date },
      cravingLevel: { $type: "number" },
    })
      .sort({ date: -1 })
      .limit(7)
      .select("date smokedToday cravingLevel mood symptoms")
      .lean()

    const prevRisks = prevCheckins.map((pc) =>
      computeRelapseRisk({
        smokedToday: pc.smokedToday,
        cravingLevel: pc.cravingLevel,
        symptoms: pc.symptoms || [],
        mood: pc.mood,
      })
    )
    const pastWeekRisk = prevRisks.length > 0
      ? prevRisks.reduce((a, b) => a + b, 0) / prevRisks.length
      : 50

    let consecutiveSmokeDays = 0
    for (const pc of [...prevCheckins].reverse()) {
      if (pc.smokedToday) consecutiveSmokeDays++
      else break
    }
    if (recentCheckin.smokedToday) consecutiveSmokeDays++

    const recentSmokingEmotions = recentSmoking.flatMap((s) => [s.emotion || "", ...s.emotions || []])

    const userFeatures = buildFeatureRow({
      emotion_score: emotionScore(recentCheckin.mood, recentSmokingEmotions),
      symptom_score: symptomScore(recentCheckin.symptoms),
      completed_activity_rate: userPlan?.completionPercentage ?? 0,
      hour_segment: hourSegment(new Date()),
      past_week_risk: Math.round(pastWeekRisk),
      consecutive_smoke_days: consecutiveSmokeDays,
      stress_indicator: stressIndicator(recentCheckin.mood, recentSmokingEmotions),
    })

    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict-relapse-risk`, {
      features: userFeatures,
    })

    res.status(200).json({
      success: true,
      userId,
      features: userFeatures,
      ...mlResponse.data,
    })

  } catch (error: any) {
    if (error.code === "ECONNREFUSED" || error.code === "ECONNRESET") {
      res.status(503).json({
        success: false,
        message: "Microservicio Python no disponible",
        error: "ML_SERVICE_UNAVAILABLE",
      })
      return
    }
    console.error("[ml-v2] Error predicting risk:", error)
    res.status(500).json({ success: false, message: "Error al predecir riesgo" })
  }
}
