import { Schema, model, models } from "mongoose"
import type { IDailyCheckin } from "./interfaces"

const normalizeValues = (values: string[] = []): string[] =>
  [...new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean))]

const buildDateKey = (value: Date): string => {
  const year = value.getUTCFullYear()
  const month = `${value.getUTCMonth() + 1}`.padStart(2, "0")
  const day = `${value.getUTCDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

const DailyCheckinSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dateKey: {
      type: String,
      required: true,
    },
    mood: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 40,
    },
    cravingLevel: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    smokedToday: {
      type: Boolean,
      required: true,
    },
    cigarettesSmokedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    symptoms: {
      type: [String],
      default: [],
    },
    note: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

DailyCheckinSchema.pre("validate", function (this: any, next) {
  this.dateKey = buildDateKey(this.date || new Date())
  this.symptoms = normalizeValues(this.symptoms)

  if (!this.smokedToday) {
    this.cigarettesSmokedCount = 0
  }

  next()
})

DailyCheckinSchema.index({ userId: 1, dateKey: 1 }, { unique: true })
DailyCheckinSchema.index({ userId: 1, date: -1 })
DailyCheckinSchema.index({ userId: 1, cravingLevel: -1, date: -1 })

export const DailyCheckin = models.DailyCheckin || model<IDailyCheckin>("DailyCheckin", DailyCheckinSchema)

export default DailyCheckin
