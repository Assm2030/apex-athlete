import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { readLS, writeLS } from "@/lib/storage";
import type { DailyCheckin, PerformanceLog, WorkoutLog } from "@/lib/types";
import { computeReadiness } from "@/lib/recommendations";
import {
  LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, Area, AreaChart,
} from "recharts";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/stats")({ component: Stats });

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function Stats() {
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [perf, setPerf] = useState<PerformanceLog[]>([]);
  const [tab, setTab] = useState<"recovery" | "performance">("recovery");

  useEffect(() => {
    setCheckins(readLS<DailyCheckin[]>("peak:checkins", []));
    setLogs(readLS<WorkoutLog[]>("peak:logs", []));
    setPerf(readLS<PerformanceLog[]>("peak:perf", []));
  }, []);

  const readinessData = checkins
    .slice(-14)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((c) => ({ date: c.date.slice(5), score: computeReadiness(c), energy: c.energy * 10, sueño: c.sleep * 10 }));

  const addPerf = (metric: PerformanceLog["metric"]) => {
    const val = prompt(`Valor (${metric}):`);
    if (!val) return;
    const entry: PerformanceLog = { date: todayISO(), metric, value: +val };
    const next = [...perf, entry];
    setPerf(next);
    writeLS("peak:perf", next);
    toast.success("Registro guardado ✓");
  };

  const seriesFor = (metric: PerformanceLog["metric"]) =>
    perf
      .filter((p) => p.metric === metric)
      .slice(-10)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((p) => ({ date: p.date.slice(5), v: p.value }));

  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Performance" subtitle="Tu progreso, en gráficos." showHome />
      <div className="px-5 pb-10">
        <div className="mb-5 grid grid-cols-2 rounded-full bg-card p-1">
          {(["recovery", "performance"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full py-2 text-sm font-semibold capitalize transition ${
                tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {t === "recovery" ? "Recuperación" : "Rendimiento"}
            </button>
          ))}
        </div>

        {tab === "recovery" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <Card title="Readiness — últimos 14 días">
              <div className="h-44">
                <ResponsiveContainer>
                  <AreaChart data={readinessData}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={10} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={10} domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                    <Area dataKey="score" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#g1)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card title="Energía vs Sueño">
              <div className="h-40">
                <ResponsiveContainer>
                  <LineChart data={readinessData}>
                    <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={10} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={10} />
                    <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                    <Line dataKey="energy" stroke="var(--color-secondary)" strokeWidth={2} dot={false} name="Energía" />
                    <Line dataKey="sueño" stroke="var(--color-accent)" strokeWidth={2} dot={false} name="Sueño" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card title="Sesiones completadas">
              <div className="text-4xl font-bold text-gradient-primary">{logs.length}</div>
              <p className="text-sm text-muted-foreground">Sigue acumulando — la consistencia gana.</p>
            </Card>
          </motion.div>
        )}

        {tab === "performance" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <PerfCard title="Salto vertical (cm)" data={seriesFor("vertical_jump")} onAdd={() => addPerf("vertical_jump")} color="var(--color-primary)" />
            <PerfCard title="Sprint 40m (s)" data={seriesFor("sprint_40m")} onAdd={() => addPerf("sprint_40m")} color="var(--color-secondary)" />
            <PerfCard title="Sprint 10m (s)" data={seriesFor("sprint_10m")} onAdd={() => addPerf("sprint_10m")} color="var(--color-accent)" />
            <PerfCard title="Peso (kg)" data={seriesFor("weight")} onAdd={() => addPerf("weight")} color="var(--color-chart-4)" />
            <PerfCard title="Flexibilidad (cm)" data={seriesFor("flexibility")} onAdd={() => addPerf("flexibility")} color="var(--color-chart-5)" />

            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-4 text-center text-xs text-muted-foreground">
              Próximamente: sync con Apple Watch, Garmin, WHOOP — HRV, FC, calorías, recovery automático.
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

function PerfCard({ title, data, onAdd, color }: { title: string; data: { date: string; v: number }[]; onAdd: () => void; color: string }) {
  const last = data[data.length - 1]?.v;
  const first = data[0]?.v;
  const diff = last && first ? last - first : 0;
  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button onClick={onAdd} className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="mb-1 flex items-baseline gap-2">
        <span className="text-3xl font-bold">{last ?? "—"}</span>
        {data.length > 1 && (
          <span className={`text-xs font-semibold ${diff >= 0 ? "text-primary" : "text-secondary"}`}>
            {diff >= 0 ? "+" : ""}{diff.toFixed(1)}
          </span>
        )}
      </div>
      {data.length > 1 ? (
        <div className="h-16">
          <ResponsiveContainer>
            <LineChart data={data}>
              <Line dataKey="v" stroke={color} strokeWidth={2.5} dot={{ r: 3, fill: color }} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Sin datos aún. Toca + para registrar.</p>
      )}
    </div>
  );
}