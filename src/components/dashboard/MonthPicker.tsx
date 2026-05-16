"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthLabel, prevMonth, nextMonth, currentYearMonth } from "@/lib/utils/dates";
import { Button } from "@/components/ui/button";

export function MonthPicker() {
  const router = useRouter();
  const params = useSearchParams();
  const month = params.get("month") ?? currentYearMonth();

  const go = (m: string) => router.push(`/dashboard?month=${m}`);

  return (
    <div className="flex items-center gap-1">
      <Button variant="outline" size="icon" onClick={() => go(prevMonth(month))}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="w-36 text-center text-sm font-medium">{monthLabel(month + "-01")}</span>
      <Button variant="outline" size="icon" onClick={() => go(nextMonth(month))}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
