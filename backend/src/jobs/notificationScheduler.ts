import UserDevice from "../models/UserDevice"
import NotificationPreference from "../models/NotificationPreference"
import RiskSnapshot from "../models/RiskSnapshot"
import DailyCheckin from "../models/DailyCheckin"
import UserProgress from "../models/UserProgress"
import NotificationLog from "../models/NotificationLog"
import { sendToUser } from "../services/notificationPush.service"
import { generateNotification, type NotificationUserData } from "../services/notificationGenerator.service"

// ================================================================
// CONFIGURACIÓN
// ================================================================

/** Intervalo del ciclo del scheduler (default: 5 min) */
const SCHEDULER_INTERVAL_MS = parseInt(
  process.env.NOTIFICATION_SCHEDULER_INTERVAL || "300000",
  10,
)

/** Ventana matutina: hora de inicio (default: 8am) */
const MORNING_WINDOW_START = parseInt(
  process.env.MORNING_WINDOW_START || "8",
  10,
)

/** Ventana matutina: hora de fin (default: 10am) */
const MORNING_WINDOW_END = parseInt(
  process.env.MORNING_WINDOW_END || "10",
  10,
)

/** Ventana vespertina: hora de inicio (default: 6pm) */
const EVENING_WINDOW_START = parseInt(
  process.env.EVENING_WINDOW_START || "18",
  10,
)

/** Ventana vespertina: hora de fin (default: 8pm) */
const EVENING_WINDOW_END = parseInt(
  process.env.EVENING_WINDOW_END || "20",
  10,
)

/** Máximo de notificaciones por día por usuario (default: 2) */
const MAX_DAILY_NOTIFICATIONS = parseInt(
  process.env.MAX_DAILY_PUSHES || "2",
  10,
)

let schedulerTimer: ReturnType<typeof setInterval> | null = null

// ================================================================
// FUNCIONES AUXILIARES
// ================================================================

/** Determina si la hora actual está dentro de una ventana de envío */
const isInSendWindow = (): boolean => {
  const hour = new Date().getHours()
  return (
    (hour >= MORNING_WINDOW_START && hour < MORNING_WINDOW_END) ||
    (hour >= EVENING_WINDOW_START && hour < EVENING_WINDOW_END)
  )
}

/** Retorna "morning" | "evening" | null según la ventana actual */
const getCurrentWindow = (): "morning" | "evening" | null => {
  const hour = new Date().getHours()
  if (hour >= MORNING_WINDOW_START && hour < MORNING_WINDOW_END) return "morning"
  if (hour >= EVENING_WINDOW_START && hour < EVENING_WINDOW_END) return "evening"
  return null
}

/** Verifica si estamos en horario de silencio según preferencias del usuario */
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

