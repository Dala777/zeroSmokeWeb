import { Schema, model, models } from "mongoose"
import type { ICigaretteLog } from "./interfaces"

const normalizeValues = (values: string[] = []): string[] =>
  [...new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean))]

const CigaretteLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    emotion: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 50,
    },
    emotions: {
      type: [String],
      default: [],
    },
    symptoms: {
      type: [String],
      default: [],
    },
    physicalSymptoms: {
      type: [String],
      default: [],
    },
    note: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    cravingLevel: {
      type: Number,
      min: 0,
      max: 10,
    },
    contextTags: {
      type: [String],
      default: [],
    },
    smokedCount: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    collection: "smokingrecords",
    timestamps: true,
    versionKey: false,
  },
)

CigaretteLogSchema.pre("validate", function (this: any, next) {
  this.emotions = normalizeValues(this.emotions)
  this.symptoms = normalizeValues(this.symptoms)
  this.physicalSymptoms = normalizeValues(this.physicalSymptoms)
  this.contextTags = normalizeValues(this.contextTags)

  if (!this.emotions.length && this.emotion) {
    this.emotions = normalizeValues([this.emotion])
  }

  if (!this.emotion && this.emotions.length > 0) {
    ;[this.emotion] = this.emotions
  }

  if (!this.physicalSymptoms.length && this.symptoms.length > 0) {
    this.physicalSymptoms = [...this.symptoms]
  }

  if (!this.symptoms.length && this.physicalSymptoms.length > 0) {
    this.symptoms = [...this.physicalSymptoms]
  }

  next()
})

CigaretteLogSchema.index({ userId: 1, timestamp: -1 })
CigaretteLogSchema.index({ userId: 1, emotions: 1, timestamp: -1 })
CigaretteLogSchema.index({ userId: 1, physicalSymptoms: 1, timestamp: -1 })

export const CigaretteLog = models.CigaretteLog || model<ICigaretteLog>("CigaretteLog", CigaretteLogSchema)

export default CigaretteLog
