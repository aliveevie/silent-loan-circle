import { cn } from "@/lib/utils";
import { CheckCircle, Clock, AlertCircle, Shield } from "lucide-react";

interface StatusBadgeProps {
  status: "contributed" | "pending" | "overdue" | "trusted";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const configs = {
    contributed: {
      icon: CheckCircle,
      label: "Contributed ✓",
      className: "bg-success/10 text-success border-success/20",
    },
    pending: {
      icon: Clock,
      label: "Pending",
      className: "bg-warning/10 text-warning border-warning/20",
    },
    overdue: {
      icon: AlertCircle,
      label: "Overdue",
      className: "bg-destructive/10 text-destructive border-destructive/20",
    },
    trusted: {
      icon: Shield,
      label: "Trusted Contributor",
      className: "bg-accent/10 text-accent border-accent/20",
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </div>
  );
}