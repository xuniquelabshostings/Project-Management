import React from "react";
import { Badge } from "@/components/ui/badge";
import { ProjectStatus } from "@/types/database.types";

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export function ProjectStatusBadge({ status, className }: ProjectStatusBadgeProps) {
  const getConfig = (st: ProjectStatus) => {
    switch (st) {
      case "active":
        return { label: "Active", variant: "success" as const };
      case "planning":
        return { label: "Planning", variant: "info" as const };
      case "on_hold":
        return { label: "On Hold", variant: "warning" as const };
      case "completed":
        return { label: "Completed", variant: "default" as const };
      case "cancelled":
        return { label: "Cancelled", variant: "danger" as const };
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
