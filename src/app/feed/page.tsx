"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Loader2, ArrowLeft, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedItem, FeedItemData } from "@/components/ui/feed-item";
import { Card, CardContent } from "@/components/ui/card";

export default function FeedPage() {
  const [items, setItems] = useState<FeedItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "instagram" | "x">("all");

  useEffect(() => {
    let active = true;

    const fetchFeed = async () => {
      try {
        const params = new URLSearchParams({ limit: "50" });
        if (filter !== "all") {
          params.append("platform", filter);
        }

        const res = await fetch(`/api/feed?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }
        const data = await res.json();

        if (active && data.data) {
          setItems(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch feed:", error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchFeed();
    // Poll every 30 seconds
    const interval = setInterval(fetchFeed, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [filter]);

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
            <Link href="/trending">
              <Button variant="ghost" size="sm">
                Trending
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Community Alerts</h1>
            <p className="text-muted-foreground">
              Real-time reports from the community
            </p>
          </div>

          {/* Filter Dropdown (Simplified as buttons for now) */}
          <div className="flex gap-1 bg-secondary/50 p-1 rounded-lg">
            {(["all", "instagram", "x"] as const).map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  setIsLoading(true);
                  setItems([]);
                }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === f
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "all" ? "All" : f === "instagram" ? "IG" : "X"}
              </button>
            ))}
          </div>
        </div>

        {isLoading && items.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : items.length > 0 ? (
          <div className="space-y-4">
            {items.map((item) => (
              <FeedItem key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <Card className="bg-secondary/20 border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">
              No recent activity found.
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
