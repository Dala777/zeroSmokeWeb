import { Schema, model, models } from "mongoose"
import type { IFAQ } from "./interfaces"

const FAQSchema: Schema = new Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
})

// Evitar redefinición del modelo
export const FAQ = models.FAQ || model<IFAQ>("FAQ", FAQSchema)

