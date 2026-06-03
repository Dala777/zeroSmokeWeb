import mongoose from "mongoose"
import { User } from "../models/User"
import DailyCheckin from "../models/DailyCheckin"
import CigaretteLog from "../models/CigaretteLog"
import { UserPlan } from "../models/UserPlan"
import RiskSnapshot from "../models/RiskSnapshot"
import { Plan } from "../models/Plan"

const DEMO_PREFIX = "[DataScience Demo]"

const FIRST_NAMES = [
  "Ana", "Carlos", "María", "José", "Laura", "Pedro", "Sofía", "Miguel",
  "Valentina", "Andrés", "Camila", "Diego", "Isabella", "Juan", "Gabriela",
  "Luis", "Fernanda", "Alejandro", "Daniela", "Roberto", "Andrea", "Fernando",
  "Natalia", "Santiago", "Ximena", "Pablo", "Liliana", "Ricardo", "Verónica", "Héctor",
  "Adriana", "Manuel", "Patricia", "Jorge", "Lorena", "Enrique", "Carolina", "Alberto",
  "Marcela", "Rafael", "Diana", "Guillermo", "Mónica", "Francisco", "Alejandra", "Gustavo",
  "Rosa", "Eduardo", "Teresa", "Oscar",
]

const LAST_NAMES = [
  "García", "Rodríguez", "Martínez", "López", "Hernández", "González",
  "Pérez", "Sánchez", "Ramírez", "Torres", "Flores", "Rivera", "Gómez",
  "Díaz", "Reyes", "Morales", "Cruz", "Ortiz", "Mendoza", "Ramos",
]

const SYMPTOMS_POOL = [
  "ansiedad", "insomnio", "dolor de cabeza", "irritabilidad", "mal humor",
  "nerviosismo", "tristeza", "falta de concentración", "cansancio",
  "aumento de apetito", "mareos", "estreñimiento", "tos", "opresión en el pecho",
]

const MOODS = ["happy", "good", "ok", "tired", "sad", "anxious", "stressed", "normal", "great", "calm"]
const HIGH_RISK_MOODS = ["stressed", "anxious", "sad"]
const LOW_RISK_MOODS = ["happy", "great", "calm", "good"]

const EMOTIONS_POOL = [
  "frustrated", "anxious", "stressed", "happy", "sad", "calm", "angry",
  "bored", "tired", "nervous", "hopeful", "motivated", "relaxed", "craving",
]

const CONTEXT_TAGS = [
  "en casa", "en el trabajo", "social", "solo", "después de comer",
  "con café", "estrés", "aburrimiento", "ansiedad", "celebración",
]

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

function generateEmail(name: string): string {
  const [first, ...rest] = name.toLowerCase().split(" ")
  return `${first}.${rest.join("")}${randomInt(100, 999)}@demo.zerosmoke.com`
}

interface UserProfile {
  dependencyLevel: "low" | "moderate" | "high"
  baseCraving: number       // 0-10
  baseMood: string
  relapseProbability: number // 0-1
  planAdherence: number     // 0-100
  fagerstromScore: number   // 0-10
  cigarettesPerDay: number
}

function generateProfile(index: number): UserProfile {
  if (index < 15) {
    return {
      dependencyLevel: "high",
      baseCraving: randomFloat(5, 9),
      baseMood: pick(HIGH_RISK_MOODS),
      relapseProbability: randomFloat(0.3, 0.7),
      planAdherence: randomFloat(20, 60),
      fagerstromScore: randomInt(7, 10),
      cigarettesPerDay: randomInt(15, 30),
    }
  }
  if (index < 35) {
    return {
      dependencyLevel: "moderate",
      baseCraving: randomFloat(3, 6),
      baseMood: pick(MOODS),
      relapseProbability: randomFloat(0.15, 0.45),
      planAdherence: randomFloat(40, 80),
      fagerstromScore: randomInt(4, 7),
      cigarettesPerDay: randomInt(6, 15),
    }
  }
  return {
    dependencyLevel: "low",
    baseCraving: randomFloat(1, 4),
    baseMood: pick(LOW_RISK_MOODS),
    relapseProbability: randomFloat(0.05, 0.25),
    planAdherence: randomFloat(60, 100),
    fagerstromScore: randomInt(1, 4),
    cigarettesPerDay: randomInt(1, 5),
  }
}

