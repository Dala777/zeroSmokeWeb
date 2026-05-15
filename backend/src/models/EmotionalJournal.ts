import { Schema, model, models } from "mongoose"

const EmotionalJournalSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    mood: {
      type: String,
      required: true,
      maxlength: 40,
    },
    intensity: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    triggers: {
      type: String,
      maxlength: 500,
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

EmotionalJournalSchema.index({ userId: 1, date: -1 })

export const EmotionalJournal =
  models.EmotionalJournal || model("EmotionalJournal", EmotionalJournalSchema)

export default EmotionalJournal
