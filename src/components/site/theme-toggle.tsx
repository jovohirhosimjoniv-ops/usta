import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saqlangan = localStorage.getItem("ustatop-theme");
    const tungi = saqlangan
      ? saqlangan === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(tungi);
    document.documentElement.classList.toggle("dark", tungi);
  }, []);

  function almashtir() {
    const yangi = !dark;
    setDark(yangi);
    document.documentElement.classList.toggle("dark", yangi);
    localStorage.setItem("ustatop-theme", yangi ? "dark" : "light");
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={almashtir}
      aria-label="Mavzuni almashtirish"
      className="rounded-full"
    >
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  );
}