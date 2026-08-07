import type { OrderStatus } from "@/features/admin/lib/types";
import { AlertCircle } from "lucide-react";

interface FulfillmentBadgeProps {
  status: OrderStatus;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    dotColor: string;
    borderColor: string;
    bgColor: string;
    textColor: string;
  }
> = {
  // Every admin query filters Draft out, so this only exists to keep the map
  // total — a Draft on screen would mean a placement crashed mid-flight.
  Draft: {
    label: "Draft",
    dotColor: "border border-muted-foreground",
    borderColor: "border-border border-dashed",
    bgColor: "bg-muted",
    textColor: "text-muted-foreground",
  },
  Pending: {
    label: "Pending",
    dotColor: "border border-foreground",
    borderColor: "border-border",
    bgColor: "bg-muted",
    textColor: "text-muted-foreground",
  },
  Confirmed: {
    label: "Confirmed",
    dotColor: "bg-foreground",
    borderColor: "border-border",
    bgColor: "bg-accent",
    textColor: "text-foreground",
  },
  Shipped: {
    label: "Shipped",
    dotColor: "bg-foreground",
    borderColor: "border-border",
    bgColor: "bg-accent",
    textColor: "text-foreground",
  },
  Delivered: {
    label: "Delivered",
    dotColor: "bg-foreground",
    borderColor: "border-border",
    bgColor: "bg-accent",
    textColor: "text-foreground",
  },
  Cancelled: {
    label: "Cancelled",
    dotColor: "border border-foreground",
    borderColor: "border-destructive/30",
    bgColor: "bg-destructive/20",
    textColor: "text-destructive",
  },
};

export default function FulfillmentBadge({ status }: FulfillmentBadgeProps) {
  const config = STATUS_CONFIG[status];
  const isCancelled = status === "Cancelled";

  return (
    <div
      className={`inline-flex items-center gap-2 border ${config.borderColor} px-3 py-1 ${config.bgColor}`}
    >
      {!isCancelled ? (
        <div className={`size-2 shrink-0 rounded-full ${config.dotColor}`} />
      ) : (
        <AlertCircle className="text-destructive size-3.5 shrink-0" />
      )}
      <span
        className={`text-[12px] leading-none font-semibold tracking-widest uppercase ${config.textColor}`}
      >
        {config.label}
      </span>
    </div>
  );
}
