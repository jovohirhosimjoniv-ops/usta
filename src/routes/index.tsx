import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CalendarCheck, Loader2, MessageSquare, Search, ShieldCheck, Sparkles, Star, Users } from "lucide-react";
import { useEffect, useState } from "react";

import heroImg from "@/assets/hero-usta.jpg";
import { SectionHeader } from "@/components/site/section-header";
import { StarRating } from "@/components/site/star-rating";
import { UstaCard } from "@/components/site/usta-card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { HAMKORLAR, KATEGORIYALAR, MIJOZ_FIKRLARI } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UstaTop — Kerakli ustani bir necha daqiqada toping" },
      {
        name: "description",
        content:
          "UstaTop — O'zbekistondagi ishonchli ustalar platformasi. Santexnik, elektrik, qurilish ustasi va boshqa mutaxassislarni reyting va narx bo'yicha toping.",
      },
      { property: "og:title", content: "UstaTop — Ishonchli ustalar platformasi" },
      {
        property: "og:description",
        content: "Uy, ofis va qurilish ishlari uchun ishonchli mutaxassislarni toping.",
      },
    ],
  }),
  component: BoshSahifa,
});

const QADAMLAR = [
  { icon: Search, sarlavha: "Usta qidiring", matn: "Kategoriya, joylashuv va reyting bo'yicha filtrlang." },
  { icon: CalendarCheck, sarlavha: "Buyurtma bering", matn: "Sana, vaqt va manzilni ko'rsating." },
  { icon: MessageSquare, sarlavha: "Kelishing", matn: "Ichki chat orqali tafsilotlarni muhokama qiling." },
  { icon: Star, sarlavha: "Baholang", matn: "Ish tugagach ustaga reyting va sharh qoldiring." },
];

