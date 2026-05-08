import { Plan } from "../models/Plan"
import { UserPlan } from "../models/UserPlan"
import { User } from "../models/User"

type BackendUserLevel = "low" | "moderate" | "high"
type PlanLevel = "bajo" | "moderado" | "alto"

interface ProgressLike {
  dependencyLevel?: string
  fagerstromScore?: number
  startDate?: Date
}

export interface EnsuredUserPlanResult {
  userPlan: any
  plan: any
  userDependencyLevel: BackendUserLevel
  planDependencyLevel: PlanLevel
}

const LEVEL_ALIASES: Record<string, { user: BackendUserLevel; plan: PlanLevel }> = {
  leve: { user: "low", plan: "bajo" },
  baja: { user: "low", plan: "bajo" },
  bajo: { user: "low", plan: "bajo" },
  low: { user: "low", plan: "bajo" },
  moderado: { user: "moderate", plan: "moderado" },
  moderada: { user: "moderate", plan: "moderado" },
  moderate: { user: "moderate", plan: "moderado" },
  severo: { user: "high", plan: "alto" },
  severa: { user: "high", plan: "alto" },
  alta: { user: "high", plan: "alto" },
  alto: { user: "high", plan: "alto" },
  high: { user: "high", plan: "alto" },
}

export const normalizePlanLevels = (
  dependencyLevel?: string,
  fagerstromScore: number = 0,
): { user: BackendUserLevel; plan: PlanLevel } => {
  const normalizedLevel = (dependencyLevel || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/^dependencia\s+/, "")

  const alias = LEVEL_ALIASES[normalizedLevel]
  if (alias) {
    return alias
  }

  if (fagerstromScore <= 3) return { user: "low", plan: "bajo" }
  if (fagerstromScore <= 6) return { user: "moderate", plan: "moderado" }
  return { user: "high", plan: "alto" }
}

const findMatchingPlan = async (planDependencyLevel: PlanLevel, fagerstromScore: number): Promise<any> => {
  const rangedPlan = await Plan.findOne({
    dependencyLevel: planDependencyLevel,
    isActive: true,
    "fagerstromRange.min": { $lte: fagerstromScore },
    "fagerstromRange.max": { $gte: fagerstromScore },
  })

  if (rangedPlan) {
    return rangedPlan
  }

  return Plan.findOne({
    dependencyLevel: planDependencyLevel,
    isActive: true,
  })
}

export const ensureUserPlanForProgress = async (
  userId: string,
  userProgress: ProgressLike,
): Promise<EnsuredUserPlanResult | null> => {
  const fagerstromScore = Number.isFinite(Number(userProgress.fagerstromScore))
    ? Number(userProgress.fagerstromScore)
    : 0
  const { user: userDependencyLevel, plan: planDependencyLevel } = normalizePlanLevels(
    userProgress.dependencyLevel,
    fagerstromScore,
  )

  const plan = await findMatchingPlan(planDependencyLevel, fagerstromScore)
  if (!plan) {
    console.warn(
      `No se encontro Plan activo para dependencia ${planDependencyLevel} y Fagerstrom ${fagerstromScore}`,
    )
    return null
  }

  let userPlan = await UserPlan.findOne({
    userId,
    isCompleted: false,
  })

  if (!userPlan) {
    userPlan = new UserPlan({
      userId,
      planId: plan._id,
      fagerstromScore,
      startDate: userProgress.startDate || new Date(),
      currentDay: 1,
      isCompleted: false,
      status: "active",
    })

    await userPlan.save()
  }

  await User.findByIdAndUpdate(userId, {
    dependencyLevel: userDependencyLevel,
    currentPlanId: userPlan.planId || plan._id,
    fagerstromScore,
    planStartDate: userPlan.startDate || userProgress.startDate || new Date(),
    quitDate: userProgress.startDate || userPlan.startDate || new Date(),
  })

  return {
    userPlan,
    plan,
    userDependencyLevel,
    planDependencyLevel,
  }
}
