import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { Search } from "lucide-react";

export const Route = createFileRoute("/library")({ component: Library });

const EXERCISES = [
  { name: "Back squat", muscle: "Pierna", cat: "Fuerza", tips: "Pies anchura de hombros, peso en talón, profundidad por debajo paralelo." },
  { name: "Romanian deadlift", muscle: "Posterior", cat: "Fuerza", tips: "Bisagra de cadera, espalda neutra, baja con control hasta media tibia." },
  { name: "Bulgarian split squat", muscle: "Pierna", cat: "Fuerza", tips: "Pie atrás elevado, torso ligeramente inclinado, baja vertical." },
  { name: "Hip thrust", muscle: "Glúteos", cat: "Fuerza", tips: "Pies plantados, mentón al pecho, extensión completa arriba." },
  { name: "Box jump", muscle: "Tren inferior", cat: "Pliometría", tips: "Aterriza suave en cuarto de sentadilla. Baja caminando." },
  { name: "Broad jump", muscle: "Cadena posterior", cat: "Pliometría", tips: "Brazos atrás → adelante. Aterriza absorbiendo con caderas." },
  { name: "Depth jump", muscle: "Reactividad", cat: "Pliometría", tips: "Caja 30-40cm. Mínimo tiempo de contacto con suelo." },
  { name: "Sprint 20m", muscle: "Velocidad", cat: "Velocidad", tips: "Postura inclinada, brazos a 90°. Recuperación completa entre series." },
  { name: "A-skip", muscle: "Patrón carrera", cat: "Velocidad", tips: "Rodilla alta, tobillo dorsiflexionado, ciclo activo." },
  { name: "Pallof press", muscle: "Core", cat: "Core", tips: "Anti-rotación. Empuja brazos al frente sin girar el torso." },
  { name: "Dead bug", muscle: "Core profundo", cat: "Core", tips: "Lumbar pegada al suelo. Brazo y pierna contrarios lentos." },
  { name: "World's greatest stretch", muscle: "Movilidad global", cat: "Movilidad", tips: "Zancada profunda, codo al suelo, rotación torácica." },
  { name: "90/90 hip switch", muscle: "Caderas", cat: "Movilidad", tips: "Mantén torso erguido. Alterna sin usar manos." },
  { name: "Face pull", muscle: "Hombro posterior", cat: "Hombro", tips: "Codos altos, jala hacia la cara. Pausa 1s en contracción." },
  { name: "Pull-up", muscle: "Dorsal", cat: "Tren superior", tips: "Pecho a la barra, escápulas retraídas." },
];

const CATS = ["Todos", "Fuerza", "Pliometría", "Velocidad", "Core", "Movilidad", "Tren superior", "Hombro"];

function Library() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todos");

  const filtered = EXERCISES.filter(
    (e) =>
      (cat === "Todos" || e.cat === cat) &&
      (q === "" || e.name.toLowerCase().includes(q.toLowerCase()) || e.muscle.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Biblioteca" subtitle="Ejercicios + ejecución técnica." showHome />
      <div className="px-5 pb-10">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar ejercicio o músculo..." className="input pl-11" />
        </div>
        <div className="mb-4 -mx-5 flex gap-2 overflow-x-auto px-5 pb-2">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                cat === c ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {filtered.map((e, i) => (
            <motion.details
              key={e.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="group rounded-2xl bg-card p-4 shadow-card"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 list-none">
                <div>
                  <div className="font-semibold">{e.name}</div>
                  <div className="text-xs text-muted-foreground">{e.muscle} · {e.cat}</div>
                </div>
                <span className="text-xs text-primary group-open:rotate-90 transition">▶</span>
              </summary>
              <p className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground">{e.tips}</p>
            </motion.details>
          ))}
          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">Sin resultados.</p>
          )}
        </div>
      </div>
    </div>
  );
}