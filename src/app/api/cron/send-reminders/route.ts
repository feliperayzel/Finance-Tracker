import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendReminder } from "@/lib/email/mailer";
import { getISOWeek, getDate } from "@/lib/utils/dates";
import { format } from "date-fns";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const week = getISOWeek(today);
  const dayOfMonth = getDate(today);

  // Determine which frequencies are active today
  const activeFrequencies: string[] = ["weekly"];
  if (week % 2 === 0) activeFrequencies.push("biweekly");
  if (dayOfMonth === 1) activeFrequencies.push("monthly");

  const supabase = createServiceClient();

  const { data: subscriptions, error } = await supabase
    .from("alert_subscriptions")
    .select("id, user_id, email, frequency")
    .eq("active", true)
    .in("frequency", activeFrequencies);

  if (error) {
    console.error("Cron: failed to fetch subscriptions", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const monthStr = format(today, "MMMM yyyy");
  const since = format(today, "yyyy-MM-01");

  let sent = 0;

  for (const sub of subscriptions ?? []) {
    try {
      // Fetch this user's current-month summary via service role (bypasses RLS)
      const { data: txns } = await supabase
        .from("transactions")
        .select("type, value")
        .eq("user_id", sub.user_id)
        .gte("date", since)
        .lte("date", format(today, "yyyy-MM-dd"));

      const totalIncome = (txns ?? [])
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.value, 0);
      const totalExpenses = (txns ?? [])
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.value, 0);

      await sendReminder(sub.email, {
        month: monthStr,
        totalIncome,
        totalExpenses,
        net: totalIncome - totalExpenses,
      });

      sent++;
    } catch (err) {
      console.error(`Cron: failed to send to ${sub.email}`, err);
    }
  }

  return NextResponse.json({ sent, total: (subscriptions ?? []).length });
}
