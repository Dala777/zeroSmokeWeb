import mongoose, { Schema, models, model } from "mongoose"

export interface IUserProgress {
  userId: string
  startDate: Date
  cigarettesPerDay: number
  packagePrice: number
  cigarettesAvoided: number
  moneySaved: number
  daysWithoutSmoking: number
  healthProgress: number
  dependencyLevel: string
  assignedPlan?: string | null
  fagerstromScore: number
  motivations: string[]
  healthMetrics: Record<string, unknown>
  achievements: {
    firstDay: {
      title: string
      description: string
      completed: boolean
      date?: string | null
    }
    firstWeek: {
      title: string
      description: string
      completed: boolean
      date?: string | null
    }
    firstMonth: {
      title: string
      description: string
      completed: boolean
      progress: number
      date?: string | null
    }
    moneySaved: {
      title: string
      description: string
      completed: boolean
      progress: number
      date?: string | null
    }
  }
  weeklyData: Array<{
    weekStart: Date
    dailyCigarettes: number[]
    weeklyGoal: number
    totalSmoked: number
  }>
  createdAt: Date
  updatedAt: Date
}

const UserProgressSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", unique: true, index: true },
    startDate: { type: Date, default: Date.now },
    cigarettesPerDay: { type: Number, required: true, min: 0, max: 200 },
    packagePrice: { type: Number, required: true, min: 0 },
    cigarettesAvoided: { type: Number, default: 0, min: 0 },
    moneySaved: { type: Number, default: 0, min: 0 },
    daysWithoutSmoking: { type: Number, default: 0, min: 0 },
    healthProgress: { type: Number, default: 0, min: 0, max: 1 },
    assignedPlan: { type: Schema.Types.ObjectId, ref: "Plan", default: null, index: true },
    dependencyLevel: {
      type: String,
      enum: [
        "Leve",
        "Moderado",
        "Severo",
        "Dependencia Baja",
        "Dependencia Moderada",
        "Dependencia Alta",
      ],
      default: "Moderado",
    },
    fagerstromScore: { type: Number, default: 0, min: 0, max: 10 },
    motivations: [{ type: String, trim: true }],
    healthMetrics: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
    achievements: {
      firstDay: {
        title: { type: String, default: "Primer dia sin fumar" },
        description: { type: String, default: "Completaste tu primer dia sin fumar" },
        completed: { type: Boolean, default: false },
        date: { type: String, default: null },
      },
      firstWeek: {
        title: { type: String, default: "Una semana sin fumar" },
        description: { type: String, default: "Completaste una semana sin fumar" },
        completed: { type: Boolean, default: false },
        date: { type: String, default: null },
      },
      firstMonth: {
        title: { type: String, default: "Un mes sin fumar" },
        description: { type: String, default: "Completaste un mes sin fumar" },
        completed: { type: Boolean, default: false },
        progress: { type: Number, default: 0, min: 0 },
        date: { type: String, default: null },
      },
      moneySaved: {
        title: { type: String, default: "Ahorrar $200" },
        description: { type: String, default: "Has ahorrado $200 al no fumar" },
        completed: { type: Boolean, default: false },
        progress: { type: Number, default: 0, min: 0 },
        date: { type: String, default: null },
      },
    },
    weeklyData: [
      {
        weekStart: { type: Date, default: Date.now },
        dailyCigarettes: { type: [Number], default: [0, 0, 0, 0, 0, 0, 0] },
        weeklyGoal: { type: Number, default: 0, min: 0 },
        totalSmoked: { type: Number, default: 0, min: 0 },
      },
    ],
  },
  { timestamps: true, versionKey: false },
)

UserProgressSchema.index({ updatedAt: -1 })

const UserProgress = models.UserProgress || model<IUserProgress>("UserProgress", UserProgressSchema)

export default UserProgress
