"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  ArrowLeft,
  Loader2,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileWarning,
  Save,
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

interface Report {
  id: string;
  category: string;
  description: string;
  evidence_urls: string[];
  created_at: string;
}

export default function AccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const rawId = params?.id;
      if (typeof rawId !== "string") {
        setIsLoading(false);
        return;
      }
      const accountId = rawId;

      // Fetch account
      const { data: accountData } = await supabase
        .from("accounts")
        .select("*")
        .eq("id", accountId)
        .single();

      if (accountData) {
        setAccount(accountData as Account);
        setNewStatus(accountData.status);
        setNotes(accountData.moderator_notes || "");
      }

      // Fetch reports for this account
      const { data: reportsData } = await supabase
        .from("reports")
        .select("*")
        .eq("account_id", accountId)
        .order("created_at", { ascending: false });

      setReports((reportsData as Report[]) || []);
      setIsLoading(false);
    };

    fetchData();
  }, [params.id]);

  const handleSave = async () => {
    if (!account) return;

    try {
      setIsSaving(true);
      setMessage(null);

      const supabase = createClient();

      const { error } = await supabase
        .from("accounts")
        .update({
          status: newStatus,
          moderator_notes: notes,
        })
        .eq("id", account.id);

      if (error) throw error;

      // Log the action to audit_logs
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("audit_logs").insert({
          user_id: user.id,
          action: "update_account_status",
          target_type: "account",
          target_id: account.id,
          details: {
            old_status: account.status,
            new_status: newStatus,
            notes_updated: notes !== account.moderator_notes,
          },
        });
      }

      setAccount({ ...account, status: newStatus, moderator_notes: notes });
      setMessage({ type: "success", text: "Account updated successfully!" });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to update account" });
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      non_consensual_nudity: "Non-consensual nudity",
      sexual_harassment: "Sexual harassment",
      hate_speech: "Hate speech",
      threats: "Threats",
      graphic_violence: "Graphic violence",
      other: "Other",
    };
    return labels[category] || category;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-red-500" />;
      case "reviewing":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "cleared":
        return <XCircle className="w-4 h-4 text-green-500" />;
      case "escalated":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <FileWarning className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Account Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The requested account could not be found.
        </p>
        <Link href="/admin/accounts">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Accounts
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/admin/accounts"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Accounts
      </Link>

      {/* Account Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`p-4 rounded-xl ${
              account.platform === "instagram"
                ? "bg-pink-500/10 text-pink-500"
                : "bg-blue-500/10 text-blue-500"
            }`}
          >
            {account.platform === "instagram" ? (
              <Instagram className="w-8 h-8" />
            ) : (
              <Twitter className="w-8 h-8" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold">@{account.handle}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="capitalize">
                {account.platform}
              </Badge>
              <Badge
                variant={account.flag_count >= 3 ? "destructive" : "secondary"}
              >
                {account.flag_count}{" "}
                {account.flag_count === 1 ? "report" : "reports"}
              </Badge>
            </div>
          </div>
        </div>

        {account.profile_url && (
          <a
            href={account.profile_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline">
              View Profile
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </a>
        )}
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-500/10 text-green-500"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Status Management */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(newStatus)}
              Account Status
            </CardTitle>
            <CardDescription>
              Update the review status of this account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="verified">Verified Abuser</SelectItem>
                  <SelectItem value="cleared">Cleared</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Moderator Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add internal notes about this account..."
                className="w-full min-h-[120px] p-3 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>

            <div className="pt-4 border-t border-border space-y-2 text-sm text-muted-foreground">
              <p>
                First reported:{" "}
                {new Date(account.first_flagged_at).toLocaleDateString()}
              </p>
              <p>
                Last reported:{" "}
                {new Date(account.last_flagged_at).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Reports for this Account */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileWarning className="w-5 h-5" />
              Reports ({reports.length})
            </CardTitle>
            <CardDescription>
              All reports submitted against this account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No reports found for this account.
              </p>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 rounded-lg border border-border bg-secondary/30"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <Badge variant="secondary">
                          {getCategoryLabel(report.category)}
                        </Badge>
                        {report.description && (
                          <p className="text-sm text-muted-foreground">
                            {report.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(report.created_at).toLocaleDateString()} at{" "}
                          {new Date(report.created_at).toLocaleTimeString()}
                        </p>
                      </div>

                      {report.evidence_urls?.length > 0 && (
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground">
                            {report.evidence_urls.length} file(s)
                          </span>
                          <div className="mt-1 space-y-1">
                            {report.evidence_urls.slice(0, 3).map((url, i) => (
                              <a
                                key={i}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline block"
                              >
                                View evidence {i + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
