import type { Request, Response } from "express"
import NotificationPreference from "../models/NotificationPreference"
import NotificationLog from "../models/NotificationLog"
import UserDevice from "../models/UserDevice"
import RiskSnapshot from "../models/RiskSnapshot"
import DailyPlan from "../models/DailyPlan"
import DailyCheckin from "../models/DailyCheckin"
import UserProgress from "../models/UserProgress"
import { sendToUser } from "../services/notificationPush.service"

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

export const registerDevice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" })
      return
    }

    const { fcmToken, platform, deviceName } = req.body
    if (!fcmToken || !platform) {
      res.status(400).json({ success: false, message: "fcmToken y platform son requeridos" })
      return
    }

    if (!["android", "ios", "web"].includes(platform)) {
      res.status(400).json({ success: false, message: "platform debe ser android, ios o web" })
      return
    }

    const existing = await UserDevice.findOne({ fcmToken })
    if (existing) {
      if (existing.userId.toString() !== userId) {
        existing.userId = userId as any
      }
      existing.isActive = true
      existing.lastSeenAt = new Date()
      if (deviceName) existing.deviceName = deviceName
      await existing.save()
      console.log("[push] Token re-registered", { userId, platform, token: fcmToken.slice(0, 16) + "..." })
      res.status(200).json({ success: true, message: "Token actualizado" })
      return
    }

    await UserDevice.create({ userId, fcmToken, platform, deviceName, lastSeenAt: new Date(), isActive: true })
    console.log("[push] Token registered", { userId, platform, token: fcmToken.slice(0, 16) + "..." })
    res.status(201).json({ success: true, message: "Dispositivo registrado" })
  } catch (err) {
    const error = err as Error
    console.error("[notifications] Error registering device:", error)
    res.status(500).json({ success: false, message: "Error al registrar dispositivo", error: error.message })
  }
}

export const unregisterDevice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" })
      return
    }

    const fcmToken = req.body?.fcmToken || req.query?.fcmToken
    if (!fcmToken) {
      res.status(400).json({ success: false, message: "fcmToken es requerido" })
      return
    }

    const device = await UserDevice.findOne({ fcmToken, userId })
    if (!device) {
      res.status(404).json({ success: false, message: "Dispositivo no encontrado" })
      return
    }

    device.isActive = false
    await device.save()
    console.log("[push] Token unregistered", { userId, token: fcmToken.slice(0, 16) + "..." })
    res.status(200).json({ success: true, message: "Dispositivo desregistrado" })
  } catch (err) {
    const error = err as Error
    console.error("[notifications] Error unregistering device:", error)
    res.status(500).json({ success: false, message: "Error al desregistrar dispositivo", error: error.message })
  }
}

export const getNotificationHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" })
      return
    }

    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100)
    const skip = (page - 1) * limit

    const [notifications, total] = await Promise.all([
      NotificationLog.find({ userId }).sort({ sentAt: -1 }).skip(skip).limit(limit),
      NotificationLog.countDocuments({ userId }),
    ])

    const unread = await NotificationLog.countDocuments({ userId, readAt: null })

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      unread,
    })
  } catch (err) {
    const error = err as Error
    console.error("[notifications] Error getting history:", error)
    res.status(500).json({ success: false, message: "Error al obtener historial", error: error.message })
  }
}

export const markNotificationRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" })
      return
    }

    const { id } = req.params
    const notification = await NotificationLog.findOneAndUpdate(
      { _id: id, userId },
      { $set: { readAt: new Date() } },
      { new: true },
    )

    if (!notification) {
      res.status(404).json({ success: false, message: "Notificación no encontrada" })
      return
    }

    res.status(200).json({ success: true, data: notification })
  } catch (err) {
    const error = err as Error
    console.error("[notifications] Error marking notification as read:", error)
    res.status(500).json({ success: false, message: "Error al marcar como leída", error: error.message })
  }
}

export const markAllNotificationsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" })
      return
    }

    await NotificationLog.updateMany(
      { userId, readAt: null },
      { $set: { readAt: new Date() } },
    )

    res.status(200).json({ success: true, message: "Todas las notificaciones marcadas como leídas" })
  } catch (err) {
    const error = err as Error
    console.error("[notifications] Error marking all as read:", error)
    res.status(500).json({ success: false, message: "Error al marcar como leídas", error: error.message })
  }
}

export const sendSmartPushNow = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const [riskSnapshot, progress, dailyPlan, checkin, prefs] = await Promise.all([
      RiskSnapshot.findOne({ userId, dateKey }),
      UserProgress.findOne({ userId }),
      DailyPlan.findOne({ userId, date: { $gte: new Date(today.setHours(0, 0, 0, 0)) } }),
      DailyCheckin.findOne({ userId, dateKey }),
      NotificationPreference.findOne({ userId }),
    ])

    const messages: Array<{ type: string; title: string; body: string; priority: string }> = []
    const streak = Number(progress?.daysWithoutSmoking) || 0
    const riskLevel = riskSnapshot?.riskLevel || "bajo"
    const hasCheckin = Boolean(checkin)

    if (!hasCheckin && prefs?.enableDailyReminder !== false) {
      messages.push({ type: "checkin", title: "Check-in pendiente", body: "Aún no registraste tu check-in de hoy. ¿Cómo te sientes?", priority: "high" })
    }

    if (riskLevel === "alto" && prefs?.enableRiskAlerts !== false) {
      messages.push({ type: "risk_alert", title: "Riesgo alto detectado", body: "Hoy tu nivel de riesgo de recaída es alto. Respira profundo, contacta a tu red de apoyo.", priority: "high" })
    }

    if (streak > 0 && streak % 7 === 0) {
      messages.push({ type: "streak_milestone", title: `${streak} días sin fumar`, body: `¡Has alcanzado ${streak} días sin fumar! Celebra tu progreso.`, priority: "low" })
    }

    if (messages.length === 0 && prefs?.enableMotivation !== false) {
      messages.push({ type: "motivation", title: "¡Sigue así!", body: "Vas bien en tu proceso. Cada día sin fumar es una victoria.", priority: "low" })
    }

    if (messages.length === 0) {
      res.status(200).json({ success: true, data: [], message: "No hay mensajes para enviar" })
      return
    }

    const sent: string[] = []
    for (const msg of messages) {
      await sendToUser(userId, msg.title, msg.body, msg.type)
      sent.push(msg.type)
    }

    console.log("[push] Smart push sent", { userId, types: sent })
    res.status(200).json({ success: true, data: sent, message: "Notificaciones enviadas" })
  } catch (err) {
    const error = err as Error
    console.error("[notifications] Error sending smart push:", error)
    res.status(500).json({ success: false, message: "Error al enviar notificaciones", error: error.message })
  }
}
