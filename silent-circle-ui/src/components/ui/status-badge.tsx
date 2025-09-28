import { cn } from "@/lib/utils";
import { CheckCircle, Clock, AlertCircle, Shield } from "lucide-react";

interface StatusBadgeProps {
  status: "contributed" | "pending" | "overdue" | "trusted" | "active" | "completed" | "failed";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const configs = {
    contributed: {
      icon: CheckCircle,
      label: "Contributed ✓",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    pending: {
      icon: Clock,
      label: "Pending",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    overdue: {
      icon: AlertCircle,
      label: "Overdue",
      className: "bg-red-100 text-red-800 border-red-200",
    },
    trusted: {
      icon: Shield,
      label: "Trusted Contributor",
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    active: {
      icon: CheckCircle,
      label: "Active",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    completed: {
      icon: CheckCircle,
      label: "Completed",
      className: "bg-gray-100 text-gray-800 border-gray-200",
    },
    failed: {
      icon: AlertCircle,
      label: "Failed",
      className: "bg-red-100 text-red-800 border-red-200",
    },
  };

  const config = configs[status];
  
  // Fallback if status is not found
  if (!config) {
    console.warn(`Unknown status: ${status}`);
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        "bg-gray-100 text-gray-800 border-gray-200",
        className
      )}>
        <Clock className="h-3 w-3" />
        {status}
      </div>
    );
  }
  
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