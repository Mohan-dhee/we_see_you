"use client";

import { cn } from "@/lib/utils";

type SafetyTier = "clean" | "caution" | "warning" | "danger";

interface SafetyBadgeProps {
  tier: SafetyTier;
  score?: number;
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const tierConfig: Record<
  SafetyTier,
  {
    label: string;
    description: string;
    icon: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
  }
> = {
  clean: {
    label: "Safe",
    description: "No significant reports",
    icon: "🟢",
    bgClass: "bg-emerald-500/10",
    textClass: "text-emerald-600 dark:text-emerald-400",
    borderClass: "border-emerald-500/20",
  },
  caution: {
    label: "Caution",
    description: "Some reports received",
    icon: "🟡",
    bgClass: "bg-yellow-500/10",
    textClass: "text-yellow-600 dark:text-yellow-400",
    borderClass: "border-yellow-500/20",
  },
  warning: {
    label: "Warning",
    description: "Multiple reports",
    icon: "🟠",
    bgClass: "bg-orange-500/10",
    textClass: "text-orange-600 dark:text-orange-400",
    borderClass: "border-orange-500/20",
  },
  danger: {
    label: "Danger",
    description: "Verified abuser",
    icon: "🔴",
    bgClass: "bg-red-500/10",
    textClass: "text-red-600 dark:text-red-400",
    borderClass: "border-red-500/20",
  },
};

export function SafetyBadge({
  tier,
  score,
  showScore = false,
  size = "md",
  className,
}: SafetyBadgeProps) {
  const config = tierConfig[tier];

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-sm gap-1.5",
    lg: "px-4 py-1.5 text-base gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium transition-colors",
        config.bgClass,
        config.textClass,
        config.borderClass,
        sizeClasses[size],
        className
      )}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
      {showScore && score !== undefined && (
        <span className="opacity-70">({score})</span>
      )}
    </span>
  );
}

interface SafetyScoreDisplayProps {
  score: number;
  tier: SafetyTier;
  showDescription?: boolean;
  className?: string;
}

export function SafetyScoreDisplay({
  score,
  tier,
  showDescription = true,
  className,
}: SafetyScoreDisplayProps) {
  const config = tierConfig[tier];

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Safety Score
        </span>
        <SafetyBadge tier={tier} score={score} showScore />
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            tier === "clean" && "bg-emerald-500",
            tier === "caution" && "bg-yellow-500",
            tier === "warning" && "bg-orange-500",
            tier === "danger" && "bg-red-500"
          )}
          style={{ width: `${score}%` }}
        />
      </div>

      {showDescription && (
        <p className="text-xs text-muted-foreground">{config.description}</p>
      )}
    </div>
  );
}

export function getTierFromScore(score: number): SafetyTier {
  if (score >= 90) return "clean";
  if (score >= 70) return "caution";
  if (score >= 40) return "warning";
  return "danger";
}

export { tierConfig };
export type { SafetyTier };
