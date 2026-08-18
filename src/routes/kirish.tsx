import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Hammer } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/kirish")({
  head: () => ({
    meta: [
      { title: "Tizimga kirish — UstaTop" },
      { name: "description", content: "UstaTop hisobingizga kiring." },
      { property: "og:title", content: "Tizimga kirish — UstaTop" },
      { property: "og:description", content: "Mijoz, usta va admin hisoblari uchun yagona kirish." },
    ],
  }),
  component: Kirish,
});

function Kirish() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/login/", {
        username,
        password,
      });

      // 1. JWT TOKEN SAQLASH ("access" kaliti shart!)
      if (response.data.access) {
        localStorage.setItem("access", response.data.access);
        localStorage.setItem("token", response.data.access);
        localStorage.setItem("access_token", response.data.access);
      }
      if (response.data.refresh) {
        localStorage.setItem("refresh_token", response.data.refresh);
      }

      // 2. Foydalanuvchi ma'lumotlarini saqlash
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      toast.success("Xush kelibsiz!");
      navigate({ to: "/" }); // Asosiy sahifaga yo'naltirish
    } catch (error: any) {
      console.error("Login error:", error);
      const serverError = error.response?.data;

      if (serverError) {
        if (serverError.non_field_errors) {
          toast.error(serverError.non_field_errors[0]);
        } else {
          const firstKey = Object.keys(serverError)[0];
          toast.error(`${firstKey}: ${serverError[firstKey][0] || serverError[firstKey]}`);
        }
      } else {
        toast.error("Tizimga kirishda xatolik yuz berdi");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid min-h-[80vh] max-w-md place-items-center px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full space-y-5 rounded-3xl border bg-card p-8 shadow-lift"
      >
        <div className="text-center">
          <span className="gradient-hero mx-auto mb-3 grid size-12 place-items-center rounded-2xl text-primary-foreground">
            <Hammer className="size-6" />
          </span>
          <h1 className="text-2xl font-extrabold">Xush kelibsiz</h1>
          <p className="text-sm text-muted-foreground">Hisobingizga kiring</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Foydalanuvchi ismi (Username)</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="sardor_rahimov"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="parol">Parol</Label>
          <Input
            id="parol"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <Button type="submit" size="lg" disabled={loading} className="w-full rounded-full">
          {loading ? "Kirilmoqda..." : "Kirish"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Hisobingiz yo'qmi?{" "}
          <Link to="/royxatdan-otish" className="font-semibold text-primary">
            Ro'yxatdan o'ting
          </Link>
        </p>
      </form>
    </div>
  );
}