import motivationalMessages, { type MessageCategory } from "../data/motivationalMessages"
import NotificationLog from "../models/NotificationLog"

export interface NotificationUserData {
  daysWithoutSmoking: number
  cigarettesAvoided: number
  moneySaved: number
  dependencyLevel: string
  bestStreak: number
  healthProgress: number
  riskLevel: string
  hasCheckin: boolean
}

export interface GeneratedNotification {
  title: string
  body: string
  type: string
  category: MessageCategory
  messageId: string
}

/**
 * Convierte un template con placeholders en el texto final
 * usando los datos reales del usuario.
 * Placeholders disponibles:
 *   {days}, {cigarettes}, {money}, {dependencyLevel},
 *   {streak}, {bestStreak}, {healthProgress}, {packs},
 *   {weeks}, {months}, {hours}, {monthlySave},
 *   {perCigarette}, {nextMilestone}
 */
function fillTemplate(template: string, data: NotificationUserData): string {
  const d = data.daysWithoutSmoking
  const cigs = data.cigarettesAvoided
  const money = data.moneySaved

  const packs = cigs > 0 ? Math.floor(cigs / 20) : 0
  const weeks = Math.floor(d / 7)
  const months = Math.floor(d / 30)
  const hours = d * 24
  const monthlySave = d > 0 ? (money / Math.max(1, Math.ceil(d / 30))).toFixed(2) : "0.00"
  const perCigarette = cigs > 0 ? (money / cigs).toFixed(2) : "0.00"

  let nextMilestone: number
  if (d < 1) nextMilestone = 1
  else if (d < 7) nextMilestone = 7
  else if (d < 14) nextMilestone = 14
  else if (d < 21) nextMilestone = 21
  else if (d < 30) nextMilestone = 30
  else if (d < 60) nextMilestone = 60
  else if (d < 90) nextMilestone = 90
  else if (d < 180) nextMilestone = 180
  else if (d < 365) nextMilestone = 365
  else nextMilestone = Math.ceil(d / 365) * 365

  return template
    .replace(/{days}/g, String(d))
    .replace(/{cigarettes}/g, String(cigs))
    .replace(/{money}/g, money.toFixed(2))
    .replace(/{dependencyLevel}/g, data.dependencyLevel)
    .replace(/{streak}/g, String(d))
    .replace(/{bestStreak}/g, String(data.bestStreak))
    .replace(/{healthProgress}/g, String(Math.round(data.healthProgress * 100)))
    .replace(/{packs}/g, String(packs))
    .replace(/{weeks}/g, String(weeks))
    .replace(/{months}/g, String(months))
    .replace(/{hours}/g, String(hours))
    .replace(/{monthlySave}/g, monthlySave)
    .replace(/{perCigarette}/g, perCigarette)
    .replace(/{nextMilestone}/g, String(nextMilestone))
}

/**
 * Determina las categorías de mensaje más relevantes
 * según el estado actual del usuario.
 */
function selectCategories(data: NotificationUserData): MessageCategory[] {
  // Si el usuario no ha hecho check-in hoy, priorizar recordatorio
  if (!data.hasCheckin) {
    return ["motivation"]
  }

  // Riesgo alto: priorizar apoyo contra ansiedad
  if (data.riskLevel === "alto") {
    return ["craving", "motivation"]
  }

  // Día de hito (múltiplo de 7): celebrar progreso
  if (data.daysWithoutSmoking > 0 && data.daysWithoutSmoking % 7 === 0) {
    return ["progress", "motivation", "health", "savings"]
  }

  // Primeros 3 días: máximo apoyo motivacional
  if (data.daysWithoutSmoking <= 3) {
    return ["motivation", "craving", "health"]
  }

  // Primeros 7 días: motivación + salud
  if (data.daysWithoutSmoking <= 7) {
    return ["motivation", "health", "savings"]
  }

  // Primera semana a 30 días: combinación variada
  if (data.daysWithoutSmoking <= 30) {
    return ["savings", "health", "motivation", "progress"]
  }

  // Más de 30 días: celebrar logros consolidados
  if (data.daysWithoutSmoking > 30) {
    return ["savings", "health", "progress", "motivation"]
  }

  // Rotación por defecto
  return ["motivation", "savings", "health", "progress", "craving"]
}

/**
 * Genera una notificación personalizada para un usuario
 * basada en su progreso real y evitando mensajes repetidos.
 *
 * Retorna null si no hay mensajes disponibles.
 */
export async function generateNotification(
  userId: string,
  data: NotificationUserData,
): Promise<GeneratedNotification | null> {
  const d = data.daysWithoutSmoking

  // ----- 1) RECORDATORIO DE CHECK-IN (máxima prioridad) -----
  if (!data.hasCheckin) {
    return {
      title: "Check-in pendiente",
      body: "Hoy no has registrado tu check-in. ¿Cómo te sientes? Marcar tu estado diario ayuda a mantener el enfoque.",
      type: "checkin",
      category: "motivation",
      messageId: "checkin_reminder",
    }
  }

  // ----- 2) OBTENER HISTORIAL RECIENTE PARA EVITAR DUPLICADOS -----
  const recentLogs = await NotificationLog.find({ userId })
    .sort({ sentAt: -1 })
    .limit(5)
    .lean()

  const recentMessageIds: string[] = recentLogs
    .map((log) => (log.metadata as Record<string, unknown> | undefined)?.messageId as string | undefined)
    .filter((id): id is string => Boolean(id))

  const recentCategories: MessageCategory[] = recentLogs
    .map((log) => (log.metadata as Record<string, unknown> | undefined)?.category as MessageCategory | undefined)
    .filter((cat): cat is MessageCategory => Boolean(cat))

  // ----- 3) SELECCIONAR CATEGORÍA SEGÚN EL ESTADO DEL USUARIO -----
  const priorityCategories = selectCategories(data)

  // Filtrar categorías que no se hayan enviado recientemente
  let availableCats = priorityCategories.filter(
    (cat) => !recentCategories.includes(cat),
  )

  // Si todas se enviaron recientemente, usar la prioridad original
  if (availableCats.length === 0) {
    availableCats = priorityCategories
  }

  const selectedCategory = availableCats[0]

  // ----- 4) ESCOGER UN MENSAJE DE ESA CATEGORÍA (evitar duplicados) -----
  let pool = motivationalMessages.filter((m) => {
    if (m.category !== selectedCategory) return false
    if (recentMessageIds.includes(m.id)) return false
    return true
  })

  // Si todos los de esa categoría se enviaron, permitir repetir
  if (pool.length === 0) {
    pool = motivationalMessages.filter((m) => m.category === selectedCategory)
  }

  if (pool.length === 0) {
    console.log(`[generator] No messages for category ${selectedCategory}`)
    return null
  }

  // Selección aleatoria
  const selected = pool[Math.floor(Math.random() * pool.length)]

  // ----- 5) LLENAR PLANTILLA CON DATOS REALES -----
  const title = fillTemplate(selected.title, data)
  const body = fillTemplate(selected.bodyTemplate, data)

  // ----- 6) DETERMINAR EL TIPO PARA EL LOG Y LA NOTIFICACIÓN -----
  const typeMap: Record<MessageCategory, string> = {
    motivation: "motivation",
    craving: "craving",
    health: "health",
    savings: "savings",
    progress: "progress",
  }

  return {
    title,
    body,
    type: typeMap[selectedCategory],
    category: selectedCategory,
    messageId: selected.id,
  }
}
