"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils/dates";
import { formatEUR } from "@/lib/utils/currency";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { TransactionForm } from "./TransactionForm";
import type { Category, Person, Transaction } from "@/types/database";

interface Props {
  transactions: Transaction[];
  categories: Category[];
  persons: Person[];
}

export function TransactionTable({ transactions, categories, persons }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [deleteMode, setDeleteMode] = useState<"single" | "all" | null>(null);

  const openDelete = (tx: Transaction) => {
    setDeleteTarget(tx);
    setDeleteMode(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const supabase = createClient();

    const { error } = deleteMode === "all" && deleteTarget.installment_group_id
      ? await supabase
          .from("transactions")
          .delete()
          .eq("installment_group_id", deleteTarget.installment_group_id)
      : await supabase.from("transactions").delete().eq("id", deleteTarget.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted" });
      router.refresh();
    }

    setDeleteTarget(null);
    setDeleteMode(null);
  };

  return (
    <>
      {transactions.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-12">
          No transactions for this period.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Person</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead>Installment</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="whitespace-nowrap">{formatDate(tx.date)}</TableCell>
                <TableCell>
                  <Badge variant={tx.type === "income" ? "income" : "expense"}>
                    {tx.type}
                  </Badge>
                </TableCell>
                <TableCell>{tx.categories?.name ?? "—"}</TableCell>
                <TableCell>{tx.persons?.name ?? "—"}</TableCell>
                <TableCell className="max-w-[180px] truncate text-muted-foreground text-xs">
                  {tx.description}
                </TableCell>
                <TableCell
                  className={`text-right font-mono font-medium ${
                    tx.type === "income" ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}{formatEUR(tx.value)}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {tx.installment_total
                    ? `${tx.installment_index} of ${tx.installment_total}`
                    : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setEditing(tx); setFormOpen(true); }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => openDelete(tx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete transaction?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>

          {deleteTarget?.installment_group_id && (
            <div className="space-y-2">
              <p className="text-sm">This is installment {deleteTarget.installment_index} of {deleteTarget.installment_total}. What do you want to delete?</p>
              <div className="flex gap-2">
                <Button
                  variant={deleteMode === "single" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDeleteMode("single")}
                >
                  This installment only
                </Button>
                <Button
                  variant={deleteMode === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDeleteMode("all")}
                >
                  All {deleteTarget.installment_total} installments
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!!deleteTarget?.installment_group_id && deleteMode === null}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TransactionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        categories={categories}
        persons={persons}
        editing={editing}
      />
    </>
  );
}
