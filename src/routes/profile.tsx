import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { readLS, writeLS } from "@/lib/storage";
import type { Goal, Profile } from "@/lib/types";
import { GOAL_LABELS } from "@/lib/types";
import { toast } from "sonner";
import { LogOut, Save } from "lucide-react";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

function ProfilePage() {
  const navigate = useNavigate();
  const [data, setData] = useState<Profile | null>(null);

  useEffect(() => {
    setData(readLS<Profile | null>("peak:profile", null));
  }, []);

  if (!data) return <div className="p-6">Cargando...</div>;

  const save = () => {
    writeLS("peak:profile", data);
    toast.success("Perfil actualizado ✓");
  };

  const reset = () => {
    if (!confirm("¿Reiniciar tus datos? Esto borra check-ins, logs y perfil.")) return;
    localStorage.removeItem("peak:profile");
    localStorage.removeItem("peak:checkins");
    localStorage.removeItem("peak:logs");
    localStorage.removeItem("peak:perf");
    navigate({ to: "/onboarding" });
  };

  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Perfil" showHome showBack={false} />
      <div className="space-y-5 px-5 pb-10">
        <div className="flex items-center gap-4 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 p-5 shadow-card">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-2xl font-bold text-primary-foreground">
            {data.name[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">{data.name}</h2>
            <p className="text-sm text-muted-foreground">{data.position} · {data.experience}</p>
          </div>
        </div>

        <Field label="Nombre">
          <input className="input" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Edad"><input type="number" className="input" value={data.age} onChange={(e) => setData({ ...data, age: +e.target.value })} /></Field>
          <Field label="Peso"><input type="number" className="input" value={data.weight} onChange={(e) => setData({ ...data, weight: +e.target.value })} /></Field>
          <Field label="Altura"><input type="number" className="input" value={data.height} onChange={(e) => setData({ ...data, height: +e.target.value })} /></Field>
        </div>
        <Field label={`Frecuencia: ${data.frequency}/sem`}>
          <input type="range" min={1} max={7} value={data.frequency} onChange={(e) => setData({ ...data, frequency: +e.target.value })} className="w-full accent-[var(--color-primary)]" />
        </Field>

        <Field label="Objetivos">
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => {
              const active = data.goals.includes(g);
              return (
                <button
                  key={g}
                  onClick={() =>
                    setData({
                      ...data,
                      goals: active ? data.goals.filter((x) => x !== g) : [...data.goals, g],
                    })
                  }
                  className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                    active ? "border-primary bg-primary/15 text-primary" : "border-border bg-card"
                  }`}
                >
                  {GOAL_LABELS[g]}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Lesiones / notas">
          <textarea className="input min-h-20" value={data.injuries} onChange={(e) => setData({ ...data, injuries: e.target.value })} />
        </Field>

        <button onClick={save} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 font-semibold text-primary-foreground glow-primary">
          <Save className="h-4 w-4" /> Guardar cambios
        </button>
        <button onClick={reset} className="flex w-full items-center justify-center gap-2 rounded-full border border-destructive/40 py-3 text-sm font-semibold text-destructive">
          <LogOut className="h-4 w-4" /> Reiniciar datos
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