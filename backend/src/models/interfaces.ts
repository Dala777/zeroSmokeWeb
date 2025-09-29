import type { Document } from "mongoose"

// Interfaces existentes para los modelos
export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: "admin" | "user"
  status: "active" | "inactive" | "pending"
  lastLogin?: Date
  createdAt: Date
  updatedAt?: Date

  // Nuevos campos opcionales para planes (no afectan funcionalidad existente)
  currentPlanId?: string
  fagerstromScore?: number
  planStartDate?: Date
}

export interface IArticle extends Document {
  title: string
  excerpt?: string
  content: string
  image?: string
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

// Nuevas interfaces para el sistema de planes
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
  dependencyLevel: "bajo" | "moderado" | "alto"
  fagerstromRange: {
    min: number
    max: number
  }
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ISecondaryActivity {
  title: string
  description: string
  isOptional: boolean
}

export interface IActivity extends Document {
  planId: string
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
  activityId: string
  dayNumber: number
  completedAt: Date
}

export interface IUserPlan extends Document {
  userId: string
  planId: string
  startDate: Date
  currentDay: number
  isCompleted: boolean
  completedActivities: ICompletedActivity[]
  fagerstromScore: number
  createdAt: Date
  updatedAt: Date
}

// Interfaces para requests/responses de la API de planes
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
