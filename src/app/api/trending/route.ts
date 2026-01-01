import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "7d"; // 24h, 7d, 30d
  const limit = (() => {
    const n = parseInt(searchParams.get("limit") || "10", 10);
    return isNaN(n) || n <= 0 ? 10 : n;
  })();

  const supabase = await createClient();

  // Calculate start date based on period
  const now = new Date();
  let startDate = new Date();

  if (period === "24h") startDate.setDate(now.getDate() - 1);
  else if (period === "30d") startDate.setDate(now.getDate() - 30);
  else startDate.setDate(now.getDate() - 7); // Default 7d

  // Since we don't have a separate table for daily stats easily accessible without aggregation queries
  // (which are harder in simple Supabase client), we'll query reports and aggregate in code for now,
  // OR just query accounts with recent activity if the dataset is small.
  // A better approach for scalability is a DB view or function, but for MVP we can use the `accounts` table
  // assuming `last_flagged_at` is relevant, or query `reports`.

  // Let's try to query accounts directly sorted by flag_count for now,
  // but ideally we want "trending" = "recently active".

  // Real implementation: Query accounts updated recently with high flag counts
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .gt("last_flagged_at", startDate.toISOString())
    .order("flag_count", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate trends for each account (mocking slightly since we don't have historical snapshots)
  // In a real app, we'd compare vs previous period.
  const trendingData = data.map((account) => ({
    ...account,
    safety_score: account.safety_score ?? 100,
    safety_tier: account.safety_tier ?? "clean",
    // Mock trend indicator based on recent reports
    trend_direction: "up", // Assuming if it appears here, reports are going up
    recent_reports:
      account.flag_count > 0
        ? Math.max(1, Math.round(account.flag_count * 0.2))
        : 0,
  }));

  return NextResponse.json({ data: trendingData });
}
