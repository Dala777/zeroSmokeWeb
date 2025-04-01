import type { Document } from "mongoose"

// Interfaces para los modelos
export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: "admin" | "user"
  status: "active" | "inactive" | "pending"
  lastLogin?: Date
  createdAt: Date
  updatedAt?: Date
}

export interface IArticle extends Document {
  title: string
  excerpt?: string
  content: string
  image?: string
  status: "published" | "draft"
  authorId: string
  author?: string
  createdAt: Date
  updatedAt?: Date
  tags: string[]
}

export interface IFAQ extends Document {
  question: string
  answer: string
  category: string
  createdAt: Date
  updatedAt?: Date
}

export interface IMessage extends Document {
  name: string
  email: string
  subject: string
  message: string
  status: "new" | "read" | "answered"
  createdAt: Date
  updatedAt?: Date
}

