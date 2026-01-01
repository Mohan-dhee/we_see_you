import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get("handle");
  const platform = searchParams.get("platform");

  // Validate handle
  if (!handle || handle.trim().length === 0) {
    return NextResponse.json({ error: "Handle is required" }, { status: 400 });
  }

  // Clean the handle (remove @ if present)
  const cleanHandle = handle.trim().replace(/^@/, "").toLowerCase();

  const supabase = await createClient();

  // Build query
  let query = supabase
    .from("accounts")
    .select("*")
    .ilike("handle", `%${cleanHandle}%`);

  // Filter by platform if specified
  if (platform && platform !== "all") {
    query = query.eq("platform", platform);
  }

  // Execute query with ordering
  const { data: accounts, error } = await query
    .order("flag_count", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search accounts" },
      { status: 500 }
    );
  }

  // Return results with calculated safety data if not present
  const results = (accounts || []).map((account) => ({
    ...account,
    safety_score: account.safety_score ?? 100,
    safety_tier: account.safety_tier ?? "clean",
  }));

  return NextResponse.json({
    results,
    count: results.length,
    query: {
      handle: cleanHandle,
      platform: platform || "all",
    },
  });
}
