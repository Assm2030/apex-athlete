import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { writeLS } from "@/lib/storage";
import type { Goal, Profile } from "@/lib/types";
import { GOAL_LABELS } from "@/lib/types";
import { ArrowRight, Check, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

const POSITIONS = ["Portera", "Defensa", "Mediocampo", "Delantera", "Lateral"];

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Profile>({
    name: "",
    age: 22,
    weight: 60,
    height: 165,
    position: "Mediocampo",
    experience: "intermedio",
    frequency: 4,
    injuries: "",
    trainingTime: "Tarde",
    matchDays: ["Sábado"],
    goals: ["explosividad", "velocidad", "definicion"],
    onboarded: false,
  });

  const steps = [
    {
      title: "Bienvenida atleta",
      subtitle: "Vamos a personalizar tu coach inteligente.",
      content: (
        <Field label="¿Cómo te llamas?">
          <input
            autoFocus
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            placeholder="Tu nombre"
            className="input"
          />
        </Field>
      ),
    },
    {
      title: "Tus datos",
      subtitle: "Para calibrar carga, recuperación y métricas.",
      content: (
        <div className="space-y-4">
          <Field label="Edad">
            <input type="number" value={data.age} onChange={(e) => setData({ ...data, age: +e.target.value })} className="input" />
          </Field>
          <Field label="Peso (kg)">
            <input type="number" value={data.weight} onChange={(e) => setData({ ...data, weight: +e.target.value })} className="input" />
          </Field>
          <Field label="Altura (cm)">
            <input type="number" value={data.height} onChange={(e) => setData({ ...data, height: +e.target.value })} className="input" />
          </Field>
        </div>
      ),
    },
    {
      title: "En el campo",
      subtitle: "Tu posición define la prescripción atlética.",
      content: (
        <div className="space-y-4">
          <Field label="Posición">
            <div className="grid grid-cols-2 gap-2">
              {POSITIONS.map((p) => (
                <Chip key={p} active={data.position === p} onClick={() => setData({ ...data, position: p })}>{p}</Chip>
              ))}
            </div>
          </Field>
          <Field label="Experiencia entrenando">
            <div className="grid grid-cols-3 gap-2">
              {(["principiante", "intermedio", "avanzado"] as const).map((e) => (
                <Chip key={e} active={data.experience === e} onClick={() => setData({ ...data, experience: e })}>
                  {e}
                </Chip>
              ))}
            </div>
          </Field>
          <Field label="Días de partido habituales">
            <div className="grid grid-cols-4 gap-2">
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => {
                const active = data.matchDays.includes(d);
                return (
                  <Chip
                    key={d}
                    active={active}
                    onClick={() =>
                      setData({
                        ...data,
                        matchDays: active ? data.matchDays.filter((x) => x !== d) : [...data.matchDays, d],
                      })
                    }
                  >
                    {d}
                  </Chip>
                );
              })}
            </div>
          </Field>
        </div>
      ),
    },
    {
      title: "Tu rutina",
      subtitle: "¿Cuánto puedes entrenar fuera del fútbol?",
      content: (
        <div className="space-y-4">
          <Field label={`Frecuencia: ${data.frequency} días/semana`}>
            <input type="range" min={1} max={7} value={data.frequency} onChange={(e) => setData({ ...data, frequency: +e.target.value })} className="w-full accent-[var(--color-primary)]" />
          </Field>
          <Field label="Horario preferido">
            <div className="grid grid-cols-3 gap-2">
              {["Mañana", "Tarde", "Noche"].map((h) => (
                <Chip key={h} active={data.trainingTime === h} onClick={() => setData({ ...data, trainingTime: h })}>{h}</Chip>
              ))}
            </div>
          </Field>
          <Field label="Lesiones previas (opcional)">
            <textarea
              value={data.injuries}
              onChange={(e) => setData({ ...data, injuries: e.target.value })}
              placeholder="Ej: tirón en aductor izquierdo hace 3 meses"
              className="input min-h-20"
            />
          </Field>
        </div>
      ),
    },
    {
      title: "Tus objetivos",
      subtitle: "Selecciona los que más te importan (mínimo 2).",
      content: (
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => {
            const active = data.goals.includes(g);
            return (
              <Chip
                key={g}
                active={active}
                onClick={() =>
                  setData({
                    ...data,
                    goals: active ? data.goals.filter((x) => x !== g) : [...data.goals, g],
                  })
                }
              >
                {GOAL_LABELS[g]}
              </Chip>
            );
          })}
        </div>
      ),
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const canContinue =
    (step === 0 && data.name.trim().length > 0) ||
    (step > 0 && step < 4) ||
    (step === 4 && data.goals.length >= 2);

  const finish = () => {
    writeLS<Profile>("peak:profile", { ...data, onboarded: true });
    toast.success("¡Listo, atleta! Tu coach está activo.");
    navigate({ to: "/" });
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 pt-10">
      <div className="mb-6 flex items-center justify-between">
        {step > 0 ? (
          <button onClick={() => setStep(step - 1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-card">
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : (
          <div className="text-2xl font-bold text-gradient-primary">PEAK</div>
        )}
        <div className="text-xs text-muted-foreground">Paso {step + 1} / {steps.length}</div>
      </div>

      <div className="mb-6 h-1 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-secondary"
          initial={false}
          animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
          transition={{ type: "spring", damping: 20 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="flex-1"
        >
          <h1 className="mb-1 text-3xl font-bold tracking-tight">{current.title}</h1>
          <p className="mb-6 text-sm text-muted-foreground">{current.subtitle}</p>
          {current.content}
        </motion.div>
      </AnimatePresence>

      <div className="sticky bottom-6 mt-8 pb-4">
        <button
          disabled={!canContinue}
          onClick={() => (isLast ? finish() : setStep(step + 1))}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 font-semibold text-primary-foreground shadow-card transition disabled:opacity-40 enabled:glow-primary"
        >
          {isLast ? <>Empezar <Check className="h-5 w-5" /></> : <>Continuar <ArrowRight className="h-5 w-5" /></>}
        </button>
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

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-2.5 text-sm font-medium capitalize transition ${
        active
          ? "border-primary bg-primary/15 text-primary"
          : "border-border bg-card text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}