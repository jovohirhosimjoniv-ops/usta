import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Briefcase, ShieldCheck, UserRound, Upload, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { KATEGORIYALAR, VILOYATLAR, type Rol } from "@/lib/data";

export const Route = createFileRoute("/royxatdan-otish")({
  head: () => ({
    meta: [
      { title: "Ro'yxatdan o'tish — UstaTop" },
      { name: "description", content: "Mijoz yoki usta sifatida ro'yxatdan o'ting va platformadan foydalaning." },
      { property: "og:title", content: "Ro'yxatdan o'tish — UstaTop" },
      { property: "og:description", content: "Bir necha daqiqada profil yarating." },
    ],
  }),
  component: Royxat,
});

const ROLLAR: { rol: Rol; nom: string; matn: string; icon: typeof UserRound }[] = [
  { rol: "mijoz", nom: "Mijoz", matn: "Usta qidirish va buyurtma berish", icon: UserRound },
  { rol: "usta", nom: "Usta", matn: "Xizmat ko'rsatish va daromad olish", icon: Briefcase },
  { rol: "admin", nom: "Admin", matn: "Platformani boshqarish", icon: ShieldCheck },
];

function Royxat() {
  const navigate = useNavigate();
  const [rol, setRol] = useState<Rol>("mijoz");
  const [qadam, setQadam] = useState(1);
  const [loading, setLoading] = useState(false);

  // Rasm saqlash uchun state va URL preview
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    telefon: "",
    viloyat: VILOYATLAR[0] || "",
    shahar: "",
    haqida: "",
    tajriba: 0,
    kategoriya: KATEGORIYALAR[0]?.slug || "",
    konikma: "",
    vaqt: "",
    narx: 0,
  });

  // Preview URL-ni tozalash (Memory leak oldini olish)
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "number" ? (value === "" ? 0 : Number(value)) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setAvatar(null);
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rol === "usta" && qadam === 1) {
      setQadam(2);
      return;
    }

    setLoading(true);

    try {
      const body = new FormData();
      body.append("username", formData.username);
      body.append("email", formData.email);
      body.append("password", formData.password);
      body.append("telefon", formData.telefon);
      body.append("rol", rol);
      body.append("viloyat", formData.viloyat);
      body.append("shahar", formData.shahar);

      if (avatar) {
        body.append("avatar", avatar);
      }

      if (rol === "usta") {
        body.append("haqida", formData.haqida);
        body.append("tajriba", String(formData.tajriba));
        body.append("kategoriya", formData.kategoriya);
        body.append("konikma", formData.konikma);
        body.append("vaqt", formData.vaqt);
        body.append("narx", String(formData.narx));
      }

      await api.post("/register/", body, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
      navigate({ to: "/kirish" });
    } catch (error: any) {
      console.error(error);
      const serverError = error.response?.data;
      if (serverError && typeof serverError === "object") {
        const firstKey = Object.keys(serverError)[0];
        const errorMessage = Array.isArray(serverError[firstKey])
          ? serverError[firstKey][0]
          : serverError[firstKey];
        toast.error(`${firstKey}: ${errorMessage || "Xatolik yuz berdi"}`);
      } else {
        toast.error("Ro'yxatdan o'tishda xatolik yuz berdi. Qayta urinib ko'ring.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-center text-3xl font-extrabold">Ro'yxatdan o'tish</h1>
      <p className="mt-1 text-center text-sm text-muted-foreground">
        {rol === "usta" ? `${qadam}-qadam / 2` : "Bir qadamda tugatiladi"}
      </p>

      {/* Rol tanlash */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {ROLLAR.map((r) => (
          <button
            key={r.rol}
            type="button"
            onClick={() => {
              setRol(r.rol);
              setQadam(1);
            }}
            className={`card-hover rounded-2xl border-2 bg-card p-5 text-left shadow-soft transition-all ${
              rol === r.rol ? "border-primary" : "border-border"
            }`}
          >
            <r.icon className="mb-2 size-5 text-primary" />
            <p className="font-bold">{r.nom}</p>
            <p className="text-xs text-muted-foreground">{r.matn}</p>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-3xl border bg-card p-8 shadow-lift">
        {qadam === 1 ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Profil rasmi yuklash */}
            <div className="sm:col-span-2 flex flex-col items-center justify-center gap-3 pb-2">
              <Label htmlFor="avatar-upload" className="text-center font-medium">
                Profil rasmi
              </Label>
              {avatarPreview ? (
                <div className="relative size-24 rounded-full border shadow-sm">
                  <img
                    src={avatarPreview}
                    alt="Profil preview"
                    className="size-full rounded-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -right-1 -top-1 rounded-full bg-destructive p-1 text-destructive-foreground shadow hover:opacity-90 transition"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="avatar-upload"
                  className="flex size-24 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed bg-muted/40 transition hover:bg-muted"
                >
                  <Upload className="size-6 text-muted-foreground" />
                  <span className="mt-1 text-[11px] text-muted-foreground">Rasm yuklash</span>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Foydalanuvchi ismi (Username)</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="sardor_rahimov"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefon">Telefon raqam</Label>
              <Input
                id="telefon"
                value={formData.telefon}
                onChange={handleChange}
                placeholder="+998 90 123 45 67"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="siz@mail.uz"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Parol</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="viloyat">Viloyat</Label>
              <select
                id="viloyat"
                value={formData.viloyat}
                onChange={handleChange}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {VILOYATLAR.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shahar">Shahar / tuman</Label>
              <Input
                id="shahar"
                value={formData.shahar}
                onChange={handleChange}
                placeholder="Chilonzor"
                required
              />
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="haqida">O'zi haqida</Label>
              <Textarea
                id="haqida"
                rows={4}
                value={formData.haqida}
                onChange={handleChange}
                placeholder="Tajribangiz va ish uslubingiz haqida yozing"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tajriba">Tajriba yili</Label>
              <Input
                id="tajriba"
                type="number"
                min={0}
                value={formData.tajriba}
                onChange={handleChange}
                placeholder="5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kategoriya">Xizmat kategoriyasi</Label>
              <select
                id="kategoriya"
                value={formData.kategoriya}
                onChange={handleChange}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {KATEGORIYALAR.map((k) => (
                  <option key={k.slug} value={k.slug}>
                    {k.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="konikma">Ko'nikmalar</Label>
              <Input
                id="konikma"
                value={formData.konikma}
                onChange={handleChange}
                placeholder="Kafolatli ish, bepul chaqiruv"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vaqt">Ish vaqti</Label>
              <Input
                id="vaqt"
                value={formData.vaqt}
                onChange={handleChange}
                placeholder="09:00 - 20:00"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="narx">Narx (so'mdan)</Label>
              <Input
                id="narx"
                type="number"
                min={0}
                value={formData.narx}
                onChange={handleChange}
                placeholder="150000"
              />
            </div>
          </div>
        )}

        {/* Tugmalar */}
        <div className="flex flex-wrap gap-3 pt-2">
          {qadam === 2 && (
            <Button type="button" variant="outline" className="rounded-full" onClick={() => setQadam(1)}>
              Orqaga
            </Button>
          )}
          <Button type="submit" size="lg" disabled={loading} className="flex-1 rounded-full">
            {loading ? "Yuborilmoqda..." : rol === "usta" && qadam === 1 ? "Davom etish" : "Ro'yxatdan o'tish"}
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Hisobingiz bormi?{" "}
          <Link to="/kirish" className="font-semibold text-primary underline-offset-4 hover:underline">
            Kirish
          </Link>
        </p>
      </form>
    </div>
  );
}