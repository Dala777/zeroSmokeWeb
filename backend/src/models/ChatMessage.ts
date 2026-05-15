import { Schema, model, models } from "mongoose"

const ChatMessageSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

ChatMessageSchema.index({ userId: 1, createdAt: -1 })

export const ChatMessage =
  models.ChatMessage || model("ChatMessage", ChatMessageSchema)

export default ChatMessage
