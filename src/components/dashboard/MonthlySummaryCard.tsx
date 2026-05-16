import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEUR } from "@/lib/utils/currency";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface Props {
  totalIncome: number;
  totalExpenses: number;
}

export function MonthlySummaryCards({ totalIncome, totalExpenses }: Props) {
  const net = totalIncome - totalExpenses;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-700">{formatEUR(totalIncome)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-700">{formatEUR(totalExpenses)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Net</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${net >= 0 ? "text-green-700" : "text-red-700"}`}>
            {formatEUR(net)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
