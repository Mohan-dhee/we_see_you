"use client";

import Link from "next/link";
import { TrendingUp, Users } from "lucide-react";
import { Card, CardContent } from "./card";
import { SafetyBadge, SafetyTier } from "./safety-badge";
import { cn } from "@/lib/utils";

interface TrendingCardProps {
  account: {
    id: string;
    platform: "instagram" | "x";
    handle: string;
    flag_count: number;
    safety_tier: SafetyTier;
    trend_direction?: "up" | "down" | "stable";
    recent_reports?: number;
  };
  rank: number;
}

export function TrendingCard({ account, rank }: TrendingCardProps) {
  return (
    <Link href={`/search/${account.platform}/${account.handle}`}>
      <Card className="hover:bg-secondary/40 transition-colors group">
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-sm font-bold text-muted-foreground group-hover:bg-background transition-colors">
              {rank}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">@{account.handle}</span>
                <SafetyBadge tier={account.safety_tier} size="sm" />
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="capitalize">{account.platform}</span>
                {account.recent_reports && (
                  <span className="flex items-center gap-1 text-red-500">
                    <TrendingUp className="w-3 h-3" />
                    {account.recent_reports} new reports
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-bold">{account.flag_count}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
