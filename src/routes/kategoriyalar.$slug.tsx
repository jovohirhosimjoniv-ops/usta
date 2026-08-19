import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Loader2, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { UstaCard } from "@/components/site/usta-card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { kategoriyaniOl, type Kategoriya } from "@/lib/data";

export const Route = createFileRoute("/kategoriyalar/$slug")({
  loader: ({ params }) => {
    const kategoriya = kategoriyaniOl(params.slug);
    if (!kategoriya) throw notFound();
    return { kategoriya };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Kategoriya topilmadi — UstaTop" }, { name: "robots", content: "noindex" }] };
    }
    const { kategoriya } = loaderData;
    const sarlavha = `${kategoriya.nom} ustalari — UstaTop`;
    return {
      meta: [
        { title: sarlavha },
        { name: "description", content: `${kategoriya.tavsif}. Reyting, narx, joylashuv va tajriba bo'yicha tanlang.` },
        { property: "og:title", content: sarlavha },
        { property: "og:description", content: kategoriya.tavsif },
      ],
    };
  },
  component: KategoriyaSahifasi,
});

// Backend'dan kelayotgan rasm URL'ini to'g'rilash
const getImageUrl = (path: string | null | undefined) => {
  if (!path) return "/placeholder-avatar.png";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  
  const API_URL = import.meta.env.VITE_API_URL || "https://rest-production-388c.up.railway.app/";
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

function KategoriyaSahifasi() {
  const { slug } = Route.useParams();
  const { kategoriya }: { kategoriya: Kategoriya } = Route.useLoaderData();

  const [ustalar, setUstalar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUstalar = async () => {
      setLoading(true);
      try {
        const response = await api.get("/ustalar/");
        
        // Tanlangan kategoriya slug'iga mos keladigan ustalarni saralab olish
        const filteredUstalar = response.data
          .filter((user: any) => user.profile?.kategoriya === slug)
          .map((user: any) => ({
            id: user.id,
            ism: user.ism || user.username,
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

        setUstalar(filteredUstalar);
      } catch (error) {
        console.error("Kategoriya bo'yicha ustalarni olishda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUstalar();
  }, [slug]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      {/* Kategoriya Sarlavha Paneli */}
      <div className="gradient-hero grid grid-cols-[auto_minmax(0,1fr)] items-center gap-5 rounded-3xl p-8 text-primary-foreground shadow-lift">
        <span className="glass grid size-16 shrink-0 place-items-center rounded-2xl text-3xl">{kategoriya.emoji}</span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-extrabold sm:text-3xl">{kategoriya.nom}</h1>
          <p className="mt-1 text-sm opacity-90">{kategoriya.tavsif}</p>
        </div>
      </div>

      {/* Ustalar Ro'yxati */}
      {loading ? (
        <div className="mt-20 flex flex-col items-center justify-center gap-2">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{kategoriya.nom} ustalari yuklanmoqda...</p>
        </div>
      ) : ustalar.length === 0 ? (
        <div className="mt-16 text-center">
          <Users className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 text-lg font-semibold">Ushbu kategoriyada hali ustalar mavjud emas</p>
          <p className="text-sm text-muted-foreground">Boshqa kategoriyalarni ko'rib chiqing.</p>
          <Button asChild className="mt-5 rounded-full">
            <Link to="/kategoriyalar">Barcha kategoriyalar</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ustalar.map((u) => (
            <UstaCard key={u.id} usta={u} />
          ))}
        </div>
      )}
    </div>
  );
}