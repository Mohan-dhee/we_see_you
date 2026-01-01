import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsedLimit = parseInt(searchParams.get("limit") || "20", 10);
  const limit = isNaN(parsedLimit) ? 20 : parsedLimit;
  const platform = searchParams.get("platform");
  const type = searchParams.get("type");

  const supabase = await createClient();

  let query = supabase
    .from("activity_feed")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (platform && platform !== "all") {
    query = query.eq("platform", platform);
  }

  if (type && type !== "all") {
    query = query.eq("activity_type", type);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
