// Interfaces para los modelos

export interface User {
    id: number;
    email: string;
    password: string;
    fullName: string;
    isActive: boolean;
    isAdmin: boolean;
    createdAt: Date;
    lastLogin?: Date;
    updatedAt?: Date; // Añadir esta propiedad
  }
  
  export interface Article {
    id: number;
    title: string;
    excerpt?: string;
    content: string;
    image?: string;
    status: 'published' | 'draft';
    authorId: number;
    author?: string;
    createdAt: Date;
    updatedAt?: Date;
    tags: string[];
  }
  
  export interface Message {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'answered';
    createdAt: Date;
    updatedAt?: Date;
  }
  
  export interface FAQ {
    id: number;
    question: string;
    answer: string;
    category: string;
    createdAt: Date;
    updatedAt?: Date;
  }