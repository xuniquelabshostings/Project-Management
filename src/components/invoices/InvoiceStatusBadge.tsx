import React from "react";
import { Badge } from "@/components/ui/badge";
import { InvoiceStatus } from "@/types/database.types";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  const getConfig = (st: InvoiceStatus) => {
    switch (st) {
      case "paid":
        return { label: "Paid", variant: "success" as const };
      case "sent":
        return { label: "Sent", variant: "info" as const };
      case "draft":
        return { label: "Draft", variant: "secondary" as const };
      case "overdue":
        return { label: "Overdue", variant: "danger" as const };
      default:
        return { label: st, variant: "secondary" as const };
    }
  };

  const { label, variant } = getConfig(status);

  return (
    <Badge variant={variant} className={className}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 mr-1" />
      {label}
    </Badge>
  );
}
