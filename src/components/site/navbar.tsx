import { Link } from "@tanstack/react-router";
import { Hammer, Menu } from "lucide-react";
import { useState } from "react";

import { ThemeToggle } from "@/components/site/theme-toggle";
import { Button } from "@/components/ui/button";

const HAVOLALAR = [
  { to: "/ustalar", nom: "Ustalar" },
  { to: "/kategoriyalar", nom: "Kategoriyalar" },
  { to: "/kabinet", nom: "Buyurtmalar" },
  { to: "/xabarlar", nom: "Xabarlar" },
] as const;

export function Navbar() {
  const [ochiq, setOchiq] = useState(false);

  return (
    <header className="glass sticky top-0 z-50 border-b border-border/60">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 lg:px-8">
        <div className="flex min-w-0 items-center gap-8">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <span className="gradient-hero grid size-9 shrink-0 place-items-center rounded-xl text-primary-foreground">
              <Hammer className="size-5" />
            </span>
            <span className="truncate font-display text-lg font-extrabold">
              Usta<span className="text-primary">Top</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {HAVOLALAR.map((h) => (
              <Link
                key={h.to}
                to={h.to}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
              >
                {h.nom}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" className="hidden rounded-full sm:inline-flex">
            <Link to="/kirish">Kirish</Link>
          </Button>
          <Button asChild className="hidden rounded-full sm:inline-flex">
            <Link to="/royxatdan-otish">Ro'yxatdan o'tish</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Menyu"
            onClick={() => setOchiq((v) => !v)}
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>

      {ochiq && (
        <div className="animate-rise border-t bg-card px-4 py-3 lg:hidden">
          <nav className="flex flex-col">
            {HAVOLALAR.map((h) => (
              <Link
                key={h.to}
                to={h.to}
                onClick={() => setOchiq(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-secondary"
              >
                {h.nom}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/kirish" onClick={() => setOchiq(false)}>Kirish</Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link to="/royxatdan-otish" onClick={() => setOchiq(false)}>Ro'yxat</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
