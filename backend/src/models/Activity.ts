import { Schema, model, models } from "mongoose"
import type { IActivity } from "./interfaces"

const ActivitySchema: Schema = new Schema(
  {
    planId: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    dayNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1200,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "exercise",
        "breathing",
        "reflection",
        "social",
        "mindfulness",
        "education",
        "creative",
        "motivation",
        "evaluation",
        "visualization",
        "journaling",
        "relaxation",
        "physical",
        "cognitive",
        "wellness",
        "habit",
        "support",
        "behavioral",
        "tracking",
        "assessment",
        "gamification",
        "selfcare",
        "transition",
        "celebration",
      ],
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    scientificBasis: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    secondaryActivity: {
      title: { type: String, trim: true, maxlength: 160 },
      description: { type: String, trim: true, maxlength: 1200 },
      isOptional: {
        type: Boolean,
        default: true,
      },
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

ActivitySchema.index({ planId: 1, dayNumber: 1, order: 1 })
ActivitySchema.index({ planId: 1, dayNumber: 1, title: 1 }, { unique: true })

export const Activity = models.Activity || model<IActivity>("Activity", ActivitySchema)
