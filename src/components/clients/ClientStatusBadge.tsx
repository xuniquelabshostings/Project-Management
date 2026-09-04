import React from "react";
import { Badge } from "@/components/ui/badge";
import { ClientStatus } from "@/types/database.types";

interface ClientStatusBadgeProps {
  status: ClientStatus;
  className?: string;
}

export function ClientStatusBadge({ status, className }: ClientStatusBadgeProps) {
  const getBadgeConfig = (st: ClientStatus) => {
    switch (st) {
      case "active":
        return { label: "Active", variant: "success" as const };
      case "negotiation":
        return { label: "Negotiation", variant: "warning" as const };
      case "lead":
        return { label: "Lead", variant: "info" as const };
      case "on_hold":
        return { label: "On Hold", variant: "warning" as const };
      case "churned":
        return { label: "Past / Churned", variant: "danger" as const };
      default:
        return { label: st, variant: "secondary" as const };
    }
  };

  const { label, variant } = getBadgeConfig(status);

  return (
    <Badge variant={variant} className={className}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 mr-1" />
      {label}
    </Badge>
  );
}
