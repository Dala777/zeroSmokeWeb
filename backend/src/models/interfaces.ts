import mongoose, { Document, Schema } from 'mongoose';

// Interfaces
export interface IArticle extends Document {
  title: string;
  excerpt?: string;
  content: string;
  image?: string;
  status: 'published' | 'draft';
  authorId: mongoose.Types.ObjectId | string;
  author?: string;
  createdAt: Date;
  updatedAt?: Date;
  tags: string[];
}

export interface IFAQ extends Document {
  question: string;
  answer: string;
  category: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IMessage extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'answered';
  createdAt: Date;
  updatedAt?: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

// Schemas
const ArticleSchema = new Schema<IArticle>({
  title: { type: String, required: true },
  excerpt: { type: String },
  content: { type: String, required: true },
  image: { type: String },
  status: { type: String, enum: ['published', 'draft'], default: 'draft' },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  author: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  tags: [{ type: String }]
});

const FAQSchema = new Schema<IFAQ>({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

const MessageSchema = new Schema<IMessage>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['new', 'read', 'answered'], default: 'new' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'pending' },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

// Models
export const Article = mongoose.model<IArticle>('Article', ArticleSchema);
export const FAQ = mongoose.model<IFAQ>('FAQ', FAQSchema);
export const Message = mongoose.model<IMessage>('Message', MessageSchema);
export const User = mongoose.model<IUser>('User', UserSchema);