import { Link } from "@tanstack/react-router";
import { Hammer, Mail, MapPin, Phone, Send } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 lg:px-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="gradient-hero grid size-9 place-items-center rounded-xl text-primary-foreground">
              <Hammer className="size-5" />
            </span>
            <span className="font-display text-lg font-extrabold">
              Usta<span className="text-primary">Top</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            O'zbekistondagi ishonchli ustalar va mijozlarni bog'lovchi platforma.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold">Platforma</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/ustalar" className="hover:text-foreground">Ustalar</Link></li>
            <li><Link to="/kategoriyalar" className="hover:text-foreground">Kategoriyalar</Link></li>
            <li><Link to="/usta-panel" className="hover:text-foreground">Usta paneli</Link></li>
            <li><Link to="/admin" className="hover:text-foreground">Admin panel</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold">Aloqa</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Phone className="size-4" /> +998 71 200 00 00</li>
            <li className="flex items-center gap-2"><Mail className="size-4" /> info@ustatop.uz</li>
            <li className="flex items-center gap-2"><MapPin className="size-4" /> Toshkent, Amir Temur ko'chasi 12</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold">Ijtimoiy tarmoqlar</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Send className="size-4" /> Telegram: @ustatop</li>
            <li className="flex items-center gap-2">📷 Instagram: @ustatop.uz</li>
          </ul>
        </div>
      </div>
      <div className="border-t py-5 text-center text-xs text-muted-foreground">
        © 2026 UstaTop Uzbekistan. Barcha huquqlar himoyalangan.
      </div>
    </footer>
  );
}
