import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, LayoutGrid, Package, TrendingUp, Users, Wallet } from "lucide-react";

import { DashboardShell, StatCard } from "@/components/site/dashboard-shell";
import { StatusBadge } from "@/components/site/status-badge";
import { Badge } from "@/components/ui/badge";
import { BUYURTMALAR, KATEGORIYALAR, narxFormat, USTALAR } from "@/lib/data";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel — UstaTop" },
      { name: "description", content: "Foydalanuvchilar, ustalar, buyurtmalar va to'lovlar statistikasi." },
      { property: "og:title", content: "Admin panel — UstaTop" },
      { property: "og:description", content: "Platforma boshqaruv paneli." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const SHIKOYATLAR = [
  { id: "sh1", mijoz: "Aziza Karimova", usta: "Jasur Karimov", sabab: "Kechikib keldi", holat: "Ko'rib chiqilmoqda" },
  { id: "sh2", mijoz: "Ravshan Toirov", usta: "Bekzod To'xtayev", sabab: "Narx kelishilganidan yuqori", holat: "Yangi" },
];

function Admin() {
  return (
    <DashboardShell
      sarlavha="Admin panel"
      matn="Platforma statistikasi va boshqaruvi."
      havolalar={[
        { to: "/admin", nom: "Statistika", icon: TrendingUp },
        { to: "/ustalar", nom: "Ustalar", icon: Users },
        { to: "/kategoriyalar", nom: "Kategoriyalar", icon: LayoutGrid },
      ]}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Foydalanuvchilar" qiymat="102 480" ozgarish="+2.4%" />
        <StatCard icon={Package} label="Ustalar" qiymat="5 128" ozgarish="+118" />
        <StatCard icon={LayoutGrid} label="Buyurtmalar" qiymat="51 902" ozgarish="+6%" />
        <StatCard icon={Wallet} label="Daromad (oy)" qiymat={narxFormat(842000000)} ozgarish="+11%" />
      </div>

      <section className="rounded-3xl border bg-card p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-bold">So'nggi buyurtmalar</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-2">ID</th><th>Mijoz</th><th>Usta</th><th>Xizmat</th><th>Summa</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {BUYURTMALAR.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="py-3 font-semibold">{b.id}</td>
                  <td>{b.mijoz}</td>
                  <td>{b.ustaIsmi}</td>
                  <td>{b.xizmat}</td>
                  <td>{narxFormat(b.narx)}</td>
                  <td><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border bg-card p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-bold">Kategoriyalar</h2>
          <div className="space-y-2">
            {KATEGORIYALAR.slice(0, 6).map((k) => (
              <div key={k.slug} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border p-3">
                <p className="truncate text-sm font-semibold">{k.emoji} {k.nom}</p>
                <Badge variant="secondary">{k.ustalarSoni}</Badge>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border bg-card p-6 shadow-soft">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <AlertTriangle className="size-5 text-warning" /> Shikoyatlar
          </h2>
          <div className="space-y-3">
            {SHIKOYATLAR.map((s) => (
              <div key={s.id} className="rounded-2xl bg-secondary/50 p-4">
                <p className="truncate text-sm font-bold">{s.mijoz} → {s.usta}</p>
                <p className="text-sm text-muted-foreground">{s.sabab}</p>
                <Badge variant="secondary" className="mt-2">{s.holat}</Badge>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-3xl border bg-card p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-bold">Top ustalar</h2>
        <div className="space-y-2">
          {[...USTALAR].sort((a, b) => b.reyting - a.reyting).slice(0, 5).map((u, i) => (
            <div key={u.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border p-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-xs font-bold">{i + 1}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{u.ism}</span>
                <span className="block truncate text-xs text-muted-foreground">{u.shahar} · {u.bajarilganIshlar} ish</span>
              </span>
              <Badge variant="secondary">⭐ {u.reyting.toFixed(1)}</Badge>
            </div>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
