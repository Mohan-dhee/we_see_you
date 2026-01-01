import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  FileWarning,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch stats
  const { count: totalReports } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true });

  const { count: flaggedAccounts } = await supabase
    .from("accounts")
    .select("*", { count: "exact", head: true });

  const { count: reviewingAccounts } = await supabase
    .from("accounts")
    .select("*", { count: "exact", head: true })
    .eq("status", "reviewing");

  const { count: verifiedAccounts } = await supabase
    .from("accounts")
    .select("*", { count: "exact", head: true })
    .eq("status", "verified");

  // Fetch recent reports with account info
  const { data: recentReports } = await supabase
    .from("reports")
    .select("*, accounts(handle, platform)")
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch high-priority accounts (3+ flags)
  const { data: highPriorityAccounts } = await supabase
    .from("accounts")
    .select("*")
    .gte("flag_count", 3)
    .order("flag_count", { ascending: false })
    .limit(5);

  const stats = [
    {
      name: "Total Reports",
      value: totalReports || 0,
      icon: FileWarning,
      color: "text-blue-500",
      href: "/admin/reports",
    },
    {
      name: "Flagged Accounts",
      value: flaggedAccounts || 0,
      icon: Users,
      color: "text-orange-500",
      href: "/admin/accounts",
    },
    {
      name: "Under Review",
      value: reviewingAccounts || 0,
      icon: Clock,
      color: "text-yellow-500",
      href: "/admin/accounts?status=reviewing",
    },
    {
      name: "Verified Abusers",
      value: verifiedAccounts || 0,
      icon: CheckCircle,
      color: "text-red-500",
      href: "/admin/accounts?status=verified",
    },
  ];

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      non_consensual_nudity: "NCII",
      sexual_harassment: "Harassment",
      hate_speech: "Hate Speech",
      threats: "Threats",
      graphic_violence: "Violence",
      other: "Other",
    };
    return labels[category] || category;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Moderator Dashboard</h1>
        <p className="text-muted-foreground">
          Review reports and manage flagged accounts.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href}>
            <Card className="bg-card/50 hover:bg-card/80 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.name}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-secondary ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Reports */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileWarning className="w-5 h-5" />
              Recent Reports
            </CardTitle>
            <Link
              href="/admin/reports"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {!recentReports || recentReports.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No reports yet
              </p>
            ) : (
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          @
                          {(report.accounts as { handle: string })?.handle ||
                            "Unknown"}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {(report.accounts as { platform: string })?.platform}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {getCategoryLabel(report.category)}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* High Priority Accounts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              High Priority Accounts
            </CardTitle>
            <Link
              href="/admin/accounts"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {!highPriorityAccounts || highPriorityAccounts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No high-priority accounts
              </p>
            ) : (
              <div className="space-y-3">
                {highPriorityAccounts.map((account) => (
                  <Link
                    key={account.id}
                    href={`/admin/accounts/${account.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            @{account.handle}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {account.platform}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground capitalize">
                          Status: {account.status}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-destructive">
                        {account.flag_count}
                      </span>
                      <p className="text-xs text-muted-foreground">flags</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
