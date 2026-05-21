import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { readLS, writeLS } from "@/lib/storage";
import type { DailyCheckin, Goal } from "@/lib/types";
import { GOAL_LABELS } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkin")({ component: Checkin });

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function Checkin() {
  const navigate = useNavigate();
  const [data, setData] = useState<DailyCheckin>({
    date: todayISO(),
    energy: 7,
    soreness: 3,
    sleep: 7,
    sleepHours: 7,
    stress: 4,
    footballToday: false,
    footballIntensity: 0,
    matchTomorrow: false,
    yesterdayTrained: "",
    sorePart: "",
    priority: "fuerza",
  });

  useEffect(() => {
    const all = readLS<DailyCheckin[]>("peak:checkins", []);
    const existing = all.find((c) => c.date === todayISO());
    if (existing) setData(existing);
  }, []);

  const save = () => {
    const all = readLS<DailyCheckin[]>("peak:checkins", []).filter((c) => c.date !== data.date);
    writeLS("peak:checkins", [...all, data]);
    toast.success("Check-in guardado ✓");
    navigate({ to: "/workout" });
  };

  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Check-in del día" subtitle="2 minutos. Tu coach adapta todo." />
      <div className="space-y-5 px-5 pb-10">
        <SliderField label="Nivel de energía" value={data.energy} onChange={(v) => setData({ ...data, energy: v })} hint="1 = agotada · 10 = en pico" />
        <SliderField label="Dolor muscular" value={data.soreness} onChange={(v) => setData({ ...data, soreness: v })} hint="1 = ninguno · 10 = mucho" invert />
        <SliderField label="Calidad de sueño" value={data.sleep} onChange={(v) => setData({ ...data, sleep: v })} hint="1 = pésimo · 10 = perfecto" />
        <Field label={`Horas dormidas: ${data.sleepHours}h`}>
          <input type="range" min={3} max={12} step={0.5} value={data.sleepHours} onChange={(e) => setData({ ...data, sleepHours: +e.target.value })} className="w-full accent-[var(--color-primary)]" />
        </Field>
        <SliderField label="Estrés" value={data.stress} onChange={(v) => setData({ ...data, stress: v })} hint="1 = calma · 10 = muy alto" invert />

        <Card>
          <Toggle label="Tengo entrenamiento de fútbol HOY" value={data.footballToday} onChange={(v) => setData({ ...data, footballToday: v })} />
          {data.footballToday && (
            <div className="mt-3">
              <SliderField label="Intensidad del fútbol" value={data.footballIntensity} onChange={(v) => setData({ ...data, footballIntensity: v })} hint="0 = recovery · 10 = doble sesión intensa" />
            </div>
          )}
          <div className="mt-3 border-t border-border pt-3">
            <Toggle label="Tengo partido mañana" value={data.matchTomorrow} onChange={(v) => setData({ ...data, matchTomorrow: v })} />
          </div>
        </Card>

        <Field label="¿Qué entrenaste ayer?">
          <input className="input" placeholder="Ej: pierna pesada, fútbol intenso..." value={data.yesterdayTrained} onChange={(e) => setData({ ...data, yesterdayTrained: e.target.value })} />
        </Field>

        <Field label="¿Alguna zona cansada o dolorida?">
          <input className="input" placeholder="Ej: aductores, cuádriceps, espalda baja..." value={data.sorePart} onChange={(e) => setData({ ...data, sorePart: e.target.value })} />
        </Field>

        <Field label="¿Qué quieres priorizar hoy?">
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => (
              <button
                key={g}
                onClick={() => setData({ ...data, priority: g })}
                className={`rounded-xl border px-2 py-2 text-xs font-medium transition ${
                  data.priority === g
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-card text-foreground"
                }`}
              >
                {GOAL_LABELS[g]}
              </button>
            ))}
          </div>
        </Field>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={save}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-semibold text-primary-foreground glow-primary"
        >
          <Check className="h-5 w-5" /> Guardar y ver mi rutina
        </motion.button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl bg-card p-4 shadow-card">{children}</div>;
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="flex w-full items-center justify-between gap-3">
      <span className="text-sm font-medium">{label}</span>
      <span className={`relative h-6 w-11 rounded-full transition ${value ? "bg-primary" : "bg-muted"}`}>
        <motion.span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-card shadow"
          animate={{ x: value ? 22 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </span>
    </button>
  );
}

function SliderField({
  label,
  value,
  onChange,
  hint,
  invert,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint: string;
  invert?: boolean;
}) {
  const v = invert ? 10 - value : value;
  const color = v >= 7 ? "var(--ready-green)" : v >= 4 ? "var(--ready-yellow)" : "var(--ready-red)";
  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-2xl font-bold" style={{ color }}>{value}</span>
      </div>
      <p className="mb-3 text-[11px] text-muted-foreground">{hint}</p>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full"
        style={{ accentColor: color }}
      />
    </div>
  );
}