import { createFileRoute, Link } from "@tanstack/react-router";
import { KATEGORIYALAR } from "@/lib/data";

export const Route = createFileRoute("/kategoriyalar/")({
  head: () => ({
    meta: [
      { title: "Xizmat kategoriyalari — UstaTop" },
      { name: "description", content: "Santexnik, elektrik, duradgor va boshqa yo'nalishlar bo'yicha ustalar." },
      { property: "og:title", content: "Xizmat kategoriyalari — UstaTop" },
      { property: "og:description", content: "Kerakli yo'nalishni tanlang va mutaxassislarni ko'ring." },
    ],
  }),
  component: Kategoriyalar,
});

function Kategoriyalar() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <h1 className="text-3xl font-extrabold">Kategoriyalar</h1>
      <p className="mt-1 text-sm text-muted-foreground">Kerakli xizmat turini tanlang.</p>
      
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {KATEGORIYALAR.map((k) => (
          <Link
            key={k.id}
            to="/kategoriyalar/$slug"
            params={{ slug: k.slug }}
            className="card-hover grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-2xl border bg-card p-5 shadow-soft hover:border-primary/50 transition-colors"
          >
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-secondary text-2xl">
              {k.emoji}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-bold">{k.nom}</span>
              <span className="block truncate text-sm text-muted-foreground">{k.tavsif}</span>
              <span className="mt-1 block text-xs font-semibold text-primary">
                {k.ustalarSoni ?? 0} usta
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}