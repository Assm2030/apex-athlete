import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { Zap, Heart, Activity, Dumbbell } from "lucide-react";

export const Route = createFileRoute("/quick")({ component: Quick });

const ROUTINES = [
  {
    id: "20min",
    icon: Zap,
    title: "Express 20 min",
    desc: "Circuito atlético full-body. Sin equipo.",
    duration: 20,
    exercises: ["Goblet squat 4x10", "Push-up 4x8", "Reverse lunge 3x8/lado", "Plank 3x40s", "Burpees 3x10"],
  },
  {
    id: "recovery",
    icon: Heart,
    title: "Recovery 15 min",
    desc: "Movilidad + respiración. Día post-partido.",
    duration: 15,
    exercises: ["Cat-cow 2x10", "90/90 hip 2x6/lado", "Pigeon 60s/lado", "Child pose 90s", "Respiración 4-7-8 × 5"],
  },
  {
    id: "mobility",
    icon: Activity,
    title: "Movilidad rápida 10 min",
    desc: "Despertar el cuerpo en la mañana.",
    duration: 10,
    exercises: ["World's stretch 2x4/lado", "Ankle CARs 2x10", "Thoracic rotation 2x8", "Hip airplane 2x6/lado"],
  },
  {
    id: "preMatch",
    icon: Dumbbell,
    title: "Activación pre-fútbol",
    desc: "Lista para el campo en 12 min.",
    duration: 12,
    exercises: ["Glute bridge 2x12", "Band walks 2x10/lado", "A-skips 3x20m", "Pogo jumps 3x10", "Sprints 4x20m progresivos"],
  },
];

function Quick() {
  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Quick Workout" subtitle="Cuando el tiempo aprieta." showHome />
      <div className="space-y-3 px-5 pb-10">
        {ROUTINES.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-3xl bg-card p-5 shadow-card"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <r.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{r.title}</h3>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{r.duration}'</span>
            </div>
            <ol className="space-y-1.5 border-t border-border pt-3 text-sm">
              {r.exercises.map((ex, idx) => (
                <li key={ex} className="flex gap-2 text-muted-foreground">
                  <span className="font-semibold text-primary">{idx + 1}.</span> {ex}
                </li>
              ))}
            </ol>
          </motion.div>
        ))}
        <Link to="/library" className="block rounded-2xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          Ver biblioteca completa →
        </Link>
      </div>
    </div>
  );
}