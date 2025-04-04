import { Schema, model, models } from "mongoose"
import type { IUser } from "./interfaces"

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  status: { type: String, enum: ["active", "inactive", "pending"], default: "active" },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
})

// Evitar redefinición del modelo
export const User = models.User || model<IUser>("User", UserSchema)

