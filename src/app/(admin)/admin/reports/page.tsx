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
  FileWarning,
  Filter,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface Report {
  id: string;
  category: string;
  description: string;
  evidence_urls: string[];
  created_at: string;
  accounts: {
    id: string;
    handle: string;
    platform: string;
    flag_count: number;
    status: string;
  };
}

export default function AdminReportsPage() {
  const searchParams = useSearchParams();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState(
    searchParams.get("platform") || "all"
  );
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get("category") || "all"
  );

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      const supabase = createClient();

      let query = supabase
        .from("reports")
        .select("*, accounts(*)")
        .order("created_at", { ascending: false });

      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }

      const { data } = await query;

      let filteredData = data || [];

      // Filter by platform (from related accounts)
      if (platformFilter !== "all") {
        filteredData = filteredData.filter(
          (report) =>
            (report.accounts as Report["accounts"])?.platform === platformFilter
        );
      }

      setReports(filteredData as Report[]);
      setIsLoading(false);
    };

    fetchReports();
  }, [platformFilter, categoryFilter]);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      non_consensual_nudity: "Non-consensual nudity",
      sexual_harassment: "Sexual harassment",
      hate_speech: "Hate speech",
      threats: "Threats/Violence",
      graphic_violence: "Graphic violence",
      other: "Other",
    };
    return labels[category] || category;
  };

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

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "non_consensual_nudity", label: "Non-consensual nudity" },
    { value: "sexual_harassment", label: "Sexual harassment" },
    { value: "hate_speech", label: "Hate speech" },
    { value: "threats", label: "Threats" },
    { value: "graphic_violence", label: "Graphic violence" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">
          Review and manage abuse reports submitted by the community.
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

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(platformFilter !== "all" || categoryFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPlatformFilter("all");
                  setCategoryFilter("all");
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : reports.length === 0 ? (
        <Card className="bg-card/50">
          <CardContent className="py-12 text-center">
            <FileWarning className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Reports Found</h3>
            <p className="text-sm text-muted-foreground">
              {platformFilter !== "all" || categoryFilter !== "all"
                ? "Try adjusting your filters."
                : "No reports have been submitted yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card
              key={report.id}
              className="bg-card/50 hover:bg-card/80 transition-colors"
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Platform Icon */}
                    <div
                      className={`p-3 rounded-xl ${
                        report.accounts?.platform === "instagram"
                          ? "bg-pink-500/10 text-pink-500"
                          : "bg-blue-500/10 text-blue-500"
                      }`}
                    >
                      {report.accounts?.platform === "instagram" ? (
                        <Instagram className="w-5 h-5" />
                      ) : (
                        <Twitter className="w-5 h-5" />
                      )}
                    </div>

                    {/* Report Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">
                          @{report.accounts?.handle || "Unknown"}
                        </span>
                        <Badge
                          variant={
                            getCategoryColor(report.category) as "default"
                          }
                        >
                          {getCategoryLabel(report.category)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {report.accounts?.flag_count || 0} flags
                        </Badge>
                      </div>

                      {report.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {report.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          {new Date(report.created_at).toLocaleDateString()} at{" "}
                          {new Date(report.created_at).toLocaleTimeString()}
                        </span>
                        {report.evidence_urls?.length > 0 && (
                          <span>
                            {report.evidence_urls.length} evidence file(s)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/accounts/${report.accounts?.id}`}>
                      <Button variant="outline" size="sm">
                        View Account
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
