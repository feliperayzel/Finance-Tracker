"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthLabel, prevMonth, nextMonth, currentYearMonth } from "@/lib/utils/dates";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Category, Person } from "@/types/database";

interface Props {
  categories: Category[];
  persons: Person[];
}

export function TransactionFilters({ categories, persons }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const month = params.get("month") ?? currentYearMonth();
  const catFilter = params.get("category") ?? "";
  const personFilter = params.get("person") ?? "";

  const navigate = (updates: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else next.delete(k);
    });
    router.push(`/transactions?${next.toString()}`);
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      {/* Month nav */}
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" onClick={() => navigate({ month: prevMonth(month) })}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="w-36 text-center text-sm font-medium">{monthLabel(month + "-01")}</span>
        <Button variant="outline" size="icon" onClick={() => navigate({ month: nextMonth(month) })}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Category filter */}
      <Select value={catFilter || "all"} onValueChange={(v) => navigate({ category: v === "all" ? "" : v })}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Person filter */}
      <Select value={personFilter || "all"} onValueChange={(v) => navigate({ person: v === "all" ? "" : v })}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All persons" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All persons</SelectItem>
          {persons.map((p) => (
            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
