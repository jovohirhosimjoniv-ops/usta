import { Badge } from "@/components/ui/badge";
import type { BuyurtmaStatus } from "@/lib/data";
import { cn } from "@/lib/utils";

const USLUB: Record<BuyurtmaStatus, string> = {
  kutilmoqda: "bg-warning/15 text-warning",
  "qabul qilindi": "bg-primary/15 text-primary",
  jarayonda: "bg-primary/15 text-primary",
  tugallandi: "bg-success/15 text-success",
  "bekor qilindi": "bg-destructive/15 text-destructive",
};

export function StatusBadge({ status }: { status: BuyurtmaStatus }) {
  return (
    <Badge variant="secondary" className={cn("rounded-full border-0 capitalize", USLUB[status])}>
      {status}
    </Badge>
  );
}
