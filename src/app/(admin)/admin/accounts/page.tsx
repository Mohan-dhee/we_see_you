"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Instagram,
  Twitter,
  Users,
  Filter,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface Account {
  id: string;
  platform: string;
  handle: string;
  profile_url: string | null;
  flag_count: number;
  status: string;
  first_flagged_at: string;
  last_flagged_at: string;
  moderator_notes: string | null;
}

export default function AdminAccountsPage() {
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState(
    searchParams.get("platform") || "all"
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all"
  );

  useEffect(() => {
    const fetchAccounts = async () => {
      setIsLoading(true);
      const supabase = createClient();

      let query = supabase
        .from("accounts")
        .select("*")
        .order("flag_count", { ascending: false });

      if (platformFilter !== "all") {
        query = query.eq("platform", platformFilter);
      }

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching accounts:", error);
        setAccounts([]);
        setIsLoading(false);
        return;
      }

      setAccounts((data as Account[]) || []);
      setIsLoading(false);
    };

    fetchAccounts();
  }, [platformFilter, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "destructive";
      case "reviewing":
        return "warning";
      case "cleared":
        return "success";
      case "escalated":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const statuses = [
    { value: "all", label: "All Statuses" },
    { value: "open", label: "Open" },
    { value: "reviewing", label: "Reviewing" },
    { value: "verified", label: "Verified" },
    { value: "cleared", label: "Cleared" },
    { value: "escalated", label: "Escalated" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Flagged Accounts</h1>
        <p className="text-muted-foreground">
          Manage and review accounts reported by the community.
        </p>
      </div>

      {/* Filters */}
      <Card className="bg-card/50">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="x">X (Twitter)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(platformFilter !== "all" || statusFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPlatformFilter("all");
                  setStatusFilter("all");
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Accounts List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : accounts.length === 0 ? (
        <Card className="bg-card/50">
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Accounts Found</h3>
            <p className="text-sm text-muted-foreground">
              {platformFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters."
                : "No accounts have been flagged yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
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
                        <Instagram className="w-5 h-5" />
                      ) : (
                        <Twitter className="w-5 h-5" />
                      )}
                    </div>

                    {/* Account Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">@{account.handle}</span>
                        <Badge
                          variant={getStatusColor(account.status) as "default"}
                        >
                          {account.status}
                        </Badge>
                        {account.flag_count >= 3 && (
                          <Badge variant="destructive" className="text-xs">
                            High Priority
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        First reported:{" "}
                        {new Date(
                          account.first_flagged_at
                        ).toLocaleDateString()}{" "}
                        • Last:{" "}
                        {new Date(account.last_flagged_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="flex items-center gap-4">
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

                    <Link href={`/admin/accounts/${account.id}`}>
                      <Button variant="outline" size="sm">
                        Manage
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
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
