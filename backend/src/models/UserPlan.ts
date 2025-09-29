import { Schema, model, models } from "mongoose"
import type { IUserPlan } from "./interfaces"

const UserPlanSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    currentDay: {
      type: Number,
      default: 1,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedActivities: [
      {
        activityId: {
          type: Schema.Types.ObjectId,
          ref: "Activity",
        },
        completedAt: {
          type: Date,
          default: Date.now,
        },
        dayNumber: { type: Number },
      },
    ],
    fagerstromScore: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
  },
  {
    timestamps: true,
  },
)

// Evitar redefinición del modelo
export const UserPlan = models.UserPlan || model<IUserPlan>("UserPlan", UserPlanSchema)
