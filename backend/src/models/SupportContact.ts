import { Schema, model, models } from "mongoose"

const SupportContactSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      maxlength: 120,
    },
    relationship: {
      type: String,
      required: true,
      maxlength: 40,
    },
    phone: {
      type: String,
      required: true,
      maxlength: 20,
    },
    email: {
      type: String,
      maxlength: 120,
    },
    isEmergency: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

SupportContactSchema.index({ userId: 1 })

export const SupportContact =
  models.SupportContact || model("SupportContact", SupportContactSchema)

export default SupportContact
