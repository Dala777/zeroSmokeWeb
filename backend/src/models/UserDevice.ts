import mongoose, { Schema, Document } from "mongoose"

export interface IUserDevice extends Document {
  userId: mongoose.Types.ObjectId
  fcmToken: string
  platform: "android" | "ios" | "web"
  deviceName?: string
  lastSeenAt: Date
  isActive: boolean
}

const UserDeviceSchema = new Schema<IUserDevice>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fcmToken: { type: String, required: true, unique: true },
    platform: { type: String, enum: ["android", "ios", "web"], required: true },
    deviceName: { type: String },
    lastSeenAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

UserDeviceSchema.index({ userId: 1, isActive: 1 })

export default mongoose.model<IUserDevice>("UserDevice", UserDeviceSchema)
