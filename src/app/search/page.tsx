"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Search, Shield, AlertTriangle, ChevronRight } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { AccountCard, AccountCardSkeleton } from "@/components/ui/account-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SafetyTier } from "@/components/ui/safety-badge";

interface AccountResult {
  id: string;
  platform: "instagram" | "x";
  handle: string;
  flag_count: number;
  safety_score: number;
  safety_tier: SafetyTier;
  status: string;
  first_flagged_at: string;
  last_flagged_at: string;
}

interface SearchResponse {
  results: AccountResult[];
  count: number;
  query: {
    handle: string;
    platform: string;
  };
}

export default function SearchPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AccountResult[] | null>(null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(
    async (handle: string, platform: "instagram" | "x" | "all") => {
      setIsLoading(true);
      setError(null);
      setSearchQuery(handle);

      try {
        const params = new URLSearchParams({ handle });
        if (platform !== "all") {
          params.append("platform", platform);
        }

        const response = await fetch(`/api/search?${params.toString()}`);
        const data: SearchResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.query?.handle || "Search failed");
        }

        setResults(data.results);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            <span className="font-semibold">We See You</span>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-sm text-muted-foreground mb-4">
            <Search className="w-4 h-4" />
            Check Before You Interact
          </div>
          <h1 className="display-lg mb-4">Is this account safe?</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Search for any Instagram or X account to check if it has been
            reported for abusive behavior by our community.
          </p>
        </div>

        {/* Search Input */}
        <div className="max-w-2xl mx-auto mb-8">
          <SearchInput
            onSearch={handleSearch}
            isLoading={isLoading}
            placeholder="Enter username (e.g. @example)"
          />
        </div>

        {/* Info Banner */}
        <Card className="max-w-2xl mx-auto mb-8 bg-secondary/30 border-secondary">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <strong className="text-foreground">Privacy Note:</strong> We
                never reveal who reported an account. Only aggregated safety
                data is shown.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="max-w-2xl mx-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="space-y-3">
              <AccountCardSkeleton />
              <AccountCardSkeleton />
              <AccountCardSkeleton />
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Card className="bg-destructive/10 border-destructive/20">
              <CardContent className="py-6 text-center">
                <p className="text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* No Results */}
          {results && results.length === 0 && !isLoading && (
            <Card className="bg-emerald-500/10 border-emerald-500/20">
              <CardContent className="py-8 text-center">
                <div className="text-4xl mb-3">🟢</div>
                <h3 className="font-semibold text-lg mb-2">No Reports Found</h3>
                <p className="text-muted-foreground mb-4">
                  No one in our community has reported{" "}
                  <strong>@{searchQuery}</strong> yet.
                </p>
                <p className="text-sm text-muted-foreground">
                  This doesn&apos;t guarantee the account is safe - just that it
                  hasn&apos;t been reported here yet.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Results List */}
          {results && results.length > 0 && !isLoading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted-foreground">
                  Found {results.length}{" "}
                  {results.length === 1 ? "result" : "results"} for &quot;
                  {searchQuery}&quot;
                </h2>
              </div>

              <div className="space-y-3">
                {results.map((account) => (
                  <AccountCard
                    key={account.id}
                    id={account.id}
                    platform={account.platform}
                    handle={account.handle}
                    flagCount={account.flag_count}
                    safetyScore={account.safety_score}
                    safetyTier={account.safety_tier}
                    status={account.status}
                    firstFlaggedAt={account.first_flagged_at}
                    lastFlaggedAt={account.last_flagged_at}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Initial State */}
          {results === null && !isLoading && (
            <div className="space-y-6">
              <Card className="bg-card/50">
                <CardContent className="py-8 text-center">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Search for an Account</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter a username above to check if it has been flagged by
                    our community.
                  </p>
                </CardContent>
              </Card>

              {/* How it works */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg border border-border">
                  <div className="text-2xl mb-2">1️⃣</div>
                  <h4 className="font-medium mb-1">Enter Username</h4>
                  <p className="text-sm text-muted-foreground">
                    Type any Instagram or X handle
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-border">
                  <div className="text-2xl mb-2">2️⃣</div>
                  <h4 className="font-medium mb-1">View Safety Score</h4>
                  <p className="text-sm text-muted-foreground">
                    See community-reported data
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-border">
                  <div className="text-2xl mb-2">3️⃣</div>
                  <h4 className="font-medium mb-1">Stay Informed</h4>
                  <p className="text-sm text-muted-foreground">
                    Make safer interaction choices
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTA for non-logged in users */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <Card className="bg-gradient-to-br from-secondary/50 to-secondary/30 border-secondary">
            <CardContent className="py-8">
              <h3 className="font-semibold text-lg mb-2">
                Want to Help the Community?
              </h3>
              <p className="text-muted-foreground mb-4">
                Sign up to report abusive accounts and help others stay safe.
              </p>
              <Link href="/register">
                <Button>
                  Create Free Account
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-5 h-5" />
              <span className="text-sm">
                We See You - Community Safety Platform
              </span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/anonymity" className="hover:text-foreground">
                Anonymity
              </Link>
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
