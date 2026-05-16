"use client";
import { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatEUR } from "@/lib/utils/currency";
import type { Transaction } from "@/types/database";

const COLORS = [
  "#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
];

interface Props {
  transactions: Transaction[];
}

export function CategoryBreakdownChart({ transactions }: Props) {
  const [view, setView] = useState<"expense" | "income">("expense");

  const data = Object.values(
    transactions
      .filter((t) => t.type === view)
      .reduce<Record<string, { name: string; value: number }>>((acc, t) => {
        const key = t.category_id;
        const name = t.categories?.name ?? "Unknown";
        if (!acc[key]) acc[key] = { name, value: 0 };
        acc[key].value = parseFloat((acc[key].value + t.value).toFixed(2));
        return acc;
      }, {})
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">By Category</CardTitle>
        <div className="flex gap-1">
          <Button
            variant={view === "expense" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("expense")}
          >
            Expenses
          </Button>
          <Button
            variant={view === "income" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("income")}
          >
            Income
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No data for this period.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatEUR(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
