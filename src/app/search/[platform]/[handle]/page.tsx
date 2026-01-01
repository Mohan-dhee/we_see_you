import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Instagram,
  Twitter,
  ExternalLink,
  ArrowLeft,
  Flag,
  Calendar,
  Clock,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  SafetyBadge,
  SafetyScoreDisplay,
  type SafetyTier,
} from "@/components/ui/safety-badge";
import { formatDistanceToNow, format } from "date-fns";

interface PageProps {
  params: Promise<{
    platform: string;
    handle: string;
  }>;
}

const categoryLabels: Record<string, { label: string; color: string }> = {
  non_consensual_nudity: {
    label: "Non-consensual Nudity",
    color: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  sexual_harassment: {
    label: "Sexual Harassment",
    color: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  hate_speech: {
    label: "Hate Speech",
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  },
  threats: {
    label: "Threats",
    color: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  graphic_violence: {
    label: "Graphic Violence",
    color: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  other: {
    label: "Other",
    color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  },
};

export default async function AccountDetailPage({ params }: PageProps) {
  const { platform, handle } = await params;

  // Validate platform
  if (platform !== "instagram" && platform !== "x") {
    notFound();
  }

  const supabase = await createClient();

  // Fetch account by platform and handle
  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("*")
    .eq("platform", platform)
    .ilike("handle", handle)
    .single();

  if (accountError || !account) {
    // Account not found - show "clean" page
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-12">
          <Link
            href="/search"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Search
          </Link>

          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <div
                className={`p-4 rounded-2xl ${
                  platform === "instagram"
                    ? "bg-pink-500/10 text-pink-500"
                    : "bg-blue-500/10 text-blue-500"
                }`}
              >
                {platform === "instagram" ? (
                  <Instagram className="w-10 h-10" />
                ) : (
                  <Twitter className="w-10 h-10" />
                )}
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-2">@{handle}</h1>
            <p className="text-muted-foreground mb-8 capitalize">{platform}</p>

            <Card className="bg-emerald-500/10 border-emerald-500/20 max-w-md mx-auto">
              <CardContent className="py-8">
                <div className="text-5xl mb-4">🟢</div>
                <h2 className="text-xl font-semibold mb-2">No Reports Found</h2>
                <p className="text-muted-foreground">
                  This account has not been reported by our community.
                </p>
              </CardContent>
            </Card>

            <div className="mt-8">
              <p className="text-sm text-muted-foreground mb-4">
                Know something about this account?
              </p>
              <Link href="/login">
                <Button>
                  Sign in to Report
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Fetch report category breakdown
  const { data: reports } = await supabase
    .from("reports")
    .select("category")
    .eq("account_id", account.id);

  // Calculate category breakdown
  const categoryBreakdown: Record<string, number> = {};
  if (reports) {
    reports.forEach((report) => {
      categoryBreakdown[report.category] =
        (categoryBreakdown[report.category] || 0) + 1;
    });
  }

  const safetyScore = account.safety_score ?? 100;
  const safetyTier = (account.safety_tier ?? "clean") as SafetyTier;

  const platformConfig = {
    instagram: {
      icon: Instagram,
      color: "bg-pink-500/10 text-pink-500",
      url: `https://instagram.com/${account.handle}`,
    },
    x: {
      icon: Twitter,
      color: "bg-blue-500/10 text-blue-500",
      url: `https://x.com/${account.handle}`,
    },
  };

  const { icon: PlatformIcon, color, url } = platformConfig[platform];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Back Link */}
        <Link
          href="/search"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </Link>

        {/* Account Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          <div className={`p-5 rounded-2xl ${color}`}>
            <PlatformIcon className="w-12 h-12" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-3xl font-bold">@{account.handle}</h1>
              <SafetyBadge tier={safetyTier} size="lg" />
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="capitalize">{platform}</span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                View Profile
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Privacy Banner */}
        <Card className="bg-secondary/30 border-secondary mb-8">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Privacy Protected:</strong>{" "}
                Reporter identities are never revealed. Only aggregated data is
                shown.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Safety Score Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Safety Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SafetyScoreDisplay
                score={safetyScore}
                tier={safetyTier}
                showDescription
              />
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="w-5 h-5" />
                Report Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Reports</span>
                <span className="font-semibold text-lg">
                  {account.flag_count}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium capitalize">{account.status}</span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2" />
                <div>
                  <p className="text-sm font-medium">First Reported</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(account.first_flagged_at), "PPP")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-foreground mt-2" />
                <div>
                  <p className="text-sm font-medium">Latest Report</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(account.last_flagged_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories Card */}
          <Card>
            <CardHeader>
              <CardTitle>Report Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(categoryBreakdown).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(categoryBreakdown)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, count]) => {
                      const config = categoryLabels[category] || {
                        label: category,
                        color:
                          "bg-gray-500/10 text-gray-500 border-gray-500/20",
                      };
                      return (
                        <div
                          key={category}
                          className="flex items-center justify-between"
                        >
                          <span
                            className={`px-2 py-1 rounded-md text-sm border ${config.color}`}
                          >
                            {config.label}
                          </span>
                          <span className="font-medium">{count}</span>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No category data available
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Report CTA */}
        <Card className="mt-8 bg-gradient-to-br from-secondary/50 to-secondary/30 border-secondary">
          <CardContent className="py-8 text-center">
            <h3 className="font-semibold text-lg mb-2">
              Have More Information?
            </h3>
            <p className="text-muted-foreground mb-4">
              Sign in to submit a report and help protect the community.
            </p>
            <Link href="/login">
              <Button>
                Sign in to Report
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="w-6 h-6" />
          <span className="font-semibold">We See You</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/search">
            <Button variant="ghost" size="sm">
              Search
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
