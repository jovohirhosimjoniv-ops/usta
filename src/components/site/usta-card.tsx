import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BadgeCheck, Briefcase, Heart, MapPin } from "lucide-react";

import { StarRating } from "@/components/site/star-rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KATEGORIYALAR, narxFormat, type Usta } from "@/lib/data";
import {
  CUSTOM_EVENT_NAME,
  FAVORITES_CHANNEL,
  getSavedUstaIds,
  toggleFavoriteUsta,
} from "@/lib/favorites";

export function UstaCard({ usta }: { usta: Usta }) {
  const kategoriya = KATEGORIYALAR.find((k) => k.slug === usta.kategoriyaSlug);
  const [isSaved, setIsSaved] = useState(false);

  // Saqlanganligini favorites.ts orqali o'qish
  const checkSaved = () => {
    const saved = getSavedUstaIds();
    setIsSaved(saved.includes(String(usta.id)));
  };

  useEffect(() => {
    checkSaved();

    // Window hodisasi va BroadcastChannel orqali o'zgarishlarni tinglash
    const handleUpdate = () => checkSaved();
    window.addEventListener(CUSTOM_EVENT_NAME, handleUpdate);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(FAVORITES_CHANNEL);
      channel.onmessage = () => checkSaved();
    } catch (e) {
      console.error(e);
    }

    return () => {
      window.removeEventListener(CUSTOM_EVENT_NAME, handleUpdate);
      channel?.close();
    };
  }, [usta.id]);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // toggleFavoriteUsta barcha saqlash va event yuborish ishlarini bajaradi
    const updated = toggleFavoriteUsta(usta.id);
    setIsSaved(updated.includes(String(usta.id)));
  };

  return (
    <article className="card-hover group relative overflow-hidden rounded-3xl border bg-card shadow-soft">
      <div className="relative">
        <img
          src={usta.rasm}
          alt={`${usta.ism} — ${kategoriya?.nom || ""}`}
          loading="lazy"
          width={400}
          height={300}
          className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          {usta.vip && (
            <Badge className="gradient-accent border-0 text-accent-foreground">VIP</Badge>
          )}
          {usta.yangi && <Badge variant="secondary">Yangi</Badge>}
        </div>

        {/* Yurakcha tugmasi */}
        <Button
          variant="secondary"
          size="icon"
          onClick={toggleSave}
          className={`absolute right-3 top-3 size-9 rounded-full transition-all ${
            isSaved 
              ? "opacity-100 bg-background/90" 
              : "opacity-90 md:opacity-0 md:group-hover:opacity-100 bg-background/80"
          }`}
          aria-label="Saqlash"
        >
          <Heart
            className={`size-4 transition-colors ${
              isSaved ? "fill-red-500 text-red-500" : "text-muted-foreground"
            }`}
          />
        </Button>

        <span className="glass absolute bottom-3 right-3 rounded-full px-3 py-1 text-xs font-semibold">
          {usta.bandlik === "bo'sh" ? "🟢 Bo'sh" : "🟠 Band"}
        </span>
      </div>

      <div className="space-y-3 p-5">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="flex items-center gap-1.5 truncate text-base font-bold">
              {usta.ism}
              <BadgeCheck className="size-4 shrink-0 text-primary" />
            </h3>
            <p className="truncate text-sm text-muted-foreground">
              {kategoriya?.emoji} {kategoriya?.nom}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-sm font-bold">{usta.reyting?.toFixed(1) || "5.0"}</div>
            <StarRating qiymat={usta.reyting || 5} />
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" /> {usta.shahar || usta.viloyat}
          </span>
          <span className="inline-flex items-center gap-1">
            <Briefcase className="size-3.5" /> {usta.tajribaYili} yil tajriba
          </span>
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Narx</p>
            <p className="text-sm font-bold">{narxFormat(usta.narxdan)} dan</p>
          </div>
          <Button asChild size="sm" className="rounded-full">
            <Link to="/ustalar/$ustaId" params={{ ustaId: String(usta.id) }}>
              Profil
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}