async function seedDataScience(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/zerosmoke"
  await mongoose.connect(mongoUri)
  console.log("Conectado a MongoDB")

  const existingDemo = await User.findOne({ name: { $regex: `^${DEMO_PREFIX}` } })
  if (existingDemo) {
    console.log("Eliminando datos demo previos...")
    const demoUsers = await User.find({ name: { $regex: `^${DEMO_PREFIX}` } })
    const demoIds = demoUsers.map((u) => u._id)
    await DailyCheckin.deleteMany({ userId: { $in: demoIds } })
    await CigaretteLog.deleteMany({ userId: { $in: demoIds } })
    await UserPlan.deleteMany({ userId: { $in: demoIds } })
    await RiskSnapshot.deleteMany({ userId: { $in: demoIds } })
    await User.deleteMany({ _id: { $in: demoIds } })
    console.log(`Eliminados ${demoIds.length} usuarios demo previos`)
  }

  const plans = await Plan.find({ isActive: true, dependencyLevel: { $in: ["bajo", "moderado", "alto"] } })
  console.log(`Encontrados ${plans.length} planes activos`)

  let totalCheckins = 0
  let totalSmokingRecords = 0
  let totalPlans = 0
  let totalSnapshots = 0

  for (let i = 0; i < 50; i++) {
    const profile = generateProfile(i)
    const firstName = FIRST_NAMES[i]
    const lastName = pick(LAST_NAMES)
    const fullName = `${DEMO_PREFIX} ${firstName} ${lastName}`

    const user = await User.create({
      name: fullName,
      email: generateEmail(firstName),
      password: "$2a$10$dummy_hash_for_demo_user_do_not_use_in_production",
      role: "user",
      status: "active",
      dependencyLevel: profile.dependencyLevel,
      cigarettesPerDayBaseline: profile.cigarettesPerDay,
      fagerstromScore: profile.fagerstromScore,
      quitDate: new Date(Date.now() - randomInt(35, 90) * 86400000),
      planStartDate: new Date(Date.now() - 30 * 86400000),
    })

    const plan = plans.find((p) => {
      const depMap: Record<string, string> = { low: "bajo", moderate: "moderado", high: "alto" }
      return p.dependencyLevel === depMap[profile.dependencyLevel]
    }) || plans[0]

    let hasRelapsed = false
    const startDate = new Date(Date.now() - 30 * 86400000)
    let consecutiveSmokeDays = 0
    const dailyCravings: number[] = []

    for (let day = 0; day < 30; day++) {
      const date = new Date(startDate.getTime() + day * 86400000)
      const dateKey = date.toISOString().slice(0, 10)

      const cravingVariation = randomFloat(-2, 2)
      const dayCraving = Math.max(0, Math.min(10, profile.baseCraving + cravingVariation))
      dailyCravings.push(dayCraving)

      const stressBonus = profile.dependencyLevel === "high" ? 0.2 : profile.dependencyLevel === "moderate" ? 0.1 : 0
      const dayRelapseProb = profile.relapseProbability + (hasRelapsed ? -0.1 : 0) + stressBonus
      const smokedToday = Math.random() < Math.min(dayRelapseProb, 1)

      if (smokedToday) {
        hasRelapsed = true
        consecutiveSmokeDays++
      } else {
        consecutiveSmokeDays = 0
      }

      const cigarettesCount = smokedToday ? randomInt(1, Math.max(1, Math.round(profile.cigarettesPerDay * 0.6))) : 0

      const hasCravings = smokedToday || Math.random() < 0.6
      const cravingLogCount = hasCravings ? randomInt(1, 3) : 0

      let avgCraving = 0
      if (smokedToday || cravingLogCount > 0) {
        const totalRecords = smokedToday ? cravingLogCount + 1 : cravingLogCount
        let totalC = dayCraving * totalRecords
        avgCraving = totalC / totalRecords
      }

      let checkinMood: string
      if (smokedToday || dayCraving >= 7) {
        checkinMood = pick(HIGH_RISK_MOODS)
      } else if (dayCraving <= 3) {
        checkinMood = pick(LOW_RISK_MOODS)
      } else {
        checkinMood = pick(MOODS)
      }

      const symptomCount = smokedToday || dayCraving >= 5 ? randomInt(1, 4) : randomInt(0, 2)
      const checkinSymptoms = symptomCount > 0
        ? pickRandom(SYMPTOMS_POOL, Math.min(symptomCount, SYMPTOMS_POOL.length))
        : []

      await DailyCheckin.create({
        userId: user._id,
        date,
        dateKey,
        mood: checkinMood,
        cravingLevel: Math.round(dayCraving * 10) / 10,
        smokedToday,
        cigarettesSmokedCount: cigarettesCount,
        symptoms: checkinSymptoms,
      })
      totalCheckins++

      if (cravingLogCount > 0 && cravingLogCount <= 3) {
        for (let c = 0; c < cravingLogCount; c++) {
          const logDate = new Date(date.getTime() + randomInt(6, 20) * 3600000)
          const logCraving = Math.max(0, Math.min(10, dayCraving + randomFloat(-1, 1.5)))
          await CigaretteLog.create({
            userId: user._id,
            timestamp: logDate,
            emotion: pick(EMOTIONS_POOL),
            emotions: pickRandom(EMOTIONS_POOL, randomInt(1, 3)),
            symptoms: pickRandom(SYMPTOMS_POOL, randomInt(0, 2)),
            cravingLevel: Math.round(logCraving * 10) / 10,
            contextTags: pickRandom(CONTEXT_TAGS, randomInt(1, 2)),
            smokedCount: 1,
          })
          totalSmokingRecords++
        }
      }

      const symptomScore = Math.min(checkinSymptoms.length / 5, 1)
      const moodRiskScore = HIGH_RISK_MOODS.includes(checkinMood) ? 0.7
        : LOW_RISK_MOODS.includes(checkinMood) ? 0.15
        : 0.4

      const riskScore = Math.round(
        (smokedToday ? 0.35 : 0) +
        (dayCraving / 10) * 0.30 +
        symptomScore * 0.20 +
        moodRiskScore * 0.15
      ) * 100

      const riskLevel = riskScore >= 70 ? "alto" : riskScore >= 40 ? "moderado" : "bajo"

      const factors: string[] = []
      if (smokedToday) factors.push("smoked_today")
      if (dayCraving >= 7) factors.push("high_craving")
      if (checkinSymptoms.length >= 3) factors.push("multiple_symptoms")
      if (consecutiveSmokeDays >= 3) factors.push("consecutive_relapses")
      if (moodRiskScore >= 0.7) factors.push("negative_mood")

      await RiskSnapshot.create({
        userId: user._id,
        dateKey,
        riskLevel,
        riskScore,
        factors,
        cravingLevel: Math.round(dayCraving),
        mood: checkinMood,
        smokedToday,
        currentStreak: consecutiveSmokeDays,
        completedActivities: 0,
      })
      totalSnapshots++
    }

    const planAdherence = Math.min(100, profile.planAdherence + randomInt(-10, 10))
    const completionDays = Math.round(planAdherence / 100 * 30)

    await UserPlan.create({
      userId: user._id,
      planId: plan._id,
      startDate,
      currentDay: Math.min(completionDays, 30),
      isCompleted: completionDays >= 30,
      status: completionDays >= 30 ? "completed" : "active",
      completedActivities: [],
      fagerstromScore: profile.fagerstromScore,
      completionPercentage: Math.round(planAdherence),
    })
    totalPlans++

    console.log(`[${i + 1}/50] ${firstName} ${lastName} (${profile.dependencyLevel}) - craving: ${profile.baseCraving.toFixed(1)}, recaídas: ${hasRelapsed ? "sí" : "no"}`)
  }

  console.log("\n=== SEED COMPLETADO ===")
  console.log(`Usuarios demo creados: 50`)
  console.log(`Registros DailyCheckin: ${totalCheckins}`)
  console.log(`Registros CigaretteLog: ${totalSmokingRecords}`)
  console.log(`Registros UserPlan: ${totalPlans}`)
  console.log(`Registros RiskSnapshot: ${totalSnapshots}`)
  console.log(`\nDatos generados para 50 usuarios × 30 días con correlaciones realistas.`)

  await mongoose.disconnect()
}

seedDataScience().catch((err) => {
  console.error("Error en seed:", err)
  process.exit(1)
})
