import type { DailyCheckin, Profile, Goal } from "./types";

export interface Recommendation {
  title: string;
  subtitle: string;
  type: "recovery" | "mobility" | "strength" | "power" | "conditioning" | "upper" | "activation";
  intensity: "baja" | "moderada" | "alta";
  duration: number; // minutes
  color: "green" | "yellow" | "red";
  reasons: string[];
  exercises: Array<{ name: string; sets: string; muscle: string }>;
  cardio: string;
  rest: string;
  avoid: string[];
}

export function computeReadiness(c: DailyCheckin | null): number {
  if (!c) return 70;
  // Higher energy, sleep = good. Higher soreness, stress = bad.
  const energy = c.energy * 10;
  const sleep = c.sleep * 10;
  const sleepHrs = Math.min(c.sleepHours / 8, 1) * 100;
  const soreness = (10 - c.soreness) * 10;
  const stress = (10 - c.stress) * 10;
  const score = energy * 0.25 + sleep * 0.2 + sleepHrs * 0.15 + soreness * 0.2 + stress * 0.2;
  return Math.round(Math.max(0, Math.min(100, score)));
}

export function readinessColor(score: number): "green" | "yellow" | "red" {
  if (score >= 75) return "green";
  if (score >= 50) return "yellow";
  return "red";
}

const EXERCISES = {
  recovery: [
    { name: "Foam rolling cuerpo completo", sets: "10 min", muscle: "Todo el cuerpo" },
    { name: "Estiramiento estático profundo", sets: "15 min", muscle: "Posterior + aductores" },
    { name: "Respiración diafragmática", sets: "5 min", muscle: "Sistema nervioso" },
    { name: "Caminata ligera", sets: "20 min", muscle: "Circulación" },
  ],
  mobility: [
    { name: "World's Greatest Stretch", sets: "3x6/lado", muscle: "Cadera + torácica" },
    { name: "90/90 hip switches", sets: "3x8/lado", muscle: "Caderas" },
    { name: "Cat-cow + thoracic rotation", sets: "3x10", muscle: "Columna" },
    { name: "Ankle CARs", sets: "2x10/lado", muscle: "Tobillos" },
    { name: "Hip airplane", sets: "3x6/lado", muscle: "Glúteos + estabilidad" },
  ],
  strength: [
    { name: "Back squat", sets: "4x5", muscle: "Pierna completa" },
    { name: "Romanian deadlift", sets: "4x6", muscle: "Posterior + glúteos" },
    { name: "Bulgarian split squat", sets: "3x8/lado", muscle: "Glúteos + cuádriceps" },
    { name: "Hip thrust pesado", sets: "4x8", muscle: "Glúteos" },
    { name: "Core anti-rotación (Pallof)", sets: "3x10/lado", muscle: "Core" },
  ],
  power: [
    { name: "Box jumps", sets: "5x3", muscle: "Tren inferior — explosivo" },
    { name: "Broad jumps", sets: "4x4", muscle: "Cadena posterior" },
    { name: "Sprints 20m", sets: "6x20m", muscle: "Velocidad" },
    { name: "Med ball slams", sets: "4x6", muscle: "Core explosivo" },
    { name: "Depth jumps", sets: "3x4", muscle: "Reactividad" },
  ],
  conditioning: [
    { name: "Intervalos 4x4 min", sets: "4 rondas", muscle: "Capacidad aeróbica" },
    { name: "Sprints en cuesta", sets: "8x15s", muscle: "Potencia aeróbica" },
    { name: "Circuito metabólico", sets: "5 rondas", muscle: "Quema de grasa" },
  ],
  upper: [
    { name: "Press inclinado mancuernas", sets: "4x8", muscle: "Pecho + hombro" },
    { name: "Remo a una mano", sets: "4x10/lado", muscle: "Espalda" },
    { name: "Pull-ups asistidos", sets: "3xAMRAP", muscle: "Dorsal" },
    { name: "Face pulls", sets: "3x12", muscle: "Hombro posterior" },
    { name: "Core: dead bug", sets: "3x8/lado", muscle: "Core profundo" },
  ],
  activation: [
    { name: "Glute bridge", sets: "2x12", muscle: "Glúteos" },
    { name: "Band lateral walks", sets: "2x10/lado", muscle: "Glúteo medio" },
    { name: "A-skips", sets: "3x20m", muscle: "Patrón de carrera" },
    { name: "Pogo jumps", sets: "3x10", muscle: "Tobillo reactivo" },
  ],
};

