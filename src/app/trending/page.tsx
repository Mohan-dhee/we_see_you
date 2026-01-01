"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrendingCard } from "@/components/ui/trending-card";
import { SafetyTier } from "@/components/ui/safety-badge";

interface TrendingAccount {
  id: string;
  platform: "instagram" | "x";
  handle: string;
  flag_count: number;
  safety_tier: SafetyTier;
  trend_direction?: "up" | "down" | "stable";
  recent_reports?: number;
}

export default function TrendingPage() {
  const [accounts, setAccounts] = useState<TrendingAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<"24h" | "7d" | "30d">("7d");

  useEffect(() => {
    const fetchTrending = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/trending?period=${period}`);
        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }
        const data = await res.json();

        setAccounts(data.data ?? []);
      } catch (error) {
        console.error("Failed to fetch trending:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrending();
  }, [period]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            <span className="font-semibold hidden sm:inline">We See You</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/search">
              <Button variant="ghost" size="sm">
                Search
              </Button>
            </Link>
            <Link href="/feed">
              <Button variant="ghost" size="sm">
                Feed
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Trending Alerts</h1>
            <p className="text-muted-foreground">
              Top flagged accounts this week
            </p>
          </div>

          <div className="flex gap-1 bg-secondary/50 p-1 rounded-lg">
            {(["24h", "7d", "30d"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  period === p
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4">
            {accounts.map((account, index) => (
              <TrendingCard
                key={account.id}
                account={account}
                rank={index + 1}
              />
            ))}

            {accounts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No reports found for this period.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
