export type Goal =
  | "fuerza"
  | "explosividad"
  | "movilidad"
  | "recuperacion"
  | "velocidad"
  | "salto"
  | "definicion"
  | "perdida_grasa"
  | "flexibilidad";

export interface Profile {
  name: string;
  age: number;
  weight: number;
  height: number;
  position: string;
  experience: "principiante" | "intermedio" | "avanzado";
  frequency: number; // days/week
  injuries: string;
  trainingTime: string;
  matchDays: string[];
  goals: Goal[];
  onboarded: boolean;
}

export interface DailyCheckin {
  date: string; // YYYY-MM-DD
  energy: number; // 1-10
  soreness: number; // 1-10
  sleep: number; // 1-10
  stress: number; // 1-10
  sleepHours: number;
  footballToday: boolean;
  footballIntensity: number; // 0-10
  matchTomorrow: boolean;
  yesterdayTrained: string;
  sorePart: string;
  priority: Goal;
}

export interface WorkoutLog {
  date: string;
  type: string;
  duration: number;
  rpe: number;
  notes?: string;
}

export interface PerformanceLog {
  date: string;
  metric: "vertical_jump" | "sprint_10m" | "sprint_40m" | "weight" | "flexibility";
  value: number;
}

export const GOAL_LABELS: Record<Goal, string> = {
  fuerza: "Fuerza",
  explosividad: "Explosividad",
  movilidad: "Movilidad",
  recuperacion: "Recuperación",
  velocidad: "Velocidad",
  salto: "Salto vertical",
  definicion: "Definición",
  perdida_grasa: "Pérdida de grasa",
  flexibilidad: "Flexibilidad",
};