import mongoose, { Schema } from "mongoose"
import type { IMessage } from "./interfaces"

const MessageSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ["new", "read", "answered"], default: "new" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
})

export const Message = mongoose.model<IMessage>("Message", MessageSchema)

