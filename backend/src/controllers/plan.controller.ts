import type { Request, Response } from "express"
import { Plan } from "../models/Plan"
import { Activity } from "../models/Activity"
import { UserPlan } from "../models/UserPlan"
import { User } from "../models/User"

export class PlanController {
  // Asignar plan basado en test de Fagerström
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

      // Verificar si ya tiene un plan activo
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

      // Actualizar usuario con el plan actual
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

  // Obtener plan diario del usuario
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

      // Calcular día actual basado en fecha de inicio
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

      // Marcar actividades completadas
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

      const completedCount = activitiesWithStatus.filter((a) => a.isCompleted).length
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

  // Completar actividad
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

      // Verificar si ya está completada
      const alreadyCompleted = userPlan.completedActivities.some(
        (completed: any) =>
          completed.activityId.toString() === activityId && completed.dayNumber === activity.dayNumber,
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

  // Obtener progreso del plan
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

      // Calcular días transcurridos
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
