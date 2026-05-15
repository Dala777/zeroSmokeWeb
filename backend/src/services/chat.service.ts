import axios from "axios"
import DailyCheckin from "../models/DailyCheckin"
import DailyPlan from "../models/DailyPlan"
import RewardUnlock from "../models/RewardUnlock"
import SmokingRecord from "../models/SmokingRecord"
import UserGamification from "../models/UserGamification"
import UserProgress from "../models/UserProgress"
import { UserPlan } from "../models/UserPlan"
import { User } from "../models/User"
import { calculateRisk } from "./risk.service"
import EmotionalJournal from "../models/EmotionalJournal"

export interface ChatHistoryItem {
  role: "user" | "assistant" | "system"
  text: string
}

export interface ChatResult {
  reply: string
  model: string
  fallback: boolean
}

const GROQ_API_URL = process.env.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions"
const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile"
const GROQ_FALLBACK_MODEL = "llama-3.3-70b-versatile"

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

const countSmokingRecords = (records: any[]): number => {
  const checkinRecordsByDay = new Map<string, any>()
  let manualTotal = 0

  records.forEach((record) => {
    const isCheckinRecord = Array.isArray(record.contextTags) && record.contextTags.includes("daily-checkin")
    if (!isCheckinRecord) {
      manualTotal += Number(record.smokedCount) || 1
      return
    }

    const key = startOfDay(new Date(record.timestamp)).toISOString()
    if (!checkinRecordsByDay.has(key)) {
      checkinRecordsByDay.set(key, record)
    }
  })

  return manualTotal + [...checkinRecordsByDay.values()]
    .reduce((total, record) => total + (Number(record.smokedCount) || 1), 0)
}

const getClosestAchievements = (achievements: any[], totalPoints: number): string => {
  if (!achievements || achievements.length === 0) return "sin logros cercanos"

  const unlockedCodes = new Set(achievements.map((a: any) => a.code))

  const allDefs = [
    { code: "first_day", title: "Primer día sin fumar", threshold: (s: number) => s >= 1 },
    { code: "three_days", title: "3 días sin fumar", threshold: (s: number) => s >= 3 },
    { code: "first_week", title: "1 semana sin fumar", threshold: (s: number) => s >= 7 },
    { code: "first_month", title: "1 mes sin fumar", threshold: (s: number) => s >= 30 },
    { code: "money_saved_50", title: "Ahorrar $50", threshold: (m: number) => m >= 50 },
    { code: "money_saved_200", title: "Ahorrar $200", threshold: (m: number) => m >= 200 },
  ]

  return allDefs
    .filter((d) => !unlockedCodes.has(d.code))
    .map((d) => d.title)
    .slice(0, 3)
    .join(", ") || "sin logros cercanos"
}

