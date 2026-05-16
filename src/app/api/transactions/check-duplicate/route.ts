import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { category_id, value, date } = await request.json();

  if (!category_id || value === undefined || !date) {
    return NextResponse.json({ duplicate: false });
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("transactions")
    .select("id")
    .eq("category_id", category_id)
    .eq("value", value)
    .eq("date", date)
    .limit(1);

  return NextResponse.json({ duplicate: (data?.length ?? 0) > 0 });
}
