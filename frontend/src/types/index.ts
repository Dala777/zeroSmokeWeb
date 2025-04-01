// Crear este archivo para definir los tipos usados en el frontend

export interface User {
    _id?: string
    id?: number
    name: string
    email: string
    role: "admin" | "user"
    status: "active" | "inactive" | "pending"
    lastLogin?: Date
    createdAt: Date
    updatedAt?: Date
  }
  
  export interface Article {
    _id?: string
    id: number
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
  
  export interface FAQ {
    _id?: string
    id: number
    question: string
    answer: string
    category: string
    createdAt: Date
    updatedAt?: Date
  }
  
  export interface Message {
    _id?: string
    id: number
    name: string
    email: string
    subject: string
    message: string
    status: "new" | "read" | "answered"
    createdAt: Date
    updatedAt?: Date
  }
  

  