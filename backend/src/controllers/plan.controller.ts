import fs from "fs"
import path from "path"
import type { Request, Response } from "express"
import { Plan } from "../models/Plan"
import { Activity } from "../models/Activity"
import { UserPlan } from "../models/UserPlan"
import { User } from "../models/User"
import UserProgress from "../models/UserProgress"
import { ensureUserPlanForProgress } from "../services/userPlan.service"

interface AuthRequest extends Request {
  userId?: string
}

type BackendPlanLevel = "low" | "moderate" | "high"

interface BackendFriendlyActivity {
  day: number
  title: string
  description: string
  secondary: string
  justification: string
}

interface BackendFriendlyPlan {
  level: BackendPlanLevel
  durationDays: number
  description: string
  activities: BackendFriendlyActivity[]
}

interface BackendFriendlyPlansFile {
  plans: BackendFriendlyPlan[]
}

const BACKEND_PLANS_CANDIDATE_PATHS = [
  path.join(__dirname, "../config/planes_backend_friendly.json"),
  path.join(process.cwd(), "src", "config", "planes_backend_friendly.json"),
  path.join(process.cwd(), "dist", "config", "planes_backend_friendly.json"),
]

const LEGACY_TO_BACKEND_LEVEL: Record<string, BackendPlanLevel> = {
  bajo: "low",
  moderado: "moderate",
  alto: "high",
}

let cachedPlansFile: BackendFriendlyPlansFile | null = null

const getBackendFriendlyPlans = (): BackendFriendlyPlansFile => {
  if (cachedPlansFile) {
    return cachedPlansFile
  }

  const plansPath = BACKEND_PLANS_CANDIDATE_PATHS.find((candidatePath) => fs.existsSync(candidatePath))
  if (!plansPath) {
    throw new Error("No se encontró planes_backend_friendly.json")
  }

  let raw = fs.readFileSync(plansPath, "utf-8")
  if (raw.charCodeAt(0) === 0xfeff) {
    raw = raw.slice(1)
  }

  cachedPlansFile = JSON.parse(raw) as BackendFriendlyPlansFile
  return cachedPlansFile
}

const calculateCurrentDay = (startDate: Date, targetDate: Date = new Date()): number => {
  const start = new Date(startDate)
  const target = new Date(targetDate)

  start.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)

  const diffMs = target.getTime() - start.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return diffDays + 1
}

const clampCurrentDay = (currentDay: number, durationDays: number): number =>
  Math.min(Math.max(1, Math.floor(currentDay)), durationDays)

const normalizeDayNumber = (value: unknown): number => {
  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? Math.floor(parsedValue) : NaN
}

export class PlanController {
  async assignPlan(req: Request, res: Response): Promise<void> {
    try {
      const { userId, fagerstromScore } = req.body

      if (!userId || fagerstromScore === undefined) {
        res.status(400).json({
          message: "userId y fagerstromScore son requeridos",
        })
        return
      }

      let dependencyLevel: string
      if (fagerstromScore <= 3) {
        dependencyLevel = "bajo"
      } else if (fagerstromScore <= 6) {
        dependencyLevel = "moderado"
      } else {
        dependencyLevel = "alto"
      }

      const plan = await Plan.findOne({ dependencyLevel })

      if (!plan) {
        res.status(404).json({ message: "Plan no encontrado" })
        return
      }

      const existingUserPlan = await UserPlan.findOne({
        userId,
        isCompleted: false,
      })

      if (existingUserPlan) {
        res.status(400).json({
          message: "Ya tienes un plan activo",
        })
        return
      }

      const userPlan = new UserPlan({
        userId,
        planId: plan._id,
        fagerstromScore,
        startDate: new Date(),
      })

      await userPlan.save()

      await User.findByIdAndUpdate(userId, {
        currentPlanId: plan._id,
        fagerstromScore,
        planStartDate: new Date(),
        quitDate: new Date(),
      })

      const populatedUserPlan = await userPlan.populate("planId")

      res.status(201).json({
        message: "Plan asignado exitosamente",
        userPlan: populatedUserPlan,
      })
    } catch (error: any) {
      res.status(500).json({ message: error.message })
    }
  }

