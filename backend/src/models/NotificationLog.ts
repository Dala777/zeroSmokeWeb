import mongoose, { Schema, Document } from "mongoose"

export interface INotificationLog extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  body: string
  type: "achievement" | "reward" | "streak" | "risk_alert" | "checkin" | "motivation" | "smart" | "craving" | "health" | "savings" | "progress"
  sentAt: Date
  readAt?: Date
  metadata?: Record<string, unknown>
}

const NotificationLogSchema = new Schema<INotificationLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: {
      type: String,
      enum: ["achievement", "reward", "streak", "risk_alert", "checkin", "motivation", "smart", "craving", "health", "savings", "progress"],
      required: true,
    },
    sentAt: { type: Date, default: Date.now },
    readAt: { type: Date },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
)

NotificationLogSchema.index({ userId: 1, sentAt: -1 })

export default mongoose.model<INotificationLog>("NotificationLog", NotificationLogSchema)
