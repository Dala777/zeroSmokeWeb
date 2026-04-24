import { Schema, model, models } from "mongoose"
import type { IUser } from "./interfaces"

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
      index: true,
    },
    lastLogin: { type: Date },
    dependencyLevel: {
      type: String,
      enum: ["low", "moderate", "high"],
      required: false,
      index: true,
    },
    cigarettesPerDayBaseline: {
      type: Number,
      required: false,
      min: 0,
      max: 200,
    },
    cigarettePricePerUnit: {
      type: Number,
      required: false,
      min: 0,
      max: 1000,
    },
    currentPlanId: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      required: false,
      index: true,
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
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.password
        return ret
      },
    },
    toObject: {
      transform: (_doc, ret) => {
        delete ret.password
        return ret
      },
    },
  },
)

UserSchema.index({ email: 1 }, { unique: true })
UserSchema.index({ dependencyLevel: 1, status: 1 })

export const User = models.User || model<IUser>("User", UserSchema)
