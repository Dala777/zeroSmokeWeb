// src/models/DailyPlan.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IActivity {
  id: string;
  title: string;
  description: string;
  type: string;
  durationMinutes: number;
  isCompleted: boolean;
}

export interface IDailyPlan extends Document {
  userId: string;
  date: Date;
  activities: IActivity[];
  isCompleted: boolean;
  message: string;
  dayNumber: number;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema: Schema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
  isCompleted: { type: Boolean, default: false },
});

const DailyPlanSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, ref: 'User' },
    date: { type: Date, default: Date.now },
    activities: [ActivitySchema],
    isCompleted: { type: Boolean, default: false },
    message: { type: String, default: '' },
    dayNumber: { type: Number, required: true },
  },
  { timestamps: true }
);

// Exportar el modelo
export default mongoose.model<IDailyPlan>('DailyPlan', DailyPlanSchema);