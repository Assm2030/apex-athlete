import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { readLS, writeLS } from "@/lib/storage";
import type { DailyCheckin, Profile, WorkoutLog } from "@/lib/types";
import { recommendWorkout, computeReadiness } from "@/lib/recommendations";
import { AlertTriangle, Check, Clock, Flame, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/workout")({ component: Workout });

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function Workout() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [checkin, setCheckin] = useState<DailyCheckin | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setProfile(readLS<Profile | null>("peak:profile", null));
    const all = readLS<DailyCheckin[]>("peak:checkins", []);
    setCheckin(all.find((c) => c.date === todayISO()) ?? null);
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-screen" />;
  const rec = recommendWorkout(checkin, profile);
  const readiness = computeReadiness(checkin);
  const completion = Object.values(done).filter(Boolean).length / Math.max(1, rec.exercises.length);

  const completeWorkout = () => {
    const log: WorkoutLog = {
      date: todayISO(),
      type: rec.title,
      duration: rec.duration,
      rpe: rec.intensity === "alta" ? 8 : rec.intensity === "moderada" ? 6 : 4,
    };
    const logs = readLS<WorkoutLog[]>("peak:logs", []).filter((l) => l.date !== log.date);
    writeLS("peak:logs", [...logs, log]);
    toast.success("Sesión completada 🔥");
    navigate({ to: "/" });
  };

  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Rutina del día" showHome />
      <div className="px-5 pb-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-card to-accent/20 p-6 shadow-card"
        >
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Recomendado para ti
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">{rec.title}</h2>
          <p className="text-sm text-muted-foreground">{rec.subtitle}</p>
          <div className="mt-4 flex gap-2">
            <Tag icon={<Flame className="h-3 w-3" />}>{rec.intensity}</Tag>
            <Tag icon={<Clock className="h-3 w-3" />}>{rec.duration} min</Tag>
            <Tag icon={<Zap className="h-3 w-3" />}>RPE {rec.intensity === "alta" ? 8 : rec.intensity === "moderada" ? 6 : 4}</Tag>
          </div>
        </motion.div>

        {/* Why */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 rounded-3xl bg-card p-5 shadow-card"
        >
          <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">¿Por qué?</h3>
          <ul className="space-y-2">
            {rec.reasons.map((r) => (
              <li key={r} className="flex gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {r}
              </li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-muted/40 p-3">
              <div className="font-semibold text-foreground">Cardio</div>
              <div className="text-muted-foreground">{rec.cardio}</div>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <div className="font-semibold text-foreground">Descanso</div>
              <div className="text-muted-foreground">{rec.rest}</div>
            </div>
          </div>
          {rec.avoid.length > 0 && (
            <div className="mt-3 flex gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
              <div>
                <div className="font-semibold">Evita hoy:</div>
                <div className="text-muted-foreground">{rec.avoid.join(" · ")}</div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Exercises */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold">Ejercicios</h3>
            <span className="text-xs text-muted-foreground">{Math.round(completion * 100)}% completado</span>
          </div>
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-secondary"
              animate={{ width: `${completion * 100}%` }}
              transition={{ type: "spring", damping: 20 }}
            />
          </div>
          <div className="space-y-2">
            {rec.exercises.map((ex, i) => {
              const checked = !!done[ex.name];
              return (
                <motion.button
                  key={ex.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setDone({ ...done, [ex.name]: !checked })}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                    checked
                      ? "border-primary/40 bg-primary/10"
                      : "border-border bg-card hover:bg-muted"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      checked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {checked ? <Check className="h-4 w-4" /> : i + 1}
                  </span>
                  <div className="flex-1">
                    <div className={`font-semibold ${checked ? "line-through opacity-60" : ""}`}>{ex.name}</div>
                    <div className="text-xs text-muted-foreground">{ex.muscle}</div>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{ex.sets}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={completeWorkout}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-semibold text-primary-foreground glow-primary"
        >
          <Check className="h-5 w-5" /> Marcar sesión como completada
        </motion.button>

        {!checkin && (
          <Link to="/checkin" className="mt-3 block text-center text-sm text-primary">
            Aún no has hecho tu check-in de hoy →
          </Link>
        )}
      </div>
    </div>
  );
}

function Tag({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-card/60 px-3 py-1 text-xs font-medium capitalize backdrop-blur">
      {icon}
      {children}
    </span>
  );
}