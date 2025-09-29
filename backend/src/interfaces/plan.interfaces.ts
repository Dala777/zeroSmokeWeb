export interface AssignPlanRequest {
  userId: string
  fagerstromScore: number
}

export interface CompleteActivityRequest {
  userId: string
}

export interface DailyPlanResponse {
  id: string
  dayNumber: number
  planName: string
  activities: ActivityWithStatus[]
  completionPercentage: number
  message: string
}

export interface ActivityWithStatus {
  _id: string
  title: string
  description: string
  type: string
  durationMinutes: number
  scientificBasis: string
  secondaryActivity?: {
    title: string
    description: string
    isOptional: boolean
  }
  isCompleted: boolean
}

export interface PlanProgressResponse {
  userPlan: {
    _id: string
    currentDay: number
    startDate: Date
    isCompleted: boolean
    fagerstromScore: number
  }
  plan: {
    name: string
    duration: number
    dependencyLevel: string
  }
  totalActivities: number
  completedActivities: number
  overallProgress: number
  daysCompleted: number
}
