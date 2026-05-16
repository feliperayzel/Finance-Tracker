"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEUR } from "@/lib/utils/currency";
import type { MonthlyAggregate } from "@/types/database";
import { format, parseISO } from "date-fns";

interface Props {
  aggregates: MonthlyAggregate[];
}

export function MonthlyBarChart({ aggregates }: Props) {
  const months = [...new Set(aggregates.map((a) => a.month))].sort();

  const chartData = months.map((m) => {
    const inc = aggregates.find((a) => a.month === m && a.type === "income")?.total ?? 0;
    const exp = aggregates.find((a) => a.month === m && a.type === "expense")?.total ?? 0;
    return {
      month: format(parseISO(m), "MMM yy"),
      Income: inc,
      Expenses: exp,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Last 6 Months</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `€${v}`} tick={{ fontSize: 11 }} width={60} />
              <Tooltip formatter={(v: number) => formatEUR(v)} />
              <Legend />
              <Bar dataKey="Income" fill="#16a34a" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Expenses" fill="#dc2626" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
