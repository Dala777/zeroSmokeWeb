import { Schema, model, models } from "mongoose"

const RiskSnapshotSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    dateKey: {
      type: String,
      required: true,
    },
    riskLevel: {
      type: String,
      enum: ["bajo", "moderado", "alto"],
      required: true,
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    factors: {
      type: [String],
      default: [],
    },
    cravingLevel: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    mood: {
      type: String,
      default: "",
    },
    smokedToday: {
      type: Boolean,
      default: false,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    completedActivities: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

RiskSnapshotSchema.index({ userId: 1, dateKey: 1 }, { unique: true })

export const RiskSnapshot =
  models.RiskSnapshot || model("RiskSnapshot", RiskSnapshotSchema)

export default RiskSnapshot
