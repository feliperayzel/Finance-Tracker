import { createClient } from "@/lib/supabase/server";
import { currentYearMonth, monthRange } from "@/lib/utils/dates";
import { MonthlySummaryCards } from "@/components/dashboard/MonthlySummaryCard";
import { CategoryBreakdownChart } from "@/components/dashboard/CategoryBreakdownChart";
import { MonthlyBarChart } from "@/components/dashboard/MonthlyBarChart";
import { MonthPicker } from "@/components/dashboard/MonthPicker";
import { format, subMonths } from "date-fns";
import type { MonthlyAggregate } from "@/types/database";

interface Props {
  searchParams: { month?: string };
}

export default async function DashboardPage({ searchParams }: Props) {
  const supabase = await createClient();
  const month = searchParams.month ?? currentYearMonth();
  const { start, end } = monthRange(month);

  const sixMonthsAgo = format(subMonths(new Date(), 5), "yyyy-MM-01");

  const [txRes, aggRes] = await Promise.all([
    supabase
      .from("transactions")
      .select("*, categories(name), persons(name)")
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: false }),

    supabase.rpc("monthly_aggregates", { since: sixMonthsAgo }),
  ]);

  const transactions = txRes.data ?? [];
  const aggregates: MonthlyAggregate[] = (aggRes.data ?? []).map(
    (r: { month: string; type: string; total: string }) => ({
      month: r.month.slice(0, 7),
      type: r.type as "expense" | "income",
      total: parseFloat(r.total),
    })
  );

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.value, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <MonthPicker />
      </div>

      <MonthlySummaryCards totalIncome={totalIncome} totalExpenses={totalExpenses} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CategoryBreakdownChart transactions={transactions} />
        <MonthlyBarChart aggregates={aggregates} />
      </div>
    </div>
  );
}
