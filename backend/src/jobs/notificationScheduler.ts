import UserDevice from "../models/UserDevice"
import NotificationPreference from "../models/NotificationPreference"
import RiskSnapshot from "../models/RiskSnapshot"
import DailyCheckin from "../models/DailyCheckin"
import UserProgress from "../models/UserProgress"
import { sendToUser } from "../services/notificationPush.service"

const SCHEDULER_INTERVAL_MS = parseInt(process.env.NOTIFICATION_SCHEDULER_INTERVAL || "300000", 10)

let schedulerTimer: ReturnType<typeof setInterval> | null = null

const isInQuietHours = (prefs: any): boolean => {
  const now = new Date()
  const hour = now.getHours()
  const start = Number(prefs?.quietHoursStart) ?? 22
  const end = Number(prefs?.quietHoursEnd) ?? 7

  if (start <= end) {
    return hour >= start && hour < end
  }
  return hour >= start || hour < end
}

const getTodayDateKey = (): string => {
  const today = new Date()
  const year = today.getFullYear()
  const month = `${today.getMonth() + 1}`.padStart(2, "0")
  const day = `${today.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

const processUserNotifications = async (userId: string): Promise<void> => {
  try {
    const prefs = await NotificationPreference.findOne({ userId })
    if (isInQuietHours(prefs)) {
      return
    }

    const dateKey = getTodayDateKey()
    const [riskSnapshot, progress, checkin] = await Promise.all([
      RiskSnapshot.findOne({ userId, dateKey }),
      UserProgress.findOne({ userId }),
      DailyCheckin.findOne({ userId, dateKey }),
    ])

    const hasCheckin = Boolean(checkin)
    const riskLevel = riskSnapshot?.riskLevel || "bajo"
    const streak = Number(progress?.daysWithoutSmoking) || 0
    let sent = false

    if (!hasCheckin && prefs?.enableDailyReminder !== false) {
      await sendToUser(
        userId,
        "Check-in pendiente",
        "Aún no registraste tu check-in de hoy. ¿Cómo te sientes?",
        "checkin",
      )
      sent = true
    }

    if (!sent && riskLevel === "alto" && prefs?.enableRiskAlerts !== false) {
      await sendToUser(
        userId,
        "Riesgo alto detectado",
        "Hoy tu nivel de riesgo de recaída es alto. Respira profundo y contacta a tu red de apoyo.",
        "risk_alert",
      )
      sent = true
    }

    if (!sent && streak > 0 && streak % 7 === 0 && prefs?.enableMotivation !== false) {
      await sendToUser(
        userId,
        `${streak} días sin fumar`,
        `¡Has alcanzado ${streak} días sin fumar! Celebra tu progreso.`,
        "streak",
      )
      sent = true
    }

    if (!sent && prefs?.enableMotivation !== false) {
      await sendToUser(
        userId,
        "¡Sigue así!",
        "Vas bien en tu proceso. Cada día sin fumar es una victoria.",
        "motivation",
      )
    }
  } catch (err) {
    console.error("[scheduler] Error processing user", userId, err)
  }
}

const runSchedulerCycle = async (): Promise<void> => {
  console.log("[scheduler] Running notification cycle...")

  try {
    const activeDevices = await UserDevice.distinct("userId", { isActive: true })
    console.log("[scheduler] Active users with devices:", activeDevices.length)

    for (const userId of activeDevices) {
      await processUserNotifications(userId as unknown as string)
    }

    console.log("[scheduler] Cycle complete. Processed", activeDevices.length, "users")
  } catch (err) {
    console.error("[scheduler] Cycle error:", err)
  }
}

export const startScheduler = (): void => {
  if (schedulerTimer) {
    console.log("[scheduler] Already running")
    return
  }

  console.log(`[scheduler] Starting with interval ${SCHEDULER_INTERVAL_MS}ms (${SCHEDULER_INTERVAL_MS / 60000}min)`)
  runSchedulerCycle().catch((err) => console.error("[scheduler] Initial cycle error:", err))
  schedulerTimer = setInterval(() => {
    runSchedulerCycle().catch((err) => console.error("[scheduler] Cycle error:", err))
  }, SCHEDULER_INTERVAL_MS)
}

export const stopScheduler = (): void => {
  if (schedulerTimer) {
    clearInterval(schedulerTimer)
    schedulerTimer = null
    console.log("[scheduler] Stopped")
  }
}
