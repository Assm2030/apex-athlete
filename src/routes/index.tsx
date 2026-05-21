import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { readLS } from "@/lib/storage";
import type { DailyCheckin, Profile, WorkoutLog } from "@/lib/types";
import { computeReadiness, quoteOfTheDay, readinessAlert, recommendWorkout } from "@/lib/recommendations";
import { ReadinessRing } from "@/components/ReadinessRing";
import { Activity, ChevronRight, Dumbbell, Flame, Heart, Moon, Sparkles, TrendingUp, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function Index() {
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkin, setCheckin] = useState<DailyCheckin | null>(null);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);

  useEffect(() => {
    setProfile(readLS<Profile | null>("peak:profile", null));
    const all = readLS<DailyCheckin[]>("peak:checkins", []);
    setCheckin(all.find((c) => c.date === todayISO()) ?? null);
    setLogs(readLS<WorkoutLog[]>("peak:logs", []));
    setMounted(true);
  }, []);

  if (mounted && (!profile || !profile.onboarded)) {
    return <Navigate to="/onboarding" />;
  }
  if (!mounted) return <div className="h-screen" />;

  const readiness = computeReadiness(checkin);
  const rec = recommendWorkout(checkin, profile);
  const alert = readinessAlert(readiness, checkin);
  const streak = computeStreak(logs);

  return (
    <div className="mx-auto max-w-md px-5 pt-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center justify-between"
      >
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Hola, <span className="text-gradient-primary">{profile?.name ?? "atleta"}</span>
          </h1>
        </div>
        <Link
          to="/profile"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold"
        >
          {profile?.name?.[0]?.toUpperCase() ?? "A"}
        </Link>
      </motion.div>

      {/* Readiness card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass mb-4 flex flex-col items-center rounded-3xl p-6 shadow-card"
      >
        <ReadinessRing score={readiness} size={200} />
        <p className="mt-4 text-center text-sm text-muted-foreground">{alert}</p>
        {!checkin && (
          <Link
            to="/checkin"
            className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground glow-primary"
          >
            Hacer check-in del día
          </Link>
        )}
      </motion.div>

      {/* Smart recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-4 overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-card to-accent/20 p-[1px] shadow-card"
      >
        <Link to="/workout" className="block rounded-3xl bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                Smart Coach
              </span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold">{rec.title}</h2>
          <p className="text-sm text-muted-foreground">{rec.subtitle}</p>
          <div className="mt-4 flex gap-2">
            <Pill icon={<Flame className="h-3 w-3" />} label={rec.intensity} />
            <Pill icon={<Activity className="h-3 w-3" />} label={`${rec.duration} min`} />
            <Pill icon={<Dumbbell className="h-3 w-3" />} label={`${rec.exercises.length} ej.`} />
          </div>
          {rec.reasons[0] && (
            <p className="mt-4 rounded-xl bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">¿Por qué?</span> {rec.reasons[0]}
            </p>
          )}
        </Link>
      </motion.div>

      {/* Stat row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-4 grid grid-cols-3 gap-3"
      >
        <StatCard icon={<Flame className="h-4 w-4" />} label="Racha" value={`${streak}d`} color="text-secondary" />
        <StatCard icon={<Moon className="h-4 w-4" />} label="Sueño" value={checkin ? `${checkin.sleepHours}h` : "—"} color="text-accent" />
        <StatCard icon={<Heart className="h-4 w-4" />} label="Energía" value={checkin ? `${checkin.energy}/10` : "—"} color="text-primary" />
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-4 grid grid-cols-2 gap-3"
      >
        <QuickCard to="/recovery" icon={<Heart className="h-5 w-5" />} title="Recovery" subtitle="Movilidad + estiramientos" />
        <QuickCard to="/library" icon={<Dumbbell className="h-5 w-5" />} title="Ejercicios" subtitle="Biblioteca completa" />
        <QuickCard to="/quick" icon={<Zap className="h-5 w-5" />} title="20 min" subtitle="Rutina rápida" />
        <QuickCard to="/stats" icon={<TrendingUp className="h-5 w-5" />} title="Performance" subtitle="Salto · Sprint · Peso" />
      </motion.div>

      {/* Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-4 rounded-3xl border border-border/50 bg-gradient-to-br from-secondary/10 to-transparent p-5 text-center"
      >
        <p className="text-xs uppercase tracking-widest text-secondary">Daily Mantra</p>
        <p className="mt-2 font-semibold italic">"{quoteOfTheDay()}"</p>
      </motion.div>
    </div>
  );
}

function computeStreak(logs: WorkoutLog[]): number {
  if (!logs.length) return 0;
  const set = new Set(logs.map((l) => l.date));
  let streak = 0;
  const d = new Date();
  while (set.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">
      {icon}
      {label}
    </span>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl bg-card p-3 shadow-card">
      <div className={`mb-1 ${color}`}>{icon}</div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function QuickCard({ to, icon, title, subtitle }: { to: string; icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <Link
      to={to}
      className="group rounded-2xl bg-card p-4 shadow-card transition hover:bg-muted"
    >
      <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
        {icon}
      </div>
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs text-muted-foreground">{subtitle}</div>
    </Link>
  );
}
