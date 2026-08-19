import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  Package,
  Star,
  UserCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardShell, StatCard } from "@/components/site/dashboard-shell";
import { UstaCard } from "@/components/site/usta-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import {
  CUSTOM_EVENT_NAME,
  FAVORITES_CHANNEL,
  getSavedUstaIds,
} from "@/lib/favorites";
import { getAvatarUrl } from "@/lib/utils";

export const Route = createFileRoute("/kabinet")({
  head: () => ({
    meta: [{ title: "Mijoz kabineti — UstaTop" }],
  }),
  component: Kabinet,
});

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200";

const getImageUrl = (path: string | null | undefined) => {
  if (!path) return "/placeholder-avatar.png";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const API_URL = import.meta.env.VITE_API_URL || "https://rest-production-388c.up.railway.app/";
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

const STATUS_MAP: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "Kutilmoqda", variant: "outline" },
  created: { label: "Kutilmoqda", variant: "outline" },
  new: { label: "Kutilmoqda", variant: "outline" },
  accepted: { label: "Qabul qilindi", variant: "default" },
  approved: { label: "Qabul qilindi", variant: "default" },
  completed: { label: "Bajarildi", variant: "secondary" },

  yangi: { label: "Kutilmoqda", variant: "outline" },
  panding: { label: "Kutilmoqda", variant: "outline" },
  tasdiqlandi: { label: "Qabul qilindi", variant: "default" },
  bajarildi: { label: "Bajarildi", variant: "secondary" },
};

