// src/models/UserProgress.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProgress extends Document {
  userId: string;
  startDate: Date;
  cigarettesPerDay: number;
  packagePrice: number;
  cigarettesAvoided: number;
  moneySaved: number;
  daysWithoutSmoking: number;
  healthProgress: number;
  dependencyLevel: string;
  assignedPlan?: any; // reference to Plan document or ID (optional)  fagerstromScore: number;
  motivations: string[];
  healthMetrics: Record<string, any>;
  achievements: {
    firstDay: {
      title: string;
      description: string;
      completed: boolean;
      date?: string;
    };
    firstWeek: {
      title: string;
      description: string;
      completed: boolean;
      date?: string;
    };
    firstMonth: {
      title: string;
      description: string;
      completed: boolean;
      progress: number;
      date?: string;
    };
    moneySaved: {
      title: string;
      description: string;
      completed: boolean;
      progress: number;
      date?: string;
    };
  };
  weeklyData: Array<{
    weekStart: Date;
    dailyCigarettes: number[];
    weeklyGoal: number;
    totalSmoked: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const UserProgressSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, ref: 'User' },
    startDate: { type: Date, default: Date.now },
    cigarettesPerDay: { type: Number, required: true },
    packagePrice: { type: Number, required: true },
    cigarettesAvoided: { type: Number, default: 0 },
    moneySaved: { type: Number, default: 0 },
    daysWithoutSmoking: { type: Number, default: 0 },
    healthProgress: { type: Number, default: 0 },
    // referencia al plan asignado (opcional)
    assignedPlan: { type: String, ref: 'Plan', default: null },
    // el nivel de dependencia puede venir en forma amigable desde el cliente
    // o en una de las etiquetas cortas que se usan internamente.
    // expandimos el enum para aceptar ambos formatos y prevenir errores de validación.
    dependencyLevel: { 
      type: String, 
      enum: [
        'Leve',
        'Moderado',
        'Severo',
        'Dependencia Baja',
        'Dependencia Moderada',
        'Dependencia Alta',
      ],
      default: 'Moderado' 
    },
    // puntaje obtenido en el test de Fagerström (0-10)
    fagerstromScore: { type: Number, default: 0 },
    motivations: [{ type: String }],
    healthMetrics: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
    achievements: {
      firstDay: {
        title: { type: String, default: "Primer día sin fumar" },
        description: { type: String, default: "Completaste tu primer día sin fumar" },
        completed: { type: Boolean, default: false },
        date: { type: String, default: null }
      },
      firstWeek: {
        title: { type: String, default: "Una semana sin fumar" },
        description: { type: String, default: "Completaste una semana sin fumar" },
        completed: { type: Boolean, default: false },
        date: { type: String, default: null }
      },
      firstMonth: {
        title: { type: String, default: "Un mes sin fumar" },
        description: { type: String, default: "Completaste un mes sin fumar" },
        completed: { type: Boolean, default: false },
        progress: { type: Number, default: 0 },
        date: { type: String, default: null }
      },
      moneySaved: {
        title: { type: String, default: "Ahorrar $200" },
        description: { type: String, default: "Has ahorrado $200 al no fumar" },
        completed: { type: Boolean, default: false },
        progress: { type: Number, default: 0 },
        date: { type: String, default: null }
      }
    },
    weeklyData: [{
      weekStart: { type: Date, default: Date.now },
      dailyCigarettes: { type: [Number], default: [0, 0, 0, 0, 0, 0, 0] },
      weeklyGoal: { type: Number, default: 0 },
      totalSmoked: { type: Number, default: 0 }
    }]
  },
  { timestamps: true }
);

// Exportar el modelo
export default mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);