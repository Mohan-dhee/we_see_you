"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Instagram,
  Twitter,
  AlertTriangle,
  Users,
  Download,
  FileJson,
  FileType,
} from "lucide-react";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .order("flag_count", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Failed to load accounts:", error);
        return;
      }

      if (data) setAccounts(data);
    };
    fetchData();
  }, []);

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

  const handleExport = (format: "csv" | "json") => {
    window.location.href = `/api/blocklist/export?format=${format}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Flagged Accounts</h1>
          <p className="text-muted-foreground">
            Accounts reported by the community. When an account receives 3+
            reports, the community is alerted.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("csv")}
          >
            <FileType className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("json")}
          >
            <FileJson className="w-4 h-4 mr-2" />
            JSON
          </Button>
        </div>
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
