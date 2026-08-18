import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BadgeCheck, Briefcase, Clock, MapPin, Phone, Star } from "lucide-react";

import { StarRating } from "@/components/site/star-rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { KATEGORIYALAR, narxFormat, type Usta } from "@/lib/data";

const getImageUrl = (path: string | null | undefined) => {
  if (!path) return "/placeholder-avatar.png";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

export const Route = createFileRoute("/ustalar/$ustaId")({
  loader: async ({ params }) => {
    try {
      const response = await api.get(`/ustalar/${params.ustaId}/`);
      const user = response.data;

      const usta: Usta = {
        id: String(user.id),
        ism: user.ism || user.username,
        kategoriyaSlug: user.profile?.kategoriya || "boshqa",
        viloyat: user.profile?.viloyat || "Toshkent",
        shahar: user.profile?.shahar || "",
        tajribaYili: user.profile?.tajriba || 0,
        narxdan: user.profile?.narx || 0,
        reyting: user.profile?.reyting || 5.0,
        sharhlarSoni: user.profile?.sharhlar_soni || 0,
        bajarilganIshlar: user.profile?.bajarilgan_ishlar || 0,
        bandlik: user.profile?.bandlik || "bo'sh",
        ishVaqti: user.profile?.vaqt || "09:00 - 18:00",
        konikmalar: user.profile?.konikma
          ? user.profile.konikma.split(",").map((k: string) => k.trim())
          : [],
        rasm: getImageUrl(user.profile?.rasm),
        telefon: user.profile?.telefon || "",
        haqida: user.profile?.haqida || "Ma'lumot kiritilmagan.",
        vip: user.profile?.vip || false,
        portfolio: Array.isArray(user.profile?.portfolio)
          ? user.profile.portfolio.map((p: any) => ({
              id: String(p.id),
              rasm: getImageUrl(p.rasm),
              sarlavha: p.sarlavha || "Ish namunasi",
            }))
          : [],
        sharhlar: Array.isArray(user.profile?.sharhlar) ? user.profile.sharhlar : [],
      };

      return { usta };
    } catch (error) {
      console.error("Usta profilini olishda xatolik:", error);
      throw notFound();
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Usta topilmadi — UstaTop" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { usta } = loaderData;
    const sarlavha = `${usta.ism} — UstaTop`;
    const tavsif = `${usta.tajribaYili} yillik tajriba, reyting ${usta.reyting}. ${usta.shahar}. Narx ${narxFormat(usta.narxdan)} dan.`;
    return {
      meta: [
        { title: sarlavha },
        { name: "description", content: tavsif },
        { property: "og:title", content: sarlavha },
        { property: "og:description", content: tavsif },
      ],
    };
  },
  component: UstaProfili,
});

function UstaProfili() {
  const { usta }: { usta: Usta } = Route.useLoaderData();
  const kategoriya = KATEGORIYALAR.find((k) => k.slug === usta.kategoriyaSlug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-3xl border bg-card p-6 shadow-soft">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-5">
              <img
                src={usta.rasm}
                alt={usta.ism}
                width={112}
                height={112}
                className="size-24 shrink-0 rounded-2xl object-cover sm:size-28"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-2xl font-extrabold">{usta.ism}</h1>
                  <BadgeCheck className="size-5 shrink-0 text-primary" />
                  {usta.vip && (
                    <Badge className="gradient-accent border-0 text-accent-foreground">
                      VIP
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {kategoriya?.emoji} {kategoriya?.nom || usta.kategoriyaSlug}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <StarRating qiymat={usta.reyting} size="md" />
                  <span className="font-bold">{usta.reyting.toFixed(1)}</span>
                  <span className="text-muted-foreground">({usta.sharhlarSoni} sharh)</span>
                  <span className={usta.bandlik === "bo'sh" ? "text-success" : "text-warning"}>
                    ● {usta.bandlik === "bo'sh" ? "Hozir bo'sh" : "Band"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Briefcase, label: "Tajriba", qiymat: `${usta.tajribaYili} yil` },
                { icon: MapPin, label: "Joylashuv", qiymat: `${usta.viloyat}, ${usta.shahar}` },
                { icon: Clock, label: "Ish vaqti", qiymat: usta.ishVaqti },
                { icon: Star, label: "Bajarilgan ish", qiymat: `${usta.bajarilganIshlar} ta` },
              ].map((m) => (
                <div key={m.label} className="rounded-2xl bg-secondary/60 p-4">
                  <m.icon className="mb-2 size-4 text-primary" />
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="truncate text-sm font-bold">{m.qiymat}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-bold">O'zi haqida</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{usta.haqida}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {usta.konikmalar.map((k) => (
                <Badge key={k} variant="secondary" className="rounded-full">
                  {k}
                </Badge>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-bold">Portfolio</h2>
            {usta.portfolio.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Portfolio rasmlari yuklanmagan.</p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {usta.portfolio.map((p) => (
                  <figure key={p.id} className="group overflow-hidden rounded-2xl border">
                    <img
                      src={p.rasm}
                      alt={p.sarlavha}
                      loading="lazy"
                      width={400}
                      height={300}
                      className="h-32 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <figcaption className="truncate p-2 text-xs text-muted-foreground">
                      {p.sarlavha}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-3xl border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-bold">Sharhlar</h2>
            {usta.sharhlar.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Hozircha sharhlar mavjud emas.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {usta.sharhlar.map((s) => (
                  <div key={s.id} className="rounded-2xl bg-secondary/50 p-4">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                      <p className="truncate text-sm font-bold">{s.mijoz}</p>
                      <span className="text-xs text-muted-foreground">{s.sana}</span>
                    </div>
                    <StarRating qiymat={s.yulduz} className="mt-1" />
                    <p className="mt-2 text-sm text-muted-foreground">{s.matn}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-3xl border bg-card p-6 shadow-lift">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Narx</p>
            <p className="text-2xl font-extrabold">
              {narxFormat(usta.narxdan)}{" "}
              <span className="text-sm font-medium text-muted-foreground">dan</span>
            </p>
            <Button asChild size="lg" className="mt-4 w-full rounded-full">
              <Link to="/buyurtma/$ustaId" params={{ ustaId: usta.id }}>
                Buyurtma berish
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="mt-2 w-full rounded-full">
              <Link
                to="/xabarlar"
                search={{
                  ustaId: usta.id,
                  ism: usta.ism,
                  rasm: usta.rasm,
                }}
              >
                Chat orqali yozish
              </Link>
            </Button>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="size-4" /> {usta.telefon || "Telefon ko'rsatilmagan"}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}