export function recommendWorkout(
  checkin: DailyCheckin | null,
  profile: Profile | null,
): Recommendation {
  const readiness = computeReadiness(checkin);
  const color = readinessColor(readiness);
  const reasons: string[] = [];
  const avoid: string[] = [];
  const priority: Goal = checkin?.priority ?? "fuerza";

  // Recovery override
  if (readiness < 50 || (checkin && checkin.soreness >= 8) || (checkin && checkin.sleep <= 3)) {
    if (checkin && checkin.soreness >= 8) reasons.push("Dolor muscular alto: tu cuerpo necesita reparar tejido.");
    if (checkin && checkin.sleep <= 3) reasons.push("Calidad de sueño baja: el SNC no está listo para esfuerzo máximo.");
    if (readiness < 50) reasons.push(`Readiness ${readiness}/100 — modo recuperación activa.`);
    return {
      title: "Recovery Day",
      subtitle: "Recuperación activa + movilidad",
      type: "recovery",
      intensity: "baja",
      duration: 35,
      color,
      reasons,
      exercises: EXERCISES.recovery,
      cardio: "Caminata 20 min — Z1",
      rest: "Dormir 8h+ esta noche. Hidrátate con electrolitos.",
      avoid: ["Pierna pesada", "Pliometría", "Sprints máximos"],
    };
  }

  // Match tomorrow → de-load
  if (checkin?.matchTomorrow) {
    reasons.push("Tienes partido mañana — prioridad: llegar fresca y activa.");
    return {
      title: "Pre-Match Activation",
      subtitle: "Movilidad + activación neural ligera",
      type: "activation",
      intensity: "baja",
      duration: 30,
      color,
      reasons,
      exercises: [...EXERCISES.activation, ...EXERCISES.mobility.slice(0, 2)],
      cardio: "Trote suave 8 min + drills",
      rest: "Cena con carbohidratos limpios. Sueño 8h+.",
      avoid: ["Pierna pesada", "Volumen alto", "Pliometría intensa"],
    };
  }

  // Yesterday heavy legs + football today/tomorrow
  const trainedLegs = (checkin?.yesterdayTrained ?? "").toLowerCase().includes("pierna");
  if (trainedLegs && (checkin?.footballToday || checkin?.matchTomorrow)) {
    reasons.push("Ayer entrenaste pierna pesada y hoy/mañana toca fútbol intenso.");
    reasons.push("Hoy: tren superior + core + movilidad para no acumular fatiga en piernas.");
    return {
      title: "Upper Body + Core",
      subtitle: "Cuida las piernas para el campo",
      type: "upper",
      intensity: "moderada",
      duration: 45,
      color,
      reasons,
      exercises: EXERCISES.upper,
      cardio: "Skipping o jump rope técnico 5 min",
      rest: "90s entre series pesadas. Hidrátate.",
      avoid: ["Sentadilla pesada", "Pliometría", "Sprints"],
    };
  }

  // High readiness + explosive/speed/jump priority
  if (readiness >= 75 && ["explosividad", "velocidad", "salto"].includes(priority)) {
    reasons.push(`Readiness ${readiness}/100 — tu sistema nervioso está listo para potencia.`);
    reasons.push(`Priorizas ${priority}: el momento perfecto para trabajo reactivo.`);
    return {
      title: "Power & Speed Day",
      subtitle: "Pliometría + sprints + fuerza explosiva",
      type: "power",
      intensity: "alta",
      duration: 55,
      color,
      reasons,
      exercises: EXERCISES.power,
      cardio: "Activación dinámica 10 min antes",
      rest: "Descansos largos (2-3 min) — calidad sobre cantidad.",
      avoid: ["Cardio largo después", "Sobrecargar volumen"],
    };
  }

  // Fat loss / definition with good readiness
  if (["perdida_grasa", "definicion"].includes(priority) && readiness >= 60) {
    reasons.push(`Priorizas ${priority === "perdida_grasa" ? "pérdida de grasa" : "definición"}.`);
    reasons.push("Conditioning inteligente: mantiene rendimiento sin canibalizar músculo.");
    return {
      title: "Smart Conditioning",
      subtitle: "Fuerza + intervalos metabólicos",
      type: "conditioning",
      intensity: "moderada",
      duration: 50,
      color,
      reasons,
      exercises: [...EXERCISES.strength.slice(0, 3), ...EXERCISES.conditioning.slice(0, 1)],
      cardio: "Intervalos 4x4 min al 85% FCmax",
      rest: "60-90s en fuerza, 1:1 en intervalos.",
      avoid: ["Cardio en ayunas largo", "Restricción calórica agresiva"],
    };
  }

  // Mobility / flexibility priority
  if (["movilidad", "flexibilidad"].includes(priority)) {
    reasons.push(`Priorizas ${priority} — clave para prevención de lesiones y rendimiento.`);
    return {
      title: "Mobility Flow",
      subtitle: "Movilidad articular + flexibilidad activa",
      type: "mobility",
      intensity: "baja",
      duration: 35,
      color,
      reasons,
      exercises: EXERCISES.mobility,
      cardio: "Trote suave 5 min para calentar",
      rest: "Respira profundo en cada estiramiento.",
      avoid: ["Estiramientos forzados en frío"],
    };
  }

  // Default: strength
  reasons.push(`Readiness ${readiness}/100 — sólido para trabajo de fuerza.`);
  reasons.push("Fuerza atlética = base de explosividad, velocidad y prevención de lesiones.");
  if (checkin?.sorePart) avoid.push(`Cargas directas sobre ${checkin.sorePart}`);
  return {
    title: "Athletic Strength",
    subtitle: "Fuerza compuesta + core",
    type: "strength",
    intensity: "moderada",
    duration: 55,
    color,
    reasons,
    exercises: EXERCISES.strength,
    cardio: "Activación 10 min antes",
    rest: "2 min entre series principales.",
    avoid,
  };
}

export function readinessAlert(score: number, checkin: DailyCheckin | null): string {
  if (!checkin) return "Haz tu check-in diario para activar tu coach.";
  if (score < 45) return "⚠️ Riesgo de sobreentrenamiento — prioriza recuperación.";
  if (score < 65) return "🟡 Recuperación parcial — entrena con cabeza.";
  if (score >= 80) return "🟢 Día perfecto para potencia y rendimiento máximo.";
  return "✅ Lista para entrenar — escucha tu cuerpo.";
}

export const MOTIVATIONAL_QUOTES = [
  "El descanso también es entrenamiento.",
  "Las élites se construyen en lo invisible.",
  "Más rápida. Más fuerte. Más explosiva.",
  "Tu cuerpo escucha — entrénalo con inteligencia.",
  "Cada sesión te acerca al campo donde nadie te alcanza.",
  "La constancia vence al talento.",
  "Recuperar es ganar el siguiente entrenamiento.",
  "Atleta primero. Todo lo demás se construye sobre eso.",
];

export function quoteOfTheDay(): string {
  const day = new Date().getDate();
  return MOTIVATIONAL_QUOTES[day % MOTIVATIONAL_QUOTES.length];
}