import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileWarning,
  Users,
  Bell,
  TrendingUp,
  ArrowRight,
  Shield,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch user profile
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user?.id || "")
    .single();

  // Fetch stats (with fallbacks for when tables don't exist yet)
  let totalReports = 0;
  let flaggedAccounts = 0;
  let unreadNotifications = 0;

  try {
    const { count: reportsCount } = await supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("reporter_id", user?.id || "");
    totalReports = reportsCount || 0;
  } catch {
    // Table doesn't exist yet
  }

  try {
    const { count: accountsCount } = await supabase
      .from("accounts")
      .select("*", { count: "exact", head: true });
    flaggedAccounts = accountsCount || 0;
  } catch {
    // Table doesn't exist yet
  }

  try {
    const { count: notificationsCount } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user?.id || "")
      .eq("read", false);
    unreadNotifications = notificationsCount || 0;
  } catch {
    // Table doesn't exist yet
  }

  const stats = [
    {
      name: "Your Reports",
      value: totalReports,
      icon: FileWarning,
      color: "text-blue-500",
    },
    {
      name: "Flagged Accounts",
      value: flaggedAccounts,
      icon: Users,
      color: "text-orange-500",
    },
    {
      name: "Unread Alerts",
      value: unreadNotifications,
      icon: Bell,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          Welcome back, {profile?.display_name || "there"}!
        </h1>
        <p className="text-muted-foreground">
          Help keep the community safe by reporting abusive accounts.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.name} className="bg-card/50">
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
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileWarning className="w-5 h-5 text-primary" />
              Submit a Report
            </CardTitle>
            <CardDescription>
              Report an abusive account on Instagram or X. Your identity stays
              anonymous.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/report">
              <Button className="w-full sm:w-auto">
                Create New Report <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              Community Activity
            </CardTitle>
            <CardDescription>
              View flagged accounts reported by the community.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/accounts">
              <Button variant="outline" className="w-full sm:w-auto">
                View Flagged Accounts <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Your Identity is Protected</h3>
              <p className="text-sm text-muted-foreground">
                All reports you submit are completely anonymous. Your name,
                email, and personal information are never shared with anyone—not
                even the reported account or our moderators. We only display
                aggregated data to protect the community.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="secondary">🔒 Encrypted</Badge>
                <Badge variant="secondary">👤 Anonymous</Badge>
                <Badge variant="secondary">✅ Verified by Moderators</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