const buildContext = async (userId: string): Promise<string> => {
  const [user, progress, userPlan, gamification, checkins, recentEmotions, rewards] = await Promise.all([
    User.findById(userId),
    UserProgress.findOne({ userId }),
    UserPlan.findOne({ userId, isCompleted: false }).populate("planId"),
    UserGamification.findOne({ userId }),
    DailyCheckin.find({ userId }).sort({ date: -1 }).limit(5),
    EmotionalJournal.find({ userId }).sort({ date: -1 }).limit(3),
    RewardUnlock.find({ userId }),
  ])
  const risk = await calculateRisk(userId)

  const today = new Date()
  const weekStart = startOfDay(today)
  weekStart.setDate(weekStart.getDate() - 6)
  const [todayRecords, recentRecords] = await Promise.all([
    SmokingRecord.find({ userId, timestamp: { $gte: startOfDay(today), $lt: endOfDay(today) } }),
    SmokingRecord.find({ userId, timestamp: { $gte: weekStart } }).sort({ timestamp: -1 }),
  ])

  const activePlan = userPlan?.planId as any
  const totalDays = Number(activePlan?.durationDays || activePlan?.duration || 0)
  const currentDay = Number(userPlan?.currentDay || 0)
  const recentMoods = checkins.map((checkin: any) => checkin.mood).filter(Boolean).join(", ") || "sin datos recientes"
  const recentSymptoms = checkins
    .flatMap((checkin: any) => Array.isArray(checkin.symptoms) ? checkin.symptoms : [])
    .filter(Boolean)
    .slice(0, 8)
    .join(", ") || "sin sintomas recientes"

  const smokedToday = countSmokingRecords(todayRecords)
  const smokedLast7Days = countSmokingRecords(recentRecords)
  const cravingLevels = checkins.map((checkin: any) => Number(checkin.cravingLevel) || 0)
  const averageCraving = cravingLevels.length
    ? Math.round((cravingLevels.reduce((total, value) => total + value, 0) / cravingLevels.length) * 10) / 10
    : 0

  const streak = Number(progress?.daysWithoutSmoking) || 0
  const moneySaved = Number(progress?.moneySaved) || 0
  const baselineDaily = Number(progress?.cigarettesPerDay) || 0
  const baselineWeekly = baselineDaily * 7
  const reductionPct = baselineWeekly > 0
    ? Math.round(((baselineWeekly - Math.max(smokedLast7Days, 0)) / baselineWeekly) * 100)
    : 0

  const completedAchievements = gamification?.completedAchievements || []
  const achievements = getClosestAchievements(completedAchievements, streak)

  const unlockedRewards = rewards.map((r) => r.rewardCode).join(", ") || "ninguna"

  const dailyPlan = await DailyPlan.findOne({ userId, date: { $gte: startOfDay(today), $lt: endOfDay(today) } })
  const planActivities = Array.isArray((dailyPlan as any)?.activities) ? (dailyPlan as any).activities : []
  const totalActivities = planActivities.length
  const completedActivities = planActivities.filter((a: any) => a.isCompleted).length
  const pendingActivities = totalActivities - completedActivities

  const recentEmotionMoods = recentEmotions.map((e: any) => e.mood).join(", ") || "sin entradas recientes"

  return [
    `Usuario: ${user?.name || "usuario ZeroSmoke"}`,
    `Nivel de dependencia: ${user?.dependencyLevel || progress?.dependencyLevel || "no registrado"}`,
    `Puntaje Fagerstrom: ${user?.fagerstromScore ?? progress?.fagerstromScore ?? "no registrado"}`,
    `Plan: dia ${currentDay || "sin dato"} de ${totalDays || "sin dato"}`,
    `Racha actual: ${streak} dias`,
    `Mejor racha: ${progress?.bestStreak ?? 0} dias`,
    `Cigarrillos hoy: ${smokedToday}`,
    `Cigarrillos ultimos 7 dias: ${smokedLast7Days}`,
    `Reduccion semanal: ${reductionPct}%`,
    `Puntos de motivacion: ${gamification?.motivationPoints ?? 0}`,
    `Logros desbloqueados: ${completedAchievements.length}`,
    `Logros cercanos: ${achievements}`,
    `Recompensas desbloqueadas: ${unlockedRewards}`,
    `Actividades pendientes hoy: ${pendingActivities}`,
    `Emociones recientes (checkin): ${recentMoods}`,
    `Sintomas recientes: ${recentSymptoms}`,
    `Estado emocional (diario): ${recentEmotionMoods}`,
    `Craving promedio reciente: ${averageCraving}/10`,
    `Dinero ahorrado: $${moneySaved.toFixed(2)}`,
    `Nivel de riesgo: ${risk.level} (${risk.score}/100)`,
    `Factores de riesgo: ${risk.factors.length ? risk.factors.join(", ") : "ninguno"}`,
  ].join("\n")
}

