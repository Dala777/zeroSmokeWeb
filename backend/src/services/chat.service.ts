import axios from "axios"
import DailyCheckin from "../models/DailyCheckin"
import SmokingRecord from "../models/SmokingRecord"
import UserGamification from "../models/UserGamification"
import UserProgress from "../models/UserProgress"
import { UserPlan } from "../models/UserPlan"
import { User } from "../models/User"
import { calculateRisk } from "./risk.service"

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
const GROQ_MODEL = process.env.GROQ_MODEL || "llama3-70b-8192"

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

const buildContext = async (userId: string): Promise<string> => {
  const [user, progress, userPlan, gamification, checkins] = await Promise.all([
    User.findById(userId),
    UserProgress.findOne({ userId }),
    UserPlan.findOne({ userId, isCompleted: false }).populate("planId"),
    UserGamification.findOne({ userId }),
    DailyCheckin.find({ userId }).sort({ date: -1 }).limit(5),
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
  return [
    `Usuario: ${user?.name || "usuario ZeroSmoke"}`,
    `Nivel de dependencia: ${user?.dependencyLevel || progress?.dependencyLevel || "no registrado"}`,
    `Puntaje Fagerstrom: ${user?.fagerstromScore ?? progress?.fagerstromScore ?? "no registrado"}`,
    `Plan: dia ${currentDay || "sin dato"} de ${totalDays || "sin dato"}`,
    `Racha actual: ${progress?.daysWithoutSmoking ?? 0} dias`,
    `Mejor racha: ${progress?.bestStreak ?? 0} dias`,
    `Cigarrillos hoy: ${smokedToday}`,
    `Cigarrillos ultimos 7 dias: ${smokedLast7Days}`,
    `Puntos: ${gamification?.motivationPoints ?? 0}`,
    `Logros desbloqueados: ${gamification?.completedAchievements?.length ?? 0}`,
    `Emociones recientes: ${recentMoods}`,
    `Sintomas recientes: ${recentSymptoms}`,
    `Craving promedio reciente: ${averageCraving}/10`,
    `Riesgo contextual basico: ${risk.level} (${risk.score}/100)`,
    `Factores de riesgo: ${risk.factors.length ? risk.factors.join(", ") : "sin factores destacados"}`,
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

    try {
      const context = await buildContext(userId)
      const systemPrompt = [
        "Eres el asistente conversacional de ZeroSmoke.",
        "Responde en espanol, con tono empatico, breve y accionable.",
        "Usa el contexto real del usuario para personalizar la respuesta.",
        "No inventes datos medicos ni diagnosticos. Si hay sintomas graves, recomienda consultar a un profesional.",
        "Cuando detectes riesgo de recaida, ofrece una accion concreta de 1 a 3 pasos.",
        "",
        "Contexto del usuario:",
        context,
      ].join("\n")

      const messages = [
        { role: "system", content: systemPrompt },
        ...history.slice(-8).map((item) => ({
          role: item.role === "user" ? "user" : "assistant",
          content: item.text,
        })),
        { role: "user", content: message },
      ]

      const response = await axios.post(
        GROQ_API_URL,
        {
          model: GROQ_MODEL,
          messages,
          temperature: 0.7,
          max_tokens: 420,
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 20000,
        },
      )

      const reply = response.data?.choices?.[0]?.message?.content?.trim()
      return {
        reply: reply || fallbackReply(message),
        model: GROQ_MODEL,
        fallback: !reply,
      }
    } catch (error) {
      console.error("Error llamando a Groq:", error instanceof Error ? error.message : error)
      return { reply: fallbackReply(message), model: GROQ_MODEL, fallback: true }
    }
  },
}