const getImageUrl = (path: string | null | undefined) => {
  if (!path) return "/placeholder-avatar.png";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const API_URL = import.meta.env.VITE_API_URL || "https://rest-production-388c.up.railway.app/";
  const cleanApiUrl = API_URL.replace(/\/api\/?$/, "").replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanApiUrl}${cleanPath}`;
};

function BoshSahifa() {
  const navigate = useNavigate();
  const [qidiruvText, setQidiruvText] = useState("");
  const [ustalar, setUstalar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [statsData, setStatsData] = useState({
    mijozlar: 0,
    ustalar: 0,
    tugatilgan_ishlar: 0,
    mamnunlik: "98%",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ustalarRes = await api.get("/ustalar/");
        const data = Array.isArray(ustalarRes.data)
          ? ustalarRes.data
          : ustalarRes.data?.results || [];

        const formatted = data.map((user: any) => ({
          id: user.id,
          ism: user.ism || user.first_name || user.username,
          kategoriyaSlug: user.profile?.kategoriya || "boshqa",
          viloyat: user.profile?.viloyat || "Toshkent",
          shahar: user.profile?.shahar || "",
          tajribaYili: user.profile?.tajriba || 0,
          narxdan: user.profile?.narx || 0,
          reyting: 5.0,
          konikmalar: user.profile?.konikma ? user.profile.konikma.split(",") : [],
          rasm: getImageUrl(user.profile?.rasm),
          telefon: user.profile?.telefon,
          haqida: user.profile?.haqida,
        }));

        setUstalar(formatted);

        try {
          const statsRes = await api.get("/statistika/");
          if (statsRes.data) {
            setStatsData(statsRes.data);
          }
        } catch (e) {
          console.warn("Statistika API ma'lumoti olinmadi:", e);
        }
      } catch (error) {
        console.error("Ma'lumotlarni olishda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sun'iy 205+ ko'paytmasiz, faqat backend bergan aniq bazaviy ko'rsatkichlar
  const ustaSoni = ustalar.length || statsData.ustalar;
  const mijozSoni = statsData.mijozlar;
  const tugatilganIshSoni = statsData.tugatilgan_ishlar;

  const statistika = [
    { qiymat: `${mijozSoni}`, label: "Mijozlar" },
    { qiymat: `${ustaSoni}`, label: "Usta" },
    { qiymat: `${tugatilganIshSoni}`, label: "Tugatilgan ish" },
    { qiymat: statsData.mamnunlik || "98%", label: "Mamnun mijoz" },
  ];

  const mashhur = ustalar.slice(0, 8);
  const yuqoriReyting = [...ustalar].sort((a, b) => b.reyting - a.reyting).slice(0, 4);
  const yangilar = [...ustalar].reverse().slice(0, 4);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (qidiruvText.trim()) {
      navigate({ to: "/ustalar", search: { q: qidiruvText } as any });
    } else {
      navigate({ to: "/ustalar" });
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="gradient-hero absolute inset-0 opacity-[0.97]" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 text-primary-foreground lg:grid-cols-2 lg:px-8 lg:py-24">
          <div className="animate-rise min-w-0 space-y-7">
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold">
              <Sparkles className="size-3.5" /> O'zbekistondagi №1 usta marketplace
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl">
              Kerakli ustani bir necha daqiqada toping
            </h1>
            <p className="max-w-xl text-base opacity-90 sm:text-lg">
              Uy, ofis va qurilish ishlari uchun ishonchli mutaxassislarni toping.
            </p>

            {/* Qidiruv Formasi */}
            <form onSubmit={handleSearch} className="glass flex flex-col gap-2 rounded-2xl p-2 sm:flex-row">
              <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
                <Search className="size-4 shrink-0 opacity-70" />
                <input
                  value={qidiruvText}
                  onChange={(e) => setQidiruvText(e.target.value)}
                  placeholder="Qanday xizmat kerak? Masalan: santexnik"
                  className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-primary-foreground/70"
                  aria-label="Xizmat qidirish"
                />
              </div>
              <Button type="submit" size="lg" className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90">
                Usta topish
              </Button>
            </form>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary" className="rounded-full">
                <Link to="/royxatdan-otish">Usta sifatida ro'yxatdan o'tish</Link>
              </Button>
            </div>
          </div>

          <div className="animate-rise relative">
            <img
              src={heroImg}
              alt="UstaTop platformasidagi professional usta"
              width={1280}
              height={1280}
              className="w-full rounded-[2rem] object-cover shadow-lift"
            />
            <div className="glass absolute -bottom-6 left-4 rounded-2xl p-4 text-foreground sm:left-8">
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-8 text-primary" />
                <div>
                  <p className="text-sm font-bold">Tekshirilgan ustalar</p>
                  <p className="text-xs text-muted-foreground">Hujjatlari tasdiqlangan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Statistika Blocki */}
      <section className="mx-auto -mt-8 max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-2 gap-4 rounded-3xl border bg-card p-6 shadow-lift lg:grid-cols-4">
          {statistika.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-extrabold sm:text-3xl">{s.qiymat}</p>
              <p className="text-xs text-muted-foreground sm:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Kategoriyalar */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <SectionHeader
          ustki="Xizmatlar"
          sarlavha="Kategoriyalar"
          matn="Kerakli yo'nalishni tanlang va mutaxassislar ro'yxatini ko'ring."
          havola={{ to: "/kategoriyalar", nom: "Barchasi" }}
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {KATEGORIYALAR.map((k) => (
            <Link
              key={k.id}
              to="/kategoriyalar/$slug"
              params={{ slug: k.slug }}
              className="card-hover rounded-2xl border bg-card p-5 text-center shadow-soft"
            >
              <span className="mb-3 inline-grid size-14 place-items-center rounded-2xl bg-secondary text-2xl">
                {k.emoji}
              </span>
              <p className="truncate text-sm font-bold">{k.nom}</p>
              <p className="text-xs text-muted-foreground">
                {ustalar.filter((u) => u.kategoriyaSlug === k.slug).length} usta
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Mashhur ustalar */}
      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeader
            ustki="Tanlangan"
            sarlavha="Mashhur ustalar"
            matn="Eng ko'p buyurtma olgan mutaxassislar."
            havola={{ to: "/ustalar", nom: "Barcha ustalar" }}
          />
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {mashhur.map((u) => (
                <UstaCard key={u.id} usta={u} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Yuqori reyting */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <SectionHeader ustki="Reyting" sarlavha="Eng yuqori reytingdagi ustalar" />
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {yuqoriReyting.map((u) => (
              <UstaCard key={u.id} usta={u} />
            ))}
          </div>
        )}
      </section>

      {/* Yangi ustalar */}
      <section className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
        <SectionHeader ustki="Yangiliklar" sarlavha="Yangi qo'shilgan ustalar" />
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {yangilar.map((u) => (
              <UstaCard key={u.id} usta={u} />
            ))}
          </div>
        )}
      </section>

      {/* Qanday ishlaydi */}
      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeader ustki="Jarayon" sarlavha="Qanday ishlaydi?" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {QADAMLAR.map((q, i) => (
              <div key={q.sarlavha} className="card-hover rounded-2xl border bg-card p-6 shadow-soft">
                <span className="gradient-hero mb-4 grid size-11 place-items-center rounded-xl text-primary-foreground">
                  <q.icon className="size-5" />
                </span>
                <p className="text-xs font-bold text-primary">0{i + 1}</p>
                <h3 className="mt-1 text-base font-bold">{q.sarlavha}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{q.matn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mijoz fikrlari */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <SectionHeader ustki="Ishonch" sarlavha="Mijoz fikrlari" />
        <div className="grid gap-5 lg:grid-cols-3">
          {MIJOZ_FIKRLARI.map((f) => (
            <figure key={f.id} className="card-hover rounded-2xl border bg-card p-6 shadow-soft">
              <StarRating qiymat={f.yulduz} size="md" />
              <blockquote className="mt-4 text-sm leading-relaxed">"{f.matn}"</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <img src={f.rasm} alt={f.ism} loading="lazy" width={44} height={44} className="size-11 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{f.ism}</p>
                  <p className="text-xs text-muted-foreground">{f.shahar}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Hamkorlar */}
      <section className="border-y bg-card py-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-6 px-4 lg:px-8">
          {HAMKORLAR.map((h) => (
            <span key={h} className="text-lg font-extrabold text-muted-foreground/70 transition-colors hover:text-foreground">
              {h}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="gradient-hero grid items-center gap-6 rounded-3xl p-10 text-primary-foreground shadow-lift lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <h2 className="text-2xl font-extrabold sm:text-3xl">Usta bo'lsangiz — mijozlar sizni kutmoqda</h2>
            <p className="mt-2 max-w-2xl opacity-90">
              Profil yarating, xizmat va narxlaringizni joylashtiring, buyurtmalarni qabul qiling.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/royxatdan-otish">Usta bo'lish</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="rounded-full">
              <Link to="/usta-panel">
                <Users className="mr-2 size-4" /> Usta paneli
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}