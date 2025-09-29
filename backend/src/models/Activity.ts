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
    },
    description: {
      type: String,
      required: true,
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
    },
    scientificBasis: {
      type: String,
      required: true,
    },
    secondaryActivity: {
      title: { type: String },
      description: { type: String },
      isOptional: {
        type: Boolean,
        default: true,
      },
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Evitar redefinición del modelo
export const Activity = models.Activity || model<IActivity>("Activity", ActivitySchema)
