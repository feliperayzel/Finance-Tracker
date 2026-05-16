"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema, type TransactionFormData } from "@/lib/validations/transaction.schema";
import { createClient } from "@/lib/supabase/client";
import { addMonthsToDate } from "@/lib/utils/dates";
import { formatEUR } from "@/lib/utils/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { DuplicateWarningModal } from "./DuplicateWarningModal";
import { InstallmentFields } from "./InstallmentFields";
import type { Category, Person, Transaction } from "@/types/database";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  persons: Person[];
  editing?: Transaction | null;
}

export function TransactionForm({ open, onOpenChange, categories, persons, editing }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showInstallments, setShowInstallments] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [pendingData, setPendingData] = useState<TransactionFormData | null>(null);

  const { register, handleSubmit, control, watch, reset, formState: { errors } } =
    useForm<TransactionFormData>({
      resolver: zodResolver(transactionSchema),
      defaultValues: {
        type: editing?.type ?? "expense",
        value: editing?.value ?? undefined,
        date: editing?.date ?? new Date().toISOString().split("T")[0],
        category_id: editing?.category_id ?? "",
        person_id: editing?.person_id ?? "",
        description: editing?.description ?? "",
        installments: 1,
      },
    });

  const type = watch("type");

  const checkDuplicate = async (data: TransactionFormData): Promise<boolean> => {
    const res = await fetch("/api/transactions/check-duplicate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category_id: data.category_id,
        value: data.value,
        date: data.date,
      }),
    });
    const { duplicate } = await res.json();
    return duplicate;
  };

  const save = async (data: TransactionFormData) => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const installments = showInstallments && data.type === "expense" ? (data.installments ?? 1) : 1;

    if (editing) {
      const { error } = await supabase.from("transactions").update({
        type: data.type,
        value: data.value,
        date: data.date,
        category_id: data.category_id,
        person_id: data.person_id,
        description: data.description || null,
      }).eq("id", editing.id);

      setLoading(false);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Transaction updated" });
    } else if (installments > 1) {
      const groupId = crypto.randomUUID();
      const baseValue = Math.floor((data.value / installments) * 100) / 100;
      const remainder = data.value - baseValue * installments;

      const rows = Array.from({ length: installments }, (_, i) => ({
        user_id: user!.id,
        type: data.type,
        value: i === 0 ? parseFloat((baseValue + remainder).toFixed(2)) : baseValue,
        date: addMonthsToDate(data.date, i),
        category_id: data.category_id,
        person_id: data.person_id,
        description: data.description || null,
        installment_group_id: groupId,
        installment_index: i + 1,
        installment_total: installments,
      }));

      const { error } = await supabase.from("transactions").insert(rows);
      setLoading(false);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: `${installments} installments saved` });
    } else {
      const { error } = await supabase.from("transactions").insert({
        user_id: user!.id,
        type: data.type,
        value: data.value,
        date: data.date,
        category_id: data.category_id,
        person_id: data.person_id,
        description: data.description || null,
      });
      setLoading(false);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Transaction saved" });
    }

    reset();
    setShowInstallments(false);
    onOpenChange(false);
    router.refresh();
  };

  const onSubmit = async (data: TransactionFormData) => {
    if (!editing) {
      const isDuplicate = await checkDuplicate(data);
      if (isDuplicate) {
        setPendingData(data);
        setDuplicateOpen(true);
        return;
      }
    }
    await save(data);
  };

  const handleDuplicateConfirm = async () => {
    setDuplicateOpen(false);
    if (pendingData) await save(pendingData);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Transaction" : "New Transaction"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Type toggle */}
            <div className="flex gap-2">
              {(["expense", "income"] as const).map((t) => (
                <label
                  key={t}
                  className={`flex-1 cursor-pointer rounded-md border px-3 py-2 text-center text-sm font-medium transition-colors ${
                    type === t
                      ? t === "expense"
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-green-500 bg-green-50 text-green-700"
                      : "hover:bg-accent"
                  }`}
                >
                  <input type="radio" value={t} {...register("type")} className="sr-only" />
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </label>
              ))}
            </div>

            {/* Value */}
            <div className="space-y-1">
              <Label>Value (€)</Label>
              <Input type="number" step="0.01" min="0.01" placeholder="0.00" {...register("value")} />
              {errors.value && <p className="text-xs text-destructive">{errors.value.message}</p>}
            </div>

            {/* Date */}
            <div className="space-y-1">
              <Label>Date</Label>
              <Input type="date" {...register("date")} />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>

            {/* Category */}
            <div className="space-y-1">
              <Label>Category</Label>
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category_id && (
                <p className="text-xs text-destructive">{errors.category_id.message}</p>
              )}
            </div>

            {/* Person */}
            <div className="space-y-1">
              <Label>Person</Label>
              <Controller
                name="person_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select person" />
                    </SelectTrigger>
                    <SelectContent>
                      {persons.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.person_id && (
                <p className="text-xs text-destructive">{errors.person_id.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label>Description (optional)</Label>
              <Textarea rows={2} placeholder="Add a note…" {...register("description")} />
            </div>

            {/* Installments toggle (expense only, no editing) */}
            {type === "expense" && !editing && (
              <div className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm font-medium">Split into installments</span>
                <Switch checked={showInstallments} onCheckedChange={setShowInstallments} />
              </div>
            )}

            {showInstallments && type === "expense" && !editing && (
              <InstallmentFields register={register} watch={watch} />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DuplicateWarningModal
        open={duplicateOpen}
        onConfirm={handleDuplicateConfirm}
        onCancel={() => { setDuplicateOpen(false); setPendingData(null); }}
      />
    </>
  );
}
