import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  parseISO,
  getISOWeek,
  getDate,
} from "date-fns";

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), "dd/MM/yyyy");
}

export function monthLabel(dateStr: string): string {
  return format(parseISO(dateStr), "MMMM yyyy");
}

export function currentYearMonth(): string {
  return format(new Date(), "yyyy-MM");
}

export function addMonthsToDate(dateStr: string, months: number): string {
  return format(addMonths(parseISO(dateStr), months), "yyyy-MM-dd");
}

export function monthRange(yearMonth: string): { start: string; end: string } {
  const d = parseISO(yearMonth + "-01");
  return {
    start: format(startOfMonth(d), "yyyy-MM-dd"),
    end: format(endOfMonth(d), "yyyy-MM-dd"),
  };
}

export function prevMonth(yearMonth: string): string {
  const d = parseISO(yearMonth + "-01");
  return format(addMonths(d, -1), "yyyy-MM");
}

export function nextMonth(yearMonth: string): string {
  const d = parseISO(yearMonth + "-01");
  return format(addMonths(d, 1), "yyyy-MM");
}

export { getISOWeek, getDate };
