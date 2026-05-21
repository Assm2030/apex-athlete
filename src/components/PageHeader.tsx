import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Home } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showHome?: boolean;
  right?: React.ReactNode;
}

export function PageHeader({ title, subtitle, showBack = true, showHome = false, right }: Props) {
  const router = useRouter();
  return (
    <header className="flex items-center justify-between gap-3 px-5 pb-4 pt-6">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => router.history.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-foreground transition hover:bg-muted"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        {showHome && (
          <Link
            to="/"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-foreground transition hover:bg-muted"
            aria-label="Inicio"
          >
            <Home className="h-5 w-5" />
          </Link>
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {right}
    </header>
  );
}