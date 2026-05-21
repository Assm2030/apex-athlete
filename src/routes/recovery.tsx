import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { Heart, Waves, Wind, Activity, Snowflake } from "lucide-react";

export const Route = createFileRoute("/recovery")({ component: Recovery });

const protocols = [
  { icon: Waves, title: "Foam Rolling", desc: "10 min cuerpo completo. 30s por zona.", color: "from-primary/30 to-transparent" },
  { icon: Activity, title: "Movilidad articular", desc: "Caderas, tobillos, columna torácica.", color: "from-secondary/30 to-transparent" },
  { icon: Heart, title: "Estiramiento estático", desc: "15 min post-entrenamiento. Posterior + aductores.", color: "from-accent/30 to-transparent" },
  { icon: Wind, title: "Respiración 4-7-8", desc: "Activa el sistema parasimpático. 5 ciclos.", color: "from-primary/30 to-transparent" },
  { icon: Snowflake, title: "Contraste agua fría", desc: "30s frío / 1 min tibia × 5. Reduce inflamación.", color: "from-accent/30 to-transparent" },
];

function Recovery() {
  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Recovery Center" subtitle="Recuperar = entrenar mejor mañana." showHome />
      <div className="space-y-3 px-5 pb-10">
        {protocols.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`flex items-start gap-4 rounded-2xl bg-gradient-to-br ${p.color} bg-card p-5 shadow-card`}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-card">
              <p.icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </div>
          </motion.div>
        ))}
        <div className="mt-4 rounded-2xl border border-dashed border-border p-5 text-center text-xs text-muted-foreground">
          Próximamente: protocolos guiados con timer y videos.
        </div>
      </div>
    </div>
  );
}