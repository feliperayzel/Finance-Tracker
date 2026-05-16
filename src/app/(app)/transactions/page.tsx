import { createClient } from "@/lib/supabase/server";
import { monthRange, currentYearMonth } from "@/lib/utils/dates";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { NewTransactionButton } from "@/components/transactions/NewTransactionButton";

interface Props {
  searchParams: { month?: string; category?: string; person?: string };
}

export default async function TransactionsPage({ searchParams }: Props) {
  const supabase = await createClient();
  const month = searchParams.month ?? currentYearMonth();
  const { start, end } = monthRange(month);

  const [categoriesRes, personsRes] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("persons").select("*").order("name"),
  ]);

  let query = supabase
    .from("transactions")
    .select("*, categories(name), persons(name)")
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: false });

  if (searchParams.category) query = query.eq("category_id", searchParams.category);
  if (searchParams.person) query = query.eq("person_id", searchParams.person);

  const { data: transactions } = await query;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <NewTransactionButton
          categories={categoriesRes.data ?? []}
          persons={personsRes.data ?? []}
        />
      </div>

      <TransactionFilters
        categories={categoriesRes.data ?? []}
        persons={personsRes.data ?? []}
      />

      <TransactionTable
        transactions={transactions ?? []}
        categories={categoriesRes.data ?? []}
        persons={personsRes.data ?? []}
      />
    </div>
  );
}
