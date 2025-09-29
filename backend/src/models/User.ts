import { Schema, model, models } from "mongoose"
import type { IUser } from "./interfaces"

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  status: { type: String, enum: ["active", "inactive", "pending"], default: "active" },
  lastLogin: { type: Date },

  // Campos relacionados con planes (opcionales para no afectar usuarios existentes)
  currentPlanId: {
    type: Schema.Types.ObjectId,
    ref: "Plan",
    required: false,
  },
  fagerstromScore: {
    type: Number,
    required: false,
    min: 0,
    max: 10,
  },
  quitDate: {
    type: Date,
    required: false,
  },
  planStartDate: {
    type: Date,
    required: false,
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
})

// Middleware para actualizar updatedAt
UserSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})

// Evitar redefinición del modelo
export const User = models.User || model<IUser>("User", UserSchema)
