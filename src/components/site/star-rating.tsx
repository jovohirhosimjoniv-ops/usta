import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function StarRating({
  qiymat,
  size = "sm",
  className,
}: {
  qiymat: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const olcham = size === "sm" ? "size-3.5" : "size-5";
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`Reyting ${qiymat}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            olcham,
            n <= Math.round(qiymat) ? "fill-warning text-warning" : "text-muted-foreground/40",
          )}
        />
      ))}
    </span>
  );
}