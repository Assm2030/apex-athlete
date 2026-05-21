import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Activity, Dumbbell, BarChart3, User } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/checkin", label: "Check-in", icon: Activity },
  { to: "/workout", label: "Rutina", icon: Dumbbell },
  { to: "/stats", label: "Stats", icon: BarChart3 },
  { to: "/profile", label: "Perfil", icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Hide on onboarding
  if (pathname === "/onboarding") return null;
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 pt-2">
      <div className="glass mx-auto flex max-w-md items-center justify-around rounded-full px-2 py-2 shadow-card">
        {items.map((it) => {
          const active = pathname === it.to;
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className="relative flex flex-col items-center gap-0.5 rounded-full px-3 py-2"
            >
              {active && (
                <motion.div
                  layoutId="navpill"
                  className="absolute inset-0 rounded-full bg-primary/15"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`relative h-5 w-5 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
                strokeWidth={active ? 2.4 : 2}
              />
              <span className={`relative text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                {it.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}