const fallbackReply = (message: string): string => {
  const lower = message.toLowerCase()
  if (lower.includes("antojo") || lower.includes("ansiedad")) {
    return "Estoy contigo. Haz una pausa de 2 minutos: respira lento, toma agua y cambia de lugar. Si el antojo sigue, abre tu plan diario y completa una actividad corta antes de decidir fumar."
  }
  if (lower.includes("reca")) {
    return "Un desliz no borra tu progreso. Registra lo que paso, identifica el detonante y vuelve al siguiente paso del plan. Lo importante ahora es cortar la cadena, no castigarte."
  }
  return "Puedo ayudarte con tu proceso de dejar de fumar. Ahora mismo no pude conectar con la IA externa, pero puedo orientarte: dime si necesitas manejar un antojo, revisar tu progreso o entender un sintoma."
}

export const chatService = {
  async sendMessage(userId: string, message: string, history: ChatHistoryItem[] = []): Promise<ChatResult> {
    if (!GROQ_API_KEY) {
      return { reply: fallbackReply(message), model: GROQ_MODEL, fallback: true }
    }

    let messages: { role: string; content: string }[] = []

    try {
      const context = await buildContext(userId)
      const systemPrompt = [
        "Eres el asistente conversacional de ZeroSmoke, una app para dejar de fumar.",
        "Responde SIEMPRE en espanol, con tono EMPATICO, CALIDO y BREVE (max 3 parrafos).",
        "",
        "REGLAS DE CONDUCTA:",
        "- Usa el contexto real del usuario para personalizar cada respuesta.",
        "- PRIORIZA el apoyo emocional sobre las estadisticas.",
        "- NO repitas datos numericos a menos que el usuario los pida explicitamente.",
        "- No inventes datos medicos ni diagnosticos.",
        "- Si hay sintomas graves, recomienda consultar a un profesional.",
        "- Cuando detectes riesgo de recaida, ofrece UNA accion concreta de 1 a 3 pasos.",
        "- Sugiere acciones especificas del plan diario, red de apoyo o distracciones.",
        "- Reconoce el esfuerzo del usuario genuinamente.",
        "- Si el usuario esta animado, celebra con el. Si esta desanimado, valida y motiva.",
        "- Manten las respuestas conversacionales, no robotizadas.",
        "",
        "Contexto del usuario:",
        context,
      ].join("\n")

      messages = [
        { role: "system", content: systemPrompt },
        ...history.slice(-10).map((item) => ({
          role: item.role === "user" ? "user" : "assistant",
          content: item.text,
        })),
        { role: "user", content: message },
      ]

      const payload = {
        model: GROQ_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 450,
      }

      console.log("[Groq] Modelo usado:", GROQ_MODEL)
      console.log("[Groq] Mensajes:", messages.length)

      const response = await axios.post(GROQ_API_URL, payload, {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      })

      console.log("[Groq] response.status:", response.status)

      const reply = response.data?.choices?.[0]?.message?.content?.trim()
      if (reply) {
        return { reply, model: GROQ_MODEL, fallback: false }
      }

      throw new Error("Respuesta vacía de Groq")
    } catch (error: any) {
      console.error("[Groq] Error:", error instanceof Error ? error.message : error)
      console.error("[Groq] Error data:", JSON.stringify(error?.response?.data))

      if (error?.config?.data && messages.length > 0) {
        try {
          const fallbackRes = await axios.post(GROQ_API_URL, {
            model: GROQ_FALLBACK_MODEL,
            messages,
            temperature: 0.7,
            max_tokens: 450,
          }, {
            headers: {
              Authorization: `Bearer ${GROQ_API_KEY}`,
              "Content-Type": "application/json",
            },
            timeout: 20000,
          })
          const fallbackReplyText = fallbackRes.data?.choices?.[0]?.message?.content?.trim()
          if (fallbackReplyText) {
            return { reply: fallbackReplyText, model: GROQ_FALLBACK_MODEL, fallback: false }
          }
        } catch (fallbackError: any) {
          console.error("[Groq] Fallback tambien fallo:", fallbackError.message)
        }
      }

      return { reply: fallbackReply(message), model: GROQ_MODEL, fallback: true }
    }
  },
}
