import { Schema, model, models } from "mongoose"
import type { IUserPlan } from "./interfaces"

const CompletedActivitySchema = new Schema(
  {
    activityId: {
      type: Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    dayNumber: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    _id: false,
  },
)

const UserPlanSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    currentDay: {
      type: Number,
      default: 1,
      min: 1,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "completed", "paused", "abandoned"],
      default: "active",
      index: true,
    },
    completedActivities: {
      type: [CompletedActivitySchema],
      default: [],
      validate: {
        validator: (activities: Array<{ activityId: { toString(): string }; dayNumber: number }>) => {
          const keys = new Set(activities.map((activity) => `${activity.activityId.toString()}-${activity.dayNumber}`))
          return keys.size === activities.length
        },
        message: "Hay actividades duplicadas dentro del mismo plan de usuario",
      },
    },
    fagerstromScore: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastCompletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

UserPlanSchema.pre("validate", function (this: any, next) {
  if (this.isCompleted && this.status === "active") {
    this.status = "completed"
  }

  if (this.status === "completed") {
    this.isCompleted = true
    this.endDate = this.endDate || new Date()
  }

  if (this.completedActivities.length > 0) {
    this.lastCompletedAt = this.completedActivities[this.completedActivities.length - 1].completedAt
  }

  next()
})

UserPlanSchema.index({ userId: 1, startDate: -1 })
UserPlanSchema.index({ planId: 1, createdAt: -1 })
UserPlanSchema.index({ userId: 1 }, { unique: true, partialFilterExpression: { isCompleted: false } })

export const UserPlan = models.UserPlan || model<IUserPlan>("UserPlan", UserPlanSchema)
