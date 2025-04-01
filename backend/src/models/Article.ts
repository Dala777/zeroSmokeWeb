import { Schema, model, models } from "mongoose"
import type { IArticle } from "./interfaces"

const ArticleSchema: Schema = new Schema({
  title: { type: String, required: true },
  excerpt: { type: String },
  content: { type: String, required: true },
  image: { type: String },
  status: { type: String, enum: ["published", "draft"], default: "draft" },
  authorId: { type: String, required: true },
  author: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  tags: [{ type: String }],
})

// Evitar redefinición del modelo
export const Article = models.Article || model<IArticle>("Article", ArticleSchema)

