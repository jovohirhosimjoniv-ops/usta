import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type PanelHavola = { to: string; nom: string; icon: LucideIcon };

export function DashboardShell({
  sarlavha,
  matn,
  havolalar,
  children,
}: {
  sarlavha: string;
  matn: string;
  havolalar: PanelHavola[];
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold sm:text-3xl">{sarlavha}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{matn}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav className="flex gap-2 overflow-x-auto rounded-2xl border bg-card p-2 shadow-soft lg:h-fit lg:flex-col lg:overflow-visible">
          {havolalar.map((h) => (
            <Link
              key={h.to}
              to={h.to}
              className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              <h.icon className="size-4" />
              {h.nom}
            </Link>
          ))}
        </nav>
        <div className="min-w-0 space-y-6">{children}</div>
      </div>
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  qiymat,
  ozgarish,
}: {
  icon: LucideIcon;
  label: string;
  qiymat: string;
  ozgarish?: string;
}) {
  return (
    <div className="card-hover rounded-2xl border bg-card p-5 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
          <Icon className="size-5" />
        </span>
        {ozgarish && (
          <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-semibold text-success">
            {ozgarish}
          </span>
        )}
      </div>
      <p className="text-2xl font-extrabold">{qiymat}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
