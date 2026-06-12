import type { Document, Types } from "mongoose"

export type UserDependencyLevel = "low" | "moderate" | "high"
export type PlanDependencyLevel = "bajo" | "moderado" | "alto"
export type UserRole = "admin" | "user"
export type UserStatus = "active" | "inactive" | "pending"
export type UserPlanStatus = "active" | "completed" | "paused" | "abandoned"

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: UserRole
  status: UserStatus
  lastLogin?: Date
  dependencyLevel?: UserDependencyLevel
  cigarettesPerDayBaseline?: number
  cigarettePricePerUnit?: number
  currentPlanId?: Types.ObjectId | string
  fagerstromScore?: number
  quitDate?: Date
  planStartDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IArticle extends Document {
  title: string
  excerpt?: string
  content: string
  image?: string
  category: "Educacion" | "Salud" | "Consejos" | "Investigacion" | "Motivacion" | "General"
  status: "published" | "draft"
  authorId: string
  author?: string
  createdAt: Date
  updatedAt?: Date
  tags: string[]
}

export interface IFAQ extends Document {
  question: string
  answer: string
  category: string
  status: "active" | "inactive"
  order: number
  createdAt: Date
  updatedAt?: Date
}

export interface IMessage extends Document {
  name: string
  email: string
  subject: string
  message: string
  status: "new" | "read" | "answered"
  createdAt: Date
  updatedAt?: Date
}

export type ActivityType =
  | "exercise"
  | "breathing"
  | "reflection"
  | "social"
  | "mindfulness"
  | "education"
  | "creative"
  | "motivation"
  | "evaluation"
  | "visualization"
  | "journaling"
  | "relaxation"
  | "physical"
  | "cognitive"
  | "wellness"
  | "habit"
  | "support"
  | "behavioral"
  | "tracking"
  | "assessment"
  | "gamification"
  | "selfcare"
  | "transition"
  | "celebration"

export interface IPlan extends Document {
  name: string
  duration: number
  dependencyLevel: PlanDependencyLevel
  fagerstromRange: {
    min: number
    max: number
  }
  description?: string
  isActive: boolean
  version: number
  createdAt: Date
  updatedAt: Date
}

export interface ISecondaryActivity {
  title: string
  description: string
  isOptional: boolean
}

export interface IActivity extends Document {
  planId: Types.ObjectId | string
  dayNumber: number
  title: string
  description: string
  type: ActivityType
  durationMinutes: number
  scientificBasis: string
  secondaryActivity?: ISecondaryActivity
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface ICompletedActivity {
  activityId: Types.ObjectId | string
  dayNumber: number
  completedAt: Date
}

export interface IUserPlan extends Document {
  userId: Types.ObjectId | string
  planId: Types.ObjectId | string
  startDate: Date
  endDate?: Date
  currentDay: number
  isCompleted: boolean
  status: UserPlanStatus
  completedActivities: ICompletedActivity[]
  fagerstromScore: number
  completionPercentage?: number
  lastCompletedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IDailyCheckin extends Document {
  userId: Types.ObjectId | string
  date: Date
  dateKey: string
  mood: string
  cravingLevel: number
  smokedToday: boolean
  cigarettesSmokedCount: number
  symptoms: string[]
  note?: string
  createdAt: Date
  updatedAt: Date
}

export interface ICigaretteLog extends Document {
  userId: Types.ObjectId | string
  timestamp: Date
  emotion?: string
  emotions: string[]
  symptoms: string[]
  physicalSymptoms: string[]
  note?: string
  cravingLevel?: number
  contextTags: string[]
  smokedCount: number
  createdAt: Date
  updatedAt: Date
}

export interface ICompletedAchievement {
  code: string
  title: string
  description?: string
  completedAt: Date
  pointsAwarded: number
  source?: string
}

export interface IUserGamification extends Document {
  userId: Types.ObjectId | string
  motivationPoints: number
  completedAchievements: ICompletedAchievement[]
  createdAt: Date
  updatedAt: Date
}

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
  activities: Array<IActivity & { isCompleted: boolean }>
  completionPercentage: number
  message: string
}
