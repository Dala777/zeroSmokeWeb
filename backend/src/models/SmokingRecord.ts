// src/models/SmokingRecord.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ISmokingRecord extends Document {
  userId: string;
  timestamp: Date;
  emotion?: string;
  symptoms: string[];
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SmokingRecordSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    emotion: { type: String },
    symptoms: [{ type: String }],
    note: { type: String },
  },
  { timestamps: true }
);

// Exportar el modelo
export default mongoose.model<ISmokingRecord>('SmokingRecord', SmokingRecordSchema);