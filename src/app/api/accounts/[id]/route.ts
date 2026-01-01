import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Account ID is required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Fetch account details
  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", id)
    .single();

  if (accountError || !account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  // Fetch report category breakdown (aggregated, no reporter info)
  const { data: reportStats, error: statsError } = await supabase
    .from("reports")
    .select("category")
    .eq("account_id", id);

  if (statsError) {
    return NextResponse.json(
      { error: "Failed to fetch report stats" },
      { status: 500 }
    );
  }

  // Calculate category breakdown
  const categoryBreakdown: Record<string, number> = {};
  if (reportStats) {
    reportStats.forEach((report) => {
      categoryBreakdown[report.category] =
        (categoryBreakdown[report.category] || 0) + 1;
    });
  }

  // Return account with breakdown
  return NextResponse.json({
    account: {
      ...account,
      safety_score: account.safety_score ?? 100,
      safety_tier: account.safety_tier ?? "clean",
    },
    categoryBreakdown,
    totalReports: reportStats?.length || 0,
  });
}
