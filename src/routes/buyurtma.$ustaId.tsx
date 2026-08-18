import { useState } from "react";
import { createFileRoute, useNavigate, notFound } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { KATEGORIYALAR, narxFormat, type Usta } from "@/lib/data";

const getImageUrl = (path: string | null | undefined) => {
  if (!path) return "/placeholder-avatar.png";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

export const Route = createFileRoute("/buyurtma/$ustaId")({
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
        portfolio: [],
        sharhlar: [],
      };

      return { usta };
    } catch (error) {
      console.error("Usta ma'lumotlarini olishda xatolik:", error);
      throw notFound();
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Buyurtma — UstaTop" }, { name: "robots", content: "noindex" }] };
    }
    const sarlavha = `${loaderData.usta.ism}ga buyurtma berish — UstaTop`;
    return {
      meta: [
        { title: sarlavha },
        { name: "description", content: "Xizmat turi, sana, vaqt va manzilni ko'rsatib buyurtma yuboring." },
      ],
    };
  },
  component: BuyurtmaSahifasi,
});

function BuyurtmaSahifasi() {
  const { usta }: { usta: Usta } = Route.useLoaderData();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. LocalStorage'dan JWT tokenni tekshiramiz
    const token = localStorage.getItem("access") || localStorage.getItem("token") || localStorage.getItem("access_token");

    if (!token) {
      toast.error("Buyurtma berish uchun avval tizimga kiring!");
      navigate({ to: "/login" });
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      usta: usta.id,
      usta_id: usta.id,
      xizmat_turi: formData.get("xizmat"),
      sana: formData.get("sana"),
      vaqt: formData.get("vaqt"),
      manzil: formData.get("manzil"),
      izoh: formData.get("izoh"),
    };

    try {
      // 2. So'rov sarlavhasiga (Header) Bearer tokenni qo'shib yuboramiz (/mijoz/buyurtmalar/ manziliga)
      const res = await api.post("/mijoz/buyurtmalar/", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Muvaffaqiyatli buyurtma:", res.data);
      toast.success("Buyurtma muvaffaqiyatli yuborildi!");
      navigate({ to: "/ustalar/$ustaId", params: { ustaId: usta.id } });
    } catch (error: any) {
      console.error("Buyurtma yuborishda backend xatosi:", error.response?.data || error);

      // 3. Token eskirgan bo'lsa (401 xatosi)
      if (error.response?.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("token");
        localStorage.removeItem("access_token");
        
        toast.error("Sessiya muddati tugagan. Qaytadan tizimga kiring.");
        navigate({ to: "/login" });
        return;
      }

      const backendErrors = error.response?.data;
      let errorMessage = "Buyurtma yuborishda xatolik yuz berdi.";

      if (backendErrors) {
        if (typeof backendErrors === "string") {
          errorMessage = backendErrors;
        } else if (typeof backendErrors === "object") {
          errorMessage = Object.entries(backendErrors)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`)
            .join(" | ");
        }
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold">Buyurtma berish</h1>
      
      <div className="mt-6 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-2xl border bg-card p-5 shadow-soft">
        <img src={usta.rasm} alt={usta.ism} width={64} height={64} className="size-16 shrink-0 rounded-2xl object-cover" />
        <div className="min-w-0">
          <p className="truncate font-bold">{usta.ism}</p>
          <p className="truncate text-sm text-muted-foreground">
            {KATEGORIYALAR.find((k) => k.slug === usta.kategoriyaSlug)?.nom} · {narxFormat(usta.narxdan)} dan
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-3xl border bg-card p-8 shadow-lift">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="xizmat">Xizmat turi</Label>
            <select id="xizmat" name="xizmat" className="h-9 w-full rounded-md border bg-background px-3 text-sm" required>
              {KATEGORIYALAR.map((k) => <option key={k.slug} value={k.nom}>{k.nom}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sana">Sana</Label>
            <Input id="sana" name="sana" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vaqt">Vaqt</Label>
            <Input id="vaqt" name="vaqt" type="time" required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="manzil">Manzil</Label>
            <Input id="manzil" name="manzil" placeholder="Toshkent, Chilonzor tumani, 12-uy" required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="izoh">Izoh</Label>
            <Textarea id="izoh" name="izoh" rows={4} placeholder="Muammoni qisqacha tasvirlab bering" />
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full rounded-full" disabled={loading}>
          {loading ? "Yuborilmoqda..." : "Buyurtmani yuborish"}
        </Button>
      </form>
    </div>
  );
}