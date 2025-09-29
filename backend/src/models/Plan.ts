import { Schema, model, models } from "mongoose"
import type { IPlan } from "./interfaces"

const PlanSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["Dependencia Baja", "Dependencia Moderada", "Dependencia Alta"],
    },
    duration: {
      type: Number,
      required: true, // 45, 60, 90 días
    },
    dependencyLevel: {
      type: String,
      required: true,
      enum: ["bajo", "moderado", "alto"],
    },
    fagerstromRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    description: { type: String },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Evitar redefinición del modelo
export const Plan = models.Plan || model<IPlan>("Plan", PlanSchema)
