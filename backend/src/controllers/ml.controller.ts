import { Request, Response } from "express"
import DailyCheckin from "../models/DailyCheckin"
import CigaretteLog from "../models/CigaretteLog"
import RiskSnapshot from "../models/RiskSnapshot"
import { linearRegression, linearRegressionLine, rSquared } from "simple-statistics"

const MOOD_RISK_MAP: Record<string, number> = {
  happy: 0.1, great: 0.1, excellent: 0.1, fantastic: 0.1,
  good: 0.2, fine: 0.2, calm: 0.2, relaxed: 0.2,
  ok: 0.3, okay: 0.3, normal: 0.3, neutral: 0.3,
  tired: 0.5, bored: 0.5, sleepy: 0.5,
  sad: 0.6, anxious: 0.7, nervous: 0.7, worried: 0.6,
  stressed: 0.8, frustrated: 0.7, angry: 0.8, irritable: 0.7,
  depressed: 0.9, hopeless: 0.9, restless: 0.6, craving: 0.8,
}

const DEFAULT_MOOD_RISK = 0.4

function moodRisk(mood: string): number {
  if (!mood) return DEFAULT_MOOD_RISK
  return MOOD_RISK_MAP[mood.toLowerCase().trim()] ?? DEFAULT_MOOD_RISK
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

export const getLinearRegression = async (req: Request, res: Response): Promise<void> => {
  try {
    const [checkins, riskSnapshots, smokingRecords] = await Promise.all([
      DailyCheckin.find({ cravingLevel: { $type: "number" } })
        .select("userId dateKey cravingLevel smokedToday symptoms mood cigarettesSmokedCount")
        .sort({ date: -1 })
        .lean(),
      RiskSnapshot.find({})
        .select("userId dateKey riskScore")
        .lean(),
      CigaretteLog.find({ cravingLevel: { $type: "number" } })
        .select("userId timestamp cravingLevel")
        .sort({ timestamp: -1 })
        .lean(),
    ])

    const riskByUserDate = new Map<string, number>()
    for (const rs of riskSnapshots) {
      const key = `${rs.userId.toString()}_${rs.dateKey}`
      riskByUserDate.set(key, rs.riskScore)
    }

    const points: Array<{ cravingLevel: number; relapseRisk: number }> = []

    for (const c of checkins) {
      const cravingLevel = Number(c.cravingLevel)
      if (Number.isNaN(cravingLevel)) continue

      const key = `${c.userId.toString()}_${c.dateKey}`
      const storedRisk = riskByUserDate.get(key)

      const relapseRisk = storedRisk ?? computeRelapseRisk({
        smokedToday: c.smokedToday,
        cravingLevel,
        symptoms: c.symptoms || [],
        mood: c.mood,
      })

      points.push({ cravingLevel, relapseRisk })
    }

    for (const s of smokingRecords) {
      const cravingLevel = Number(s.cravingLevel)
      if (Number.isNaN(cravingLevel)) continue

      const dateKey = new Date(s.timestamp).toISOString().slice(0, 10)
      const key = `${s.userId.toString()}_${dateKey}`
      const storedRisk = riskByUserDate.get(key)

      if (storedRisk !== undefined) {
        points.push({ cravingLevel, relapseRisk: storedRisk })
      } else {
        points.push({
          cravingLevel,
          relapseRisk: computeRelapseRisk({
            smokedToday: true,
            cravingLevel,
            symptoms: [],
            mood: "",
          }),
        })
      }
    }

    if (points.length < 3) {
      res.status(200).json({
        equation: "N/A (datos insuficientes)",
        slope: 0,
        intercept: 0,
        r2: 0,
        mae: 0,
        rmse: 0,
        datasetSize: points.length,
        points,
        predictions: [],
      })
      return
    }

    const regressionInput: Array<[number, number]> = points.map((p) => [p.cravingLevel, p.relapseRisk])
    const regression = linearRegression(regressionInput)
    const slope = regression.m
    const intercept = regression.b
    const equation = `y = ${slope.toFixed(4)}x + ${intercept.toFixed(4)}`

    const regressionFn = linearRegressionLine(regression)
    const predictions = points.map((p) => ({
      cravingLevel: p.cravingLevel,
      predicted: parseFloat(regressionFn(p.cravingLevel).toFixed(2)),
      actual: p.relapseRisk,
    }))

    const predictedValues = predictions.map((p) => p.predicted)
    const actualValues = points.map((p) => p.relapseRisk)
    const r2 = rSquared(regressionInput, regressionFn)

    const mae =
      points.reduce((sum, p, i) => sum + Math.abs(p.relapseRisk - predictedValues[i]), 0) / points.length

    const rmse = Math.sqrt(
      points.reduce((sum, p, i) => sum + Math.pow(p.relapseRisk - predictedValues[i], 2), 0) / points.length,
    )

    const sorted = [...points].sort((a, b) => a.cravingLevel - b.cravingLevel)

    res.status(200).json({
      equation,
      slope: parseFloat(slope.toFixed(4)),
      intercept: parseFloat(intercept.toFixed(4)),
      r2: parseFloat(r2.toFixed(4)),
      mae: parseFloat(mae.toFixed(4)),
      rmse: parseFloat(rmse.toFixed(4)),
      datasetSize: points.length,
      points: sorted,
      predictions,
    })
  } catch (error) {
    console.error("[ml] Error in linear regression:", error)
    res.status(500).json({ success: false, message: "Error al ejecutar regresión lineal" })
  }
}
