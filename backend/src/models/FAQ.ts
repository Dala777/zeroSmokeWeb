import { Schema, model, models } from "mongoose"
import type { IFAQ } from "./interfaces"

const FAQSchema: Schema = new Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, required: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
})

// Evitar redefinición del modelo
export const FAQ = models.FAQ || model<IFAQ>("FAQ", FAQSchema)

