import { Schema, model, models } from "mongoose"

const RewardUnlockSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rewardCode: {
      type: String,
      required: true,
      maxlength: 60,
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
    pointsSpent: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

RewardUnlockSchema.index({ userId: 1, rewardCode: 1 }, { unique: true })

export const RewardUnlock =
  models.RewardUnlock || model("RewardUnlock", RewardUnlockSchema)

export default RewardUnlock
