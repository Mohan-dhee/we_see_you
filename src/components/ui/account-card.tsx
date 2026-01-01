"use client";

import Link from "next/link";
import { Instagram, Twitter, ExternalLink, Clock, Flag } from "lucide-react";
import { Card, CardContent } from "./card";
import { SafetyBadge } from "./safety-badge";
import type { SafetyTier } from "./safety-badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface AccountCardProps {
  id: string;
  platform: "instagram" | "x";
  handle: string;
  flagCount: number;
  safetyScore: number;
  safetyTier: SafetyTier;
  status: string;
  firstFlaggedAt: string;
  lastFlaggedAt: string;
  showLink?: boolean;
  className?: string;
}

export function AccountCard({
  id,
  platform,
  handle,
  flagCount,
  safetyScore,
  safetyTier,
  status,
  firstFlaggedAt,
  lastFlaggedAt,
  showLink = true,
  className,
}: AccountCardProps) {
  const platformConfig = {
    instagram: {
      icon: Instagram,
      color: "bg-pink-500/10 text-pink-500",
      url: `https://instagram.com/${handle}`,
    },
    x: {
      icon: Twitter,
      color: "bg-blue-500/10 text-blue-500",
      url: `https://x.com/${handle}`,
    },
  };

  const { icon: PlatformIcon, color, url } = platformConfig[platform];

  if (showLink) {
    return (
      <Link href={`/search/${platform}/${handle}`}>
        <Card
          className={cn(
            "bg-card/50 hover:bg-card/80 transition-all duration-200 cursor-pointer group",
            "hover:border-muted-foreground/30",
            className
          )}
        >
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Platform & Handle */}
              <div className="flex items-center gap-4 min-w-0">
                {/* Platform Icon */}
                <div className={cn("p-3 rounded-xl flex-shrink-0", color)}>
                  <PlatformIcon className="w-6 h-6" />
                </div>

                {/* Account Info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold truncate">@{handle}</span>
                    <SafetyBadge tier={safetyTier} size="sm" />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Flag className="w-3.5 h-3.5" />
                      {flagCount} {flagCount === 1 ? "report" : "reports"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDistanceToNow(new Date(lastFlaggedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Score & Link */}
              <div className="flex items-center gap-4">
                {/* Safety Score */}
                <div className="text-right hidden sm:block">
                  <div
                    className={cn(
                      "text-2xl font-bold",
                      safetyTier === "clean" && "text-emerald-500",
                      safetyTier === "caution" && "text-yellow-500",
                      safetyTier === "warning" && "text-orange-500",
                      safetyTier === "danger" && "text-red-500"
                    )}
                  >
                    {safetyScore}
                  </div>
                  <p className="text-xs text-muted-foreground">Safety Score</p>
                </div>

                {/* Arrow */}
                <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Card
      className={cn(
        "bg-card/50 hover:bg-card/80 transition-all duration-200 cursor-default group",
        className
      )}
    >
      <CardContent className="py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className={cn("p-3 rounded-xl flex-shrink-0", color)}>
              <PlatformIcon className="w-6 h-6" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold truncate">@{handle}</span>
                <SafetyBadge tier={safetyTier} size="sm" />
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Flag className="w-3.5 h-3.5" />
                  {flagCount} {flagCount === 1 ? "report" : "reports"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDistanceToNow(new Date(lastFlaggedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div
                className={cn(
                  "text-2xl font-bold",
                  safetyTier === "clean" && "text-emerald-500",
                  safetyTier === "caution" && "text-yellow-500",
                  safetyTier === "warning" && "text-orange-500",
                  safetyTier === "danger" && "text-red-500"
                )}
              >
                {safetyScore}
              </div>
              <p className="text-xs text-muted-foreground">Safety Score</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface AccountCardSkeletonProps {
  className?: string;
}

export function AccountCardSkeleton({ className }: AccountCardSkeletonProps) {
  return (
    <Card className={cn("bg-card/50", className)}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-32 bg-secondary rounded animate-pulse" />
              <div className="h-4 w-24 bg-secondary rounded animate-pulse" />
            </div>
          </div>
          <div className="h-8 w-16 bg-secondary rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
