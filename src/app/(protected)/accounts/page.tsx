import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Instagram, Twitter, AlertTriangle, Users } from "lucide-react";

export default async function AccountsPage() {
  const supabase = await createClient();

  // Fetch flagged accounts
  const { data: accounts } = await supabase
    .from("accounts")
    .select("*")
    .order("flag_count", { ascending: false })
    .limit(50);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "non_consensual_nudity":
      case "sexual_harassment":
        return "destructive";
      case "threats":
      case "graphic_violence":
        return "destructive";
      case "hate_speech":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "destructive";
      case "reviewing":
        return "warning";
      case "cleared":
        return "success";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Flagged Accounts</h1>
        <p className="text-muted-foreground">
          Accounts reported by the community. When an account receives 3+
          reports, the community is alerted.
        </p>
      </div>

      {/* Info Banner */}
      <Card className="bg-secondary/50 border-secondary">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <p className="text-sm text-muted-foreground">
              Reporter identities are never shown. Only aggregated data is
              displayed.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Accounts List */}
      {!accounts || accounts.length === 0 ? (
        <Card className="bg-card/50">
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Flagged Accounts Yet</h3>
            <p className="text-sm text-muted-foreground">
              When accounts are reported, they will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {accounts.map((account) => (
            <Card
              key={account.id}
              className="bg-card/50 hover:bg-card/80 transition-colors"
            >
              <CardContent className="py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Platform Icon */}
                    <div
                      className={`p-3 rounded-xl ${
                        account.platform === "instagram"
                          ? "bg-pink-500/10 text-pink-500"
                          : "bg-blue-500/10 text-blue-500"
                      }`}
                    >
                      {account.platform === "instagram" ? (
                        <Instagram className="w-6 h-6" />
                      ) : (
                        <Twitter className="w-6 h-6" />
                      )}
                    </div>

                    {/* Account Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">@{account.handle}</span>
                        <Badge
                          variant={getStatusColor(account.status) as "default"}
                        >
                          {account.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        First reported:{" "}
                        {new Date(
                          account.first_flagged_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Flag Count */}
                  <div className="text-right">
                    <div
                      className={`text-2xl font-bold ${
                        account.flag_count >= 3
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      {account.flag_count}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {account.flag_count === 1 ? "report" : "reports"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
