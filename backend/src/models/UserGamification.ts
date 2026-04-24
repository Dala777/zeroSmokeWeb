import { Schema, model, models } from "mongoose"
import type { IUserGamification } from "./interfaces"

const AchievementSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 60,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    completedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    pointsAwarded: {
      type: Number,
      default: 0,
      min: 0,
    },
    source: {
      type: String,
      trim: true,
      maxlength: 80,
    },
  },
  {
    _id: false,
  },
)

const UserGamificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    motivationPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedAchievements: {
      type: [AchievementSchema],
      default: [],
      validate: {
        validator: (achievements: Array<{ code: string }>) => {
          const uniqueCodes = new Set(achievements.map((achievement) => achievement.code))
          return uniqueCodes.size === achievements.length
        },
        message: "Hay logros duplicados para el mismo usuario",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

UserGamificationSchema.index({ motivationPoints: -1, updatedAt: -1 })
UserGamificationSchema.index({ "completedAchievements.code": 1 })

export const UserGamification =
  models.UserGamification || model<IUserGamification>("UserGamification", UserGamificationSchema)

export default UserGamification
