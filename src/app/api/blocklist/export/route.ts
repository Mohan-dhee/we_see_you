import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "json"; // json, csv
  const tier = searchParams.get("tier"); // danger, warning, etc.

  const supabase = await createClient();

  let query = supabase
    .from("accounts")
    .select(
      "platform, handle, flag_count, safety_tier, safety_score, last_flagged_at, status"
    )
    .order("flag_count", { ascending: false });

  if (tier) {
    query = query.eq("safety_tier", tier);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (format === "csv") {
    // Convert to CSV
    const headers = [
      "Platform",
      "Handle",
      "Reports",
      "Safety Tier",
      "Score",
      "Status",
      "Last Reported",
    ];
    const csvRows = [headers.join(",")];

    data.forEach((account) => {
      csvRows.push(
        [
          account.platform,
          account.handle,
          account.flag_count,
          account.safety_tier,
          account.safety_score,
          account.status,
          new Date(account.last_flagged_at).toISOString(),
        ].join(",")
      );
    });

    const csvContent = csvRows.join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="we-see-you-blocklist-${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  }

  return NextResponse.json({
    data,
    meta: {
      count: data.length,
      timestamp: new Date().toISOString(),
      source: "We See You Platform",
    },
  });
}
