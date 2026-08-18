import { createFileRoute } from "@tanstack/react-router";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { UstaCard } from "@/components/site/usta-card";
import { Button } from "@/components/ui/button";
import { KATEGORIYALAR, VILOYATLAR } from "@/lib/data";
import { api } from "@/lib/api";
import { CUSTOM_EVENT_NAME, FAVORITES_CHANNEL, getSavedUstaIds } from "@/lib/favorites";

export const Route = createFileRoute("/ustalar/")({
  head: () => ({
    meta: [
      { title: "Ustalar ro'yxati — UstaTop" },
      { name: "description", content: "Reyting, narx, joylashuv va tajriba bo'yicha ustalarni filtrlab toping." },
      { property: "og:title", content: "Ustalar ro'yxati — UstaTop" },
      { property: "og:description", content: "O'zbekiston bo'ylab tekshirilgan ustalar katalogi." },
    ],
  }),
  component: Ustalar,
});

// Backend'dan kelayotgan rasm URL'ini to'g'irlash funksiyasi
const getImageUrl = (path: string | null | undefined) => {
  if (!path) return "/placeholder-avatar.png";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

function Ustalar() {
  const [ustalarData, setUstalarData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qidiruv, setQidiruv] = useState("");
  const [kat, setKat] = useState("hammasi");
  const [viloyat, setViloyat] = useState("hammasi");
  const [saralash, setSaralash] = useState("reyting");
  
  // Saqlangan ustalar ID-larini kuzatish uchun holat
  const [saqlanganIds, setSaqlanganIds] = useState<string[]>([]);

  // Saqlangan ID-larni sinxronlash
  const loadSaved = () => {
    setSaqlanganIds(getSavedUstaIds());
  };

  useEffect(() => {
    loadSaved();

    const handleUpdate = () => loadSaved();
    window.addEventListener(CUSTOM_EVENT_NAME, handleUpdate);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(FAVORITES_CHANNEL);
      channel.onmessage = () => loadSaved();
    } catch (e) {
      console.error(e);
    }

    return () => {
      window.removeEventListener(CUSTOM_EVENT_NAME, handleUpdate);
      channel?.close();
    };
  }, []);

  // Backend API'dan ustalarni yuklab olish
  useEffect(() => {
    const fetchUstalar = async () => {
      try {
        const response = await api.get("/ustalar/");

        const formattedUstalar = response.data.map((user: any) => ({
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

        setUstalarData(formattedUstalar);
      } catch (error) {
        console.error("Ustalar ro'yxatini olishda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUstalar();
  }, []);

  const royxat = useMemo(() => {
    let n = ustalarData.filter(
      (u) =>
        (kat === "hammasi" || u.kategoriyaSlug === kat) &&
        (viloyat === "hammasi" || u.viloyat === viloyat) &&
        (u.ism.toLowerCase().includes(qidiruv.toLowerCase()) ||
          u.kategoriyaSlug.toLowerCase().includes(qidiruv.toLowerCase())),
    );
    n = [...n].sort((a, b) =>
      saralash === "narx"
        ? a.narxdan - b.narxdan
        : saralash === "tajriba"
          ? b.tajribaYili - a.tajribaYili
          : b.reyting - a.reyting,
    );
    return n;
  }, [ustalarData, qidiruv, kat, viloyat, saralash]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <h1 className="text-3xl font-extrabold">Ustalar</h1>
      <p className="mt-1 text-sm text-muted-foreground">{royxat.length} ta mutaxassis topildi</p>

      <div className="mt-6 grid gap-3 rounded-2xl border bg-card p-4 shadow-soft md:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
        <div className="flex min-w-0 items-center gap-2 rounded-xl border px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={qidiruv}
            onChange={(e) => setQidiruv(e.target.value)}
            placeholder="Usta yoki xizmat nomi"
            aria-label="Qidirish"
            className="w-full bg-transparent py-2.5 text-sm outline-none"
          />
        </div>
        <select
          value={kat}
          onChange={(e) => setKat(e.target.value)}
          aria-label="Kategoriya"
          className="rounded-xl border bg-background px-3 py-2.5 text-sm"
        >
          <option value="hammasi">Barcha kategoriyalar</option>
          {KATEGORIYALAR.map((k) => (
            <option key={k.slug} value={k.slug}>
              {k.nom}
            </option>
          ))}
        </select>
        <select
          value={viloyat}
          onChange={(e) => setViloyat(e.target.value)}
          aria-label="Viloyat"
          className="rounded-xl border bg-background px-3 py-2.5 text-sm"
        >
          <option value="hammasi">Barcha viloyatlar</option>
          {VILOYATLAR.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <select
          value={saralash}
          onChange={(e) => setSaralash(e.target.value)}
          aria-label="Saralash"
          className="rounded-xl border bg-background px-3 py-2.5 text-sm"
        >
          <option value="reyting">Reyting bo'yicha</option>
          <option value="narx">Arzon narx</option>
          <option value="tajriba">Ko'p tajriba</option>
        </select>
      </div>

      {loading ? (
        <div className="mt-20 flex flex-col items-center justify-center gap-2">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Ustalar yuklanmoqda...</p>
        </div>
      ) : royxat.length === 0 ? (
        <div className="mt-16 text-center">
          <SlidersHorizontal className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 font-semibold">Hech narsa topilmadi</p>
          <Button
            className="mt-4 rounded-full"
            onClick={() => {
              setQidiruv("");
              setKat("hammasi");
              setViloyat("hammasi");
            }}
          >
            Filtrlarni tozalash
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {royxat.map((u) => (
            <UstaCard key={u.id} usta={u} />
          ))}
        </div>
      )}
    </div>
  );
}