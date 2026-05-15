import type { Request, Response } from "express"
import NotificationPreference from "../models/NotificationPreference"
import RiskSnapshot from "../models/RiskSnapshot"
import DailyPlan from "../models/DailyPlan"
import DailyCheckin from "../models/DailyCheckin"
import UserProgress from "../models/UserProgress"

interface AuthRequest extends Request {
  userId?: string
}

export const getPreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" })
      return
    }

    const prefs = await NotificationPreference.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId } },
      { upsert: true, new: true },
    )

    res.status(200).json({ success: true, data: prefs })
  } catch (err) {
    const error = err as Error
    console.error("[notifications] Error getting preferences:", error)
    res.status(500).json({ success: false, message: "Error al obtener preferencias", error: error.message })
  }
}

export const updatePreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" })
      return
    }

    const allowedFields = [
      "enableDailyReminder",
      "enableRiskAlerts",
      "enableMotivation",
      "preferredHour",
      "quietHoursStart",
      "quietHoursEnd",
    ]

    const update: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        update[field] = req.body[field]
      }
    }

    const prefs = await NotificationPreference.findOneAndUpdate(
      { userId },
      { $set: update },
      { upsert: true, new: true },
    )

    console.log("[notifications] Preferences updated", { userId, update })

    res.status(200).json({ success: true, data: prefs })
  } catch (err) {
    const error = err as Error
    console.error("[notifications] Error updating preferences:", error)
    res.status(500).json({ success: false, message: "Error al actualizar preferencias", error: error.message })
  }
}

export const getSmartMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" })
      return
    }

    const today = new Date()
    const year = today.getFullYear()
    const month = `${today.getMonth() + 1}`.padStart(2, "0")
    const day = `${today.getDate()}`.padStart(2, "0")
    const dateKey = `${year}-${month}-${day}`

    const [riskSnapshot, progress, dailyPlan, checkin] = await Promise.all([
      RiskSnapshot.findOne({ userId, dateKey }),
      UserProgress.findOne({ userId }),
      DailyPlan.findOne({ userId, date: { $gte: new Date(today.setHours(0, 0, 0, 0)) } }),
      DailyCheckin.findOne({ userId, dateKey }),
    ])

    const messages: Array<{ type: string; title: string; body: string; priority: string }> = []
    const streak = Number(progress?.daysWithoutSmoking) || 0
    const riskLevel = riskSnapshot?.riskLevel || "bajo"
    const hasCheckin = Boolean(checkin)
    const planActivities = Array.isArray((dailyPlan as any)?.activities) ? (dailyPlan as any).activities : []
    const totalActivities = planActivities.length
    const completedActivities = planActivities.filter((a: any) => a.isCompleted).length
    const hasPendingActivities = totalActivities > 0 && completedActivities < totalActivities
    const moneySaved = Number(progress?.moneySaved) || 0

    if (!hasCheckin) {
      messages.push({
        type: "checkin",
        title: "Check-in pendiente",
        body: "Aún no registraste tu check-in de hoy. ¿Cómo te sientes?",
        priority: "high",
      })
    }

    if (riskLevel === "alto") {
      messages.push({
        type: "risk_alert",
        title: "Riesgo alto detectado",
        body: "Hoy tu nivel de riesgo de recaída es alto. Respira profundo, contacta a tu red de apoyo y completa actividades de tu plan.",
        priority: "high",
      })
    }

    if (hasPendingActivities) {
      const pending = totalActivities - completedActivities
      messages.push({
        type: "activities_pending",
        title: "Actividades pendientes",
        body: `Tienes ${pending} actividad(es) pendiente(s) en tu plan de hoy. Completarlas te ayuda a mantener el enfoque.`,
        priority: "medium",
      })
    }

    if (streak > 0 && streak % 7 === 0) {
      messages.push({
        type: "streak_milestone",
        title: `${streak} días sin fumar`,
        body: `¡Has alcanzado ${streak} días sin fumar! Este es un logro importante. Celebra tu progreso.`,
        priority: "low",
      })
    }

    if (moneySaved > 0 && moneySaved % 50 < 5) {
      messages.push({
        type: "money_milestone",
        title: "Ahorro destacado",
        body: `Has ahorrado $${moneySaved.toFixed(2)} desde que empezaste. ¡Cada día cuenta!`,
        priority: "low",
      })
    }

    if (messages.length === 0) {
      messages.push({
        type: "motivation",
        title: "¡Sigue así!",
        body: "Vas bien en tu proceso. Cada día sin fumar es una victoria. ¿Necesitas algo?",
        priority: "low",
      })
    }

    res.status(200).json({ success: true, data: messages })
  } catch (err) {
    const error = err as Error
    console.error("[notifications] Error generating smart messages:", error)
    res.status(500).json({ success: false, message: "Error al generar mensajes", error: error.message })
  }
}
