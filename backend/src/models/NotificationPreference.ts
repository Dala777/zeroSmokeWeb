import { Schema, model, models } from "mongoose"

const NotificationPreferenceSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    enableDailyReminder: {
      type: Boolean,
      default: true,
    },
    enableRiskAlerts: {
      type: Boolean,
      default: true,
    },
    enableMotivation: {
      type: Boolean,
      default: true,
    },
    preferredHour: {
      type: Number,
      default: 9,
      min: 0,
      max: 23,
    },
    quietHoursStart: {
      type: Number,
      default: 22,
      min: 0,
      max: 23,
    },
    quietHoursEnd: {
      type: Number,
      default: 7,
      min: 0,
      max: 23,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

export const NotificationPreference =
  models.NotificationPreference || model("NotificationPreference", NotificationPreferenceSchema)

export default NotificationPreference