  async getMyPlan(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest
      const authenticatedUserId = authReq.userId

      if (!authenticatedUserId) {
        res.status(401).json({ message: "Usuario no autenticado" })
        return
      }

      let userPlan = await UserPlan.findOne({
        userId: authenticatedUserId,
        isCompleted: false,
      }).populate("planId")

      if (!userPlan) {
        const userProgress = await UserProgress.findOne({ userId: authenticatedUserId })
        if (userProgress) {
          const ensured = await ensureUserPlanForProgress(authenticatedUserId, userProgress)
          userPlan = ensured ? await ensured.userPlan.populate("planId") : null
        }

        if (!userPlan) {
          res.status(404).json({ message: "No tienes un plan activo" })
          return
        }
      }

      const planDocument = userPlan.planId as any
      const backendLevel = planDocument?.dependencyLevel
        ? LEGACY_TO_BACKEND_LEVEL[planDocument.dependencyLevel]
        : undefined

      if (!backendLevel) {
        res.status(500).json({ message: "No se pudo determinar el nivel del plan activo" })
        return
      }

      const plansFile = getBackendFriendlyPlans()
      const plan = plansFile.plans.find((item) => item.level === backendLevel)

      if (!plan) {
        res.status(404).json({ message: "No se encontró el plan en planes_backend_friendly.json" })
        return
      }

      const computedCurrentDay = calculateCurrentDay(new Date(userPlan.startDate), new Date())
      const currentDay = clampCurrentDay(computedCurrentDay, Number(plan.durationDays))
      const availableDays = plan.activities.map((activity) => normalizeDayNumber(activity.day)).filter(Number.isFinite)

      let todayActivities = plan.activities.filter(
        (activity) => Number(activity.day) === Number(currentDay),
      )

      // Salvaguarda temporal: si el match exacto falla pero el día existe normalizado, volvemos a filtrar por enteros normalizados.
      if (todayActivities.length === 0) {
        todayActivities = plan.activities.filter(
          (activity) => normalizeDayNumber(activity.day) === normalizeDayNumber(currentDay),
        )
      }

      console.log("currentDay:", currentDay)
      console.log("days disponibles:", availableDays)
      console.log("resultado:", todayActivities)

      if (todayActivities.length === 0 && availableDays.includes(currentDay)) {
        todayActivities = plan.activities
          .filter((activity) => normalizeDayNumber(activity.day) === currentDay)
          .map((activity) => ({
            ...activity,
            day: normalizeDayNumber(activity.day),
          }))
      }

      if (todayActivities.length === 0) {
        res.status(404).json({
          message: "No se encontraron actividades para el día actual del plan",
          currentDay,
          totalDays: plan.durationDays,
          availableDays,
        })
        return
      }

      res.json({
        currentDay,
        totalDays: plan.durationDays,
        todayActivities,
      })
    } catch (error: any) {
      res.status(500).json({ message: error.message })
    }
  }

  async getDailyPlan(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params
      const { date } = req.query

      const userPlan = await UserPlan.findOne({
        userId,
        isCompleted: false,
      }).populate("planId")

      if (!userPlan) {
        res.status(404).json({
          message: "No tienes un plan activo",
        })
        return
      }

      const startDate = new Date(userPlan.startDate)
      const targetDate = date ? new Date(date as string) : new Date()
      const daysDiff = Math.floor((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

      if (daysDiff < 1 || daysDiff > (userPlan.planId as any).duration) {
        res.status(400).json({
          message: "Fecha fuera del rango del plan",
        })
        return
      }

      const activities = await Activity.find({
        planId: (userPlan.planId as any)._id,
        dayNumber: daysDiff,
      }).sort({ order: 1 })

      const activitiesWithStatus = activities.map((activity) => {
        const isCompleted = userPlan.completedActivities.some(
          (completed: any) =>
            completed.activityId.toString() === activity._id.toString() && completed.dayNumber === daysDiff,
        )

        return {
          ...activity.toObject(),
          isCompleted,
        }
      })

      const completedCount = activitiesWithStatus.filter((activity) => activity.isCompleted).length
      const completionPercentage = activities.length > 0 ? completedCount / activities.length : 0

      res.json({
        id: userPlan._id,
        dayNumber: daysDiff,
        planName: (userPlan.planId as any).name,
        activities: activitiesWithStatus,
        completionPercentage,
        message: `Día ${daysDiff} de ${(userPlan.planId as any).duration} - ${(userPlan.planId as any).name}`,
      })
    } catch (error: any) {
      res.status(500).json({ message: error.message })
    }
  }

  async completeActivity(req: Request, res: Response): Promise<void> {
    try {
      const { planId, activityId } = req.params
      const { userId } = req.body

      const userPlan = await UserPlan.findOne({
        _id: planId,
        userId,
      })

      if (!userPlan) {
        res.status(404).json({
          message: "Plan no encontrado",
        })
        return
      }

      const activity = await Activity.findById(activityId)
      if (!activity) {
        res.status(404).json({
          message: "Actividad no encontrada",
        })
        return
      }

      const alreadyCompleted = userPlan.completedActivities.some(
        (completed: any) => completed.activityId.toString() === activityId && completed.dayNumber === activity.dayNumber,
      )

      if (alreadyCompleted) {
        res.status(400).json({
          message: "Actividad ya completada",
        })
        return
      }

      userPlan.completedActivities.push({
        activityId: activityId,
        dayNumber: activity.dayNumber,
        completedAt: new Date(),
      })

      await userPlan.save()

      res.json({
        message: "Actividad completada exitosamente",
        completedActivity: {
          activityId,
          dayNumber: activity.dayNumber,
          title: activity.title,
        },
      })
    } catch (error: any) {
      res.status(500).json({ message: error.message })
    }
  }

  async getPlanProgress(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params

      const userPlan = await UserPlan.findOne({
        userId,
        isCompleted: false,
      }).populate("planId")

      if (!userPlan) {
        res.status(404).json({
          message: "No tienes un plan activo",
        })
        return
      }

      const totalActivities = await Activity.countDocuments({
        planId: (userPlan.planId as any)._id,
      })

      const completedActivitiesCount = userPlan.completedActivities.length
      const overallProgress = totalActivities > 0 ? (completedActivitiesCount / totalActivities) * 100 : 0

      const startDate = new Date(userPlan.startDate)
      const today = new Date()
      const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

      res.json({
        planName: (userPlan.planId as any).name,
        totalDays: (userPlan.planId as any).duration,
        daysElapsed: Math.min(daysElapsed, (userPlan.planId as any).duration),
        totalActivities,
        completedActivities: completedActivitiesCount,
        overallProgress: Math.round(overallProgress),
        fagerstromScore: userPlan.fagerstromScore,
        startDate: userPlan.startDate,
      })
    } catch (error: any) {
      res.status(500).json({ message: error.message })
    }
  }
}

export const planController = new PlanController()