export function Kabinet() {
  const [user, setUser] = useState({
    ism: "",
    familiya: "",
    shahar: "",
    rol: "Mijoz",
    avatar: "",
  });

  const [saqlanganIds, setSaqlanganIds] = useState<string[]>([]);
  const [allUstalar, setAllUstalar] = useState<any[]>([]);
  const [buyurtmalar, setBuyurtmalar] = useState<any[]>([]);
  const [loadingBuyurtmalar, setLoadingBuyurtmalar] = useState(true);
  const [cancelingId, setCancelingId] = useState<number | string | null>(null);

  useEffect(() => {
    const fetchUstalar = async () => {
      try {
        const response = await api.get("/ustalar/");
        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];

        const formatted = data.map((u: any) => {
          const viloyat = u.profile?.viloyat || "";
          const shahar = u.profile?.shahar || "";
          const joylashuv =
            [viloyat, shahar].filter(Boolean).join(", ") || "Joylashuv ko'rsatilmagan";

          return {
            id: u.id,
            ism: u.ism || u.first_name || u.username,
            kategoriyaSlug: u.profile?.kategoriya || "boshqa",
            viloyat: viloyat,
            shahar: joylashuv,
            tajribaYili: u.profile?.tajriba || 0,
            narxdan: u.profile?.narx || 0,
            reyting: 5.0,
            rasm: getImageUrl(u.profile?.rasm),
            haqida: u.profile?.haqida,
          };
        });
        setAllUstalar(formatted);
      } catch (e) {
        console.error("Ustalar yuklanmadi:", e);
      }
    };

    fetchUstalar();
  }, []);

  useEffect(() => {
    const fetchBuyurtmalar = async () => {
      try {
        setLoadingBuyurtmalar(true);
        const response = await api.get("/mijoz/buyurtmalar/");

        const data = response.data;
        let list = Array.isArray(data) ? data : data?.results || [];

        list = list.filter((b: any) => {
          const st = String(b.status || "").toLowerCase();
          return !["canceled", "cancelled", "bekor_qilindi"].includes(st);
        });

        setBuyurtmalar(list);
      } catch (e) {
        console.error("Buyurtmalarni olishda xatolik:", e);
      } finally {
        setLoadingBuyurtmalar(false);
      }
    };

    fetchBuyurtmalar();
  }, []);

  const loadSaved = () => {
    setSaqlanganIds(getSavedUstaIds());
  };

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);

        const v = parsed.viloyat || parsed.profile?.viloyat;
        const sh = parsed.shahar || parsed.profile?.shahar;
        const joylashuv =
          [v, sh].filter(Boolean).join(", ") || v || sh || "Ko'rsatilmagan";

        setUser({
          ism: parsed.ism || parsed.first_name || parsed.username || "Mijoz",
          familiya: parsed.familiya || parsed.last_name || "",
          shahar: joylashuv,
          rol: parsed.rol === "usta" ? "Usta" : "Mijoz",
          avatar: parsed.avatar || parsed.rasm || parsed.profile?.rasm || "",
        });
      }
    } catch (e) {
      console.error(e);
    }

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

  const handleBekorQilish = async (id: number | string) => {
    if (!confirm("Haqiqatan ham ushbu buyurtmani bekor qilmoqchimisiz?")) {
      return;
    }

    setCancelingId(id);
    try {
      await api.delete(`/mijoz/buyurtmalar/${id}/`);
      setBuyurtmalar((prev) => prev.filter((b) => b.id !== id));
      toast.success("Buyurtma bekor qilindi va o'chirildi");
    } catch (error) {
      try {
        await api.patch(`/mijoz/buyurtmalar/${id}/`, { status: "canceled" });
        setBuyurtmalar((prev) => prev.filter((b) => b.id !== id));
        toast.success("Buyurtma bekor qilindi va o'chirildi");
      } catch (patchError) {
        console.error("Bekor qilish xatosi:", patchError);
        toast.error("Buyurtmani bekor qilib bo'lmadi");
      }
    } finally {
      setCancelingId(null);
    }
  };

  const saqlanganUstalar = allUstalar.filter((u) =>
    saqlanganIds.includes(String(u.id))
  );

  return (
    <DashboardShell
      sarlavha="Mijoz kabineti"
      matn="Buyurtmalaringiz va saqlangan ustalar."
      havolalar={[
        { to: "/kabinet", nom: "Dashboard", icon: Package },
        { to: "/xabarlar", nom: "Xabarlar", icon: MessageSquare },
        { to: "/ustalar", nom: "Usta qidirish", icon: Star },
      ]}
    >
      {/* PROFIL SEKSIYASI */}
      <section className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-3xl border bg-card p-6 shadow-soft">
        <img
          src={getAvatarUrl(user.avatar)}
          alt={`${user.ism} profili`}
          width={72}
          height={72}
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
          }}
          className="size-16 shrink-0 rounded-2xl object-cover sm:size-18"
        />
        <div className="min-w-0">
          <h2 className="truncate text-xl font-extrabold">
            {user.ism} {user.familiya}
          </h2>
          <p className="text-sm text-muted-foreground">
            {user.shahar} · {user.rol}
          </p>
        </div>
      </section>

      {/* STATISTIKA */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Package}
          label="Buyurtmalar"
          qiymat={buyurtmalar.length.toString()}
          ozgarish={`+${buyurtmalar.length}`}
        />
        <StatCard
          icon={UserCheck}
          label="Saqlangan ustalar"
          qiymat={saqlanganUstalar.length.toString()}
        />
        <StatCard icon={Star} label="Sharhlarim" qiymat="3" />
        <StatCard icon={MessageSquare} label="Faol suhbatlar" qiymat="3" />
      </div>

      {/* BUYURTMALAR BO'LIMI */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Mening buyurtmalarim ({buyurtmalar.length})
          </h2>
        </div>

        {loadingBuyurtmalar ? (
          <div className="rounded-2xl border p-8 text-center text-muted-foreground">
            Buyurtmalar yuklanmoqda...
          </div>
        ) : buyurtmalar.length > 0 ? (
          <div className="max-h-[350px] overflow-y-auto pr-2">
            <div className="grid gap-4 sm:grid-cols-2">
              {buyurtmalar.map((item) => {
                const rawStatus = item.status
                  ? String(item.status).toLowerCase()
                  : "pending";
                const statusInfo = STATUS_MAP[rawStatus] || {
                  label: item.status || "Kutilmoqda",
                  variant: "outline",
                };

                const ustaId =
                  typeof item.usta === "object"
                    ? item.usta?.id
                    : item.usta || item.usta_details?.id || item.usta_id;

                const matchedUsta = allUstalar.find(
                  (u) => String(u.id) === String(ustaId)
                );

                const ustaIsm =
                  item.usta_details?.ism ||
                  (item.usta_details?.first_name && item.usta_details?.last_name
                    ? `${item.usta_details.first_name} ${item.usta_details.last_name}`
                    : item.usta_details?.first_name) ||
                  item.usta_details?.username ||
                  matchedUsta?.ism ||
                  item.usta_name ||
                  item.usta_full_name ||
                  (typeof item.usta === "string" ? item.usta : null) ||
                  "Noma'lum usta";

                const ustaRasm =
                  getImageUrl(
                    item.usta_details?.rasm || item.usta_details?.profile?.rasm
                  ) ||
                  matchedUsta?.rasm ||
                  DEFAULT_AVATAR;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-soft transition-all hover:shadow-lift"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-semibold text-muted-foreground">
                            Xizmat turi
                          </span>
                          <h3 className="font-bold text-foreground">
                            {item.xizmat_turi ||
                              item.xizmat ||
                              "Xizmat ko'rsatilgan"}
                          </h3>
                        </div>
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>
                      </div>

                      <div className="space-y-1.5 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2 font-medium text-foreground">
                          <UserCheck className="size-4 text-primary shrink-0" />
                          <span>
                            Usta:{" "}
                            <strong className="text-foreground">{ustaIsm}</strong>
                          </span>
                        </p>

                        {item.sana && (
                          <p className="flex items-center gap-2">
                            <Calendar className="size-4" />
                            Sana: {item.sana}
                          </p>
                        )}
                        {item.vaqt && (
                          <p className="flex items-center gap-2">
                            <Clock className="size-4" />
                            Vaqt: {item.vaqt}
                          </p>
                        )}
                        {item.manzil && (
                          <p className="flex items-center gap-2 truncate">
                            <MapPin className="size-4 shrink-0" />
                            Manzil: {item.manzil}
                          </p>
                        )}
                      </div>

                      {item.izoh && (
                        <p className="rounded-xl bg-muted/50 p-3 text-xs italic text-muted-foreground">
                          "{item.izoh}"
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3">
                      {ustaId ? (
                        <Button
                          asChild
                          variant="secondary"
                          size="sm"
                          className="rounded-xl gap-1.5 text-xs font-semibold"
                        >
                          <Link
                            to="/xabarlar"
                            search={{
                              ustaId: String(ustaId),
                              ism: ustaIsm,
                              rasm: ustaRasm,
                            }}
                          >
                            <MessageSquare className="size-3.5 text-primary" />
                            Usta bilan muloqot
                          </Link>
                        </Button>
                      ) : (
                        <div />
                      )}

                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={cancelingId === item.id}
                        onClick={() => handleBekorQilish(item.id)}
                        className="rounded-xl gap-1.5 text-xs"
                      >
                        <XCircle className="size-3.5" />
                        {cancelingId === item.id
                          ? "O'chirilmoqda..."
                          : "Bekor qilish"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-3 rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
            <p>Sizda hali hech qanday buyurtma mavjud emas.</p>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/ustalar">Usta topish va buyurtma berish</Link>
            </Button>
          </div>
        )}
      </section>

      {/* SAQLANGAN USTALAR BO'LIMI */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Saqlangan ustalar ({saqlanganUstalar.length})
          </h2>
        </div>

        {saqlanganUstalar.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {saqlanganUstalar.map((u) => (
              <UstaCard key={u.id} usta={u} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
            Siz hali hech qaysi ustani saqlamagansiz. Ustalar ro'yxatidagi yurakcha
            tugmasini bosing.
          </div>
        )}
      </section>
    </DashboardShell>
  );
}