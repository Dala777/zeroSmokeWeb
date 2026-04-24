import { Schema, model, models } from "mongoose"

interface IActivity {
  id: string
  title: string
  description: string
  type: string
  durationMinutes: number
  isCompleted: boolean
  justification?: string
  secondaryActivity?: {
    title: string
    description: string
    isOptional: boolean
  }
}

export interface IDailyPlan {
  userId: string
  date: Date
  activities: IActivity[]
  isCompleted: boolean
  message: string
  dayNumber: number
  createdAt: Date
  updatedAt: Date
}

const ActivitySchema: Schema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 1200 },
    type: { type: String, required: true, trim: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    isCompleted: { type: Boolean, default: false },
    justification: { type: String, default: "", trim: true, maxlength: 1200 },
    secondaryActivity: {
      title: { type: String, default: "", trim: true, maxlength: 160 },
      description: { type: String, default: "", trim: true, maxlength: 1200 },
      isOptional: { type: Boolean, default: true },
    },
  },
  {
    _id: false,
  },
)

const DailyPlanSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    date: { type: Date, default: Date.now, index: true },
    activities: { type: [ActivitySchema], default: [] },
    isCompleted: { type: Boolean, default: false },
    message: { type: String, default: "", trim: true, maxlength: 500 },
    dayNumber: { type: Number, required: true, min: 1 },
  },
  { timestamps: true, versionKey: false },
)

DailyPlanSchema.index({ userId: 1, date: 1 }, { unique: true })
DailyPlanSchema.index({ userId: 1, dayNumber: 1 })

const DailyPlan = models.DailyPlan || model<IDailyPlan>("DailyPlan", DailyPlanSchema)

export default DailyPlan