/** Genera la clave de fecha actual en formato YYYY-MM-DD */
const getTodayDateKey = (): string => {
  const today = new Date()
  const year = today.getFullYear()
  const month = `${today.getMonth() + 1}`.padStart(2, "0")
  const day = `${today.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

/** Retorna el inicio del día actual (medianoche) como Date */
const getTodayStart = (): Date => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

// ================================================================
// LÓGICA PRINCIPAL POR USUARIO
// ================================================================

const processUserNotifications = async (
  userId: string,
  window: "morning" | "evening",
): Promise<void> => {
  try {
    // ----- CARGAR PREFERENCIAS -----
    const prefs = await NotificationPreference.findOne({ userId })

    // Respetar horario de silencio del usuario
    if (isInQuietHours(prefs)) {
      console.log(`[scheduler] User ${userId} in quiet hours. Skipping.`)
      return
    }

    // ----- VERIFICAR LÍMITE DIARIO -----
    const todayCount = await NotificationLog.countDocuments({
      userId,
      sentAt: { $gte: getTodayStart() },
    })

    if (todayCount >= MAX_DAILY_NOTIFICATIONS) {
      console.log(
        `[scheduler] User ${userId} already received ${todayCount}/${MAX_DAILY_NOTIFICATIONS} pushes today. Skipping.`,
      )
      return
    }

    // ----- CARGAR DATOS DEL USUARIO -----
    const dateKey = getTodayDateKey()
    const [riskSnapshot, progress, checkin] = await Promise.all([
      RiskSnapshot.findOne({ userId, dateKey }),
      UserProgress.findOne({ userId }),
      DailyCheckin.findOne({ userId, dateKey }),
    ])

    const hasCheckin = Boolean(checkin)
    const riskLevel = String(riskSnapshot?.riskLevel || "bajo")
    const daysWithoutSmoking = Number(progress?.daysWithoutSmoking) || 0
    const cigarettesAvoided = Number(progress?.cigarettesAvoided) || 0
    const moneySaved = Number(progress?.moneySaved) || 0
    const dependencyLevel = String(progress?.dependencyLevel || "Moderado")
    const bestStreak = Number(progress?.bestStreak) || 0
    const healthProgress = Number(progress?.healthProgress) || 0

    // ----- GENERAR NOTIFICACIÓN PERSONALIZADA -----
    const userData: NotificationUserData = {
      daysWithoutSmoking,
      cigarettesAvoided,
      moneySaved,
      dependencyLevel,
      bestStreak,
      healthProgress,
      riskLevel,
      hasCheckin,
    }

    const notification = await generateNotification(userId, userData)

    if (!notification) {
      console.log(`[scheduler] No notification generated for user ${userId}`)
      return
    }

    // ----- ENVIAR NOTIFICACIÓN -----
    await sendToUser(
      userId,
      notification.title,
      notification.body,
      notification.type,
      { category: notification.category, source: "scheduler", window },
      {
        category: notification.category,
        source: "scheduler",
        window,
        messageId: notification.messageId,
        generated: true,
      },
    )

    console.log(
      `[scheduler] Sent "${notification.type}" to user ${userId}: "${notification.title}"`,
    )
  } catch (err) {
    console.error(`[scheduler] Error processing user ${userId}:`, err)
  }
}

// ================================================================
// CICLO PRINCIPAL DEL SCHEDULER
// ================================================================

const runSchedulerCycle = async (): Promise<void> => {
  console.log("[scheduler] Running notification cycle...")

  // Salir temprano si no estamos en ventana de envío
  const currentWindow = getCurrentWindow()
  if (!currentWindow) {
    console.log(
      `[scheduler] Outside send windows (${MORNING_WINDOW_START}-${MORNING_WINDOW_END}, ${EVENING_WINDOW_START}-${EVENING_WINDOW_END}). Skipping cycle.`,
    )
    return
  }

  console.log(`[scheduler] In ${currentWindow} window. Processing active users...`)

  try {
    const activeDevices = await UserDevice.distinct("userId", { isActive: true })
    console.log("[scheduler] Active users with devices:", activeDevices.length)

    let sentCount = 0
    for (const userId of activeDevices) {
      await processUserNotifications(userId as unknown as string, currentWindow)
      sentCount++
    }

    console.log(
      `[scheduler] Cycle complete. Processed ${sentCount} users in ${currentWindow} window.`,
    )
  } catch (err) {
    console.error("[scheduler] Cycle error:", err)
  }
}

// ================================================================
// INICIO / DETENCIÓN
// ================================================================

export const startScheduler = (): void => {
  if (schedulerTimer) {
    console.log("[scheduler] Already running")
    return
  }

  console.log(
    `[scheduler] Starting with interval ${SCHEDULER_INTERVAL_MS}ms (${SCHEDULER_INTERVAL_MS / 60000}min)`,
  )
  console.log(
    `[scheduler] Send windows: ${MORNING_WINDOW_START}-${MORNING_WINDOW_END}h and ${EVENING_WINDOW_START}-${EVENING_WINDOW_END}h`,
  )
  console.log(`[scheduler] Max notifications per day per user: ${MAX_DAILY_NOTIFICATIONS}`)

  // Ejecutar primer ciclo inmediatamente
  runSchedulerCycle().catch((err) =>
    console.error("[scheduler] Initial cycle error:", err),
  )

  // Ciclos posteriores en el intervalo configurado
  schedulerTimer = setInterval(() => {
    runSchedulerCycle().catch((err) =>
      console.error("[scheduler] Cycle error:", err),
    )
  }, SCHEDULER_INTERVAL_MS)
}

export const stopScheduler = (): void => {
  if (schedulerTimer) {
    clearInterval(schedulerTimer)
    schedulerTimer = null
    console.log("[scheduler] Stopped")
  }
}
