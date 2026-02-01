import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, Info, Lightbulb, AlertTriangle } from "lucide-react";

type CalloutType = "info" | "warning" | "tip" | "danger";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}

const calloutStyles: Record<CalloutType, { icon: typeof Info; className: string }> = {
  info: {
    icon: Info,
    className: "bg-callout-info border-callout-info-border text-callout-info-foreground",
  },
  warning: {
    icon: AlertTriangle,
    className: "bg-callout-warning border-callout-warning-border text-callout-warning-foreground",
  },
  tip: {
    icon: Lightbulb,
    className: "bg-callout-tip border-callout-tip-border text-callout-tip-foreground",
  },
  danger: {
    icon: AlertCircle,
    className: "bg-callout-danger border-callout-danger-border text-callout-danger-foreground",
  },
};

export function Callout({ type = "info", title, children }: CalloutProps) {
  const { icon: Icon, className } = calloutStyles[type];

  return (
    <div className={cn("p-4 rounded-lg border-l-4 my-6", className)}>
      <div className="flex gap-3">
        <Icon className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          {title && <p className="font-semibold mb-1">{title}</p>}
          <div className="text-sm leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}
