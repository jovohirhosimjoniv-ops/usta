import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare, Package, Star, TrendingUp, Users, Wallet } from "lucide-react";
import { toast } from "sonner";

import { DashboardShell, StatCard } from "@/components/site/dashboard-shell";
import { StarRating } from "@/components/site/star-rating";
import { StatusBadge } from "@/components/site/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { KATEGORIYALAR, narxFormat } from "@/lib/data";

export const Route = createFileRoute("/usta-panel")({
  head: () => ({
    meta: [
      { title: "Usta paneli — UstaTop" },
      { name: "description", content: "Buyurtmalar, daromad, reyting va portfolio boshqaruvi bir panelda." },
      { property: "og:title", content: "Usta paneli — UstaTop" },
      { property: "og:description", content: "Xizmatlaringiz va buyurtmalaringizni boshqaring." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UstaPanel,
});

function UstaPanel() {
  const [buyurtmalar, setBuyurtmalar] = useState<any[]>([]);
  const [loadingBuyurtmalar, setLoadingBuyurtmalar] = useState(true);
  const [stats, setStats] = useState({
    jami: 0,
    daromad: 14350000,
    reyting: 5.0,
    mijozlar: 0,
  });

  // Ustaga kelgan buyurtmalarni va ma'lumotlarni backend'dan olish
  useEffect(() => {
    const fetchUstaData = async () => {
      const token = localStorage.getItem("access") || localStorage.getItem("token") || localStorage.getItem("access_token");
      
      if (!token) {
        toast.error("Iltimos, avval tizimga kiring!");
        return;
      }

      try {
        setLoadingBuyurtmalar(true);
        
        // Backend'dan faqat shu ustaga tegishli buyurtmalarni to'g'ri yo'ldan so'raymiz
        const res = await api.get("/usta/buyurtmalar/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data;
        let list = Array.isArray(data) ? data : data?.results || [];

        // Faqat faol yoki barcha buyurtmalar (bekor qilinganlarni ham filtrlamoqchi bo'lsangiz shu yerda bajarasiz)
        setBuyurtmalar(list);

        // Statistikalarni yangilash
        setStats((prev) => ({
          ...prev,
          jami: list.length,
          mijozlar: new Set(list.map((b: any) => b.mijoz || b.user?.id)).size,
        }));
      } catch (error) {
        console.error("Usta buyurtmalarini yuklashda xatolik:", error);
        toast.error("Buyurtmalarni yuklab bo'lmadi.");
      } finally {
        setLoadingBuyurtmalar(false);
      }
    };

    fetchUstaData();
  }, []);

  // Buyurtma statusini o'zgartirish (Qabul qilish yoki Bekor qilish/Rad etish)
  const handleStatusChange = async (id: number | string, newStatus: string) => {
    const token = localStorage.getItem("access") || localStorage.getItem("token") || localStorage.getItem("access_token");

    try {
      await api.patch(
        `/usta/buyurtmalar/${id}/`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Lokal holatni zudlik bilan yangilash
      setBuyurtmalar((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      );

      if (newStatus === "accepted" || newStatus === "qabul_qilingan") {
        toast.success("Buyurtma muvaffaqiyatli qabul qilindi!");
      } else {
        toast.success("Buyurtma rad etildi.");
      }
    } catch (error) {
      console.error("Statusni o'zgartirishda xatolik:", error);
      toast.error("Amaliyotni bajarib bo'lmadi.");
    }
  };

  return (
    <DashboardShell
      sarlavha="Usta paneli"
      matn="Buyurtmalar, daromad va profilingizni boshqaring."
      havolalar={[
        { to: "/usta-panel", nom: "Dashboard", icon: TrendingUp },
        { to: "/xabarlar", nom: "Mijoz chati", icon: MessageSquare },
        { to: "/ustalar", nom: "Reyting", icon: Star },
      ]}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Package} label="Jami buyurtmalar" qiymat={stats.jami.toString()} ozgarish="+12%" />
        <StatCard icon={Wallet} label="Daromad (oy)" qiymat={narxFormat(stats.daromad)} ozgarish="+8%" />
        <StatCard icon={Star} label="Reyting" qiymat={stats.reyting.toFixed(1)} />
        <StatCard icon={Users} label="Mijozlar" qiymat={stats.mijozlar.toString()} ozgarish="+5" />
      </div>

      <section className="rounded-3xl border bg-card p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-bold">Yangi buyurtmalar</h2>
        
        {loadingBuyurtmalar ? (
          <p className="text-sm text-muted-foreground">Buyurtmalar yuklanmoqda...</p>
        ) : buyurtmalar.length > 0 ? (
          <div className="space-y-3">
            {buyurtmalar.map((b) => {
              const mijozIsmi = b.user?.username || b.mijoz_ism || b.mijoz || "Mijoz";
              return (
                <div key={b.id} className="grid gap-3 rounded-2xl border p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {b.xizmat_turi || b.xizmat} · {mijozIsmi}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {b.sana}, {b.vaqt} · {b.manzil}
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      className="rounded-full" 
                      onClick={() => handleStatusChange(b.id, "accepted")}
                    >
                      Qabul qilish
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="rounded-full" 
                      onClick={() => handleStatusChange(b.id, "cancelled")}
                    >
                      Rad etish
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Hozircha yangi buyurtmalar mavjud emas.</p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border bg-card p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-bold">Xizmat qo'shish</h2>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Xizmat qo'shildi"); }}>
            <div className="space-y-2">
              <Label htmlFor="xizmat-nom">Xizmat nomi</Label>
              <Input id="xizmat-nom" placeholder="Kran o'rnatish" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="xizmat-kat">Kategoriya</Label>
              <select id="xizmat-kat" className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                {KATEGORIYALAR.map((k) => <option key={k.slug} value={k.slug}>{k.nom}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="xizmat-narx">Narx (so'm)</Label>
              <Input id="xizmat-narx" type="number" placeholder="150000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ish-rasm">Ish rasmlarini yuklash</Label>
              <Input id="ish-rasm" type="file" accept="image/*" multiple />
            </div>
            <Button type="submit" className="w-full rounded-full">Saqlash</Button>
          </form>
        </section>

        <section className="rounded-3xl border bg-card p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-bold">So'nggi sharhlar</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Hozircha sharhlar mavjud emas.</p>
          </div>
        </section>
      </div>

      <section className="gradient-hero rounded-3xl p-8 text-primary-foreground shadow-lift">
        <h2 className="text-xl font-extrabold">Premium imkoniyatlar</h2>
        <p className="mt-1 text-sm opacity-90">VIP profil, reklama joylashtirish va qidiruvda yuqori o'rin.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            { nom: "Standart", narx: "Bepul", izoh: "Oddiy profil va buyurtmalar" },
            { nom: "VIP", narx: narxFormat(99000), izoh: "Qidiruvda yuqorida + VIP nishon" },
            { nom: "Reklama", narx: narxFormat(249000), izoh: "Bosh sahifada banner" },
          ].map((t) => (
            <div key={t.nom} className="glass rounded-2xl p-5">
              <p className="text-sm font-bold">{t.nom}</p>
              <p className="mt-1 text-xl font-extrabold">{t.narx}</p>
              <p className="mt-1 text-xs opacity-90">{t.izoh}</p>
              <Button size="sm" className="mt-4 w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => toast("To'lov tizimi tez orada")}>
                Tanlash
              </Button>
            </div>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}