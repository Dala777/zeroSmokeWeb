import { Schema, model, models } from "mongoose"
import type { IPlan } from "./interfaces"

const levelToLegacy: Record<string, "bajo" | "moderado" | "alto"> = {
  low: "bajo",
  moderate: "moderado",
  high: "alto",
}

const legacyToLevel: Record<string, "low" | "moderate" | "high"> = {
  bajo: "low",
  moderado: "moderate",
  alto: "high",
}

const PlanSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["Dependencia Baja", "Dependencia Moderada", "Dependencia Alta"],
      trim: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    dependencyLevel: {
      type: String,
      required: true,
      enum: ["bajo", "moderado", "alto"],
      index: true,
    },
    fagerstromRange: {
      min: { type: Number, required: true, min: 0, max: 10 },
      max: { type: Number, required: true, min: 0, max: 10 },
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    version: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

PlanSchema.path("fagerstromRange").validate(
  (value: { min: number; max: number }) => value.min <= value.max,
  "El rango de Fagerstrom es invalido",
)

PlanSchema.virtual("level")
  .get(function (this: any) {
    return legacyToLevel[this.dependencyLevel]
  })
  .set(function (this: any, value: string) {
    this.dependencyLevel = levelToLegacy[value] || value
  })

PlanSchema.virtual("durationDays")
  .get(function (this: any) {
    return this.duration
  })
  .set(function (this: any, value: number) {
    this.duration = value
  })

PlanSchema.virtual("activities", {
  ref: "Activity",
  localField: "_id",
  foreignField: "planId",
  justOne: false,
})

PlanSchema.index({ dependencyLevel: 1, isActive: 1, version: -1 })
PlanSchema.index(
  { dependencyLevel: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } },
)

export const Plan = models.Plan || model<IPlan>("Plan", PlanSchema)

export default Plan
