import { UseFormRegister, UseFormWatch } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatEUR } from "@/lib/utils/currency";
import type { TransactionFormData } from "@/lib/validations/transaction.schema";

interface Props {
  register: UseFormRegister<TransactionFormData>;
  watch: UseFormWatch<TransactionFormData>;
}

export function InstallmentFields({ register, watch }: Props) {
  const value = watch("value") ?? 0;
  const installments = watch("installments") ?? 1;

  const baseValue = installments > 1 ? Math.floor((value / installments) * 100) / 100 : value;
  const remainder = installments > 1 ? value - baseValue * installments : 0;
  const month1 = baseValue + remainder;

  return (
    <div className="space-y-3 rounded-md border bg-muted/30 p-3">
      <div className="space-y-2">
        <Label htmlFor="installments">Number of installments</Label>
        <Input
          id="installments"
          type="number"
          min={2}
          max={60}
          {...register("installments")}
        />
      </div>

      {installments > 1 && value > 0 && (
        <p className="text-xs text-muted-foreground">
          Month 1: <strong>{formatEUR(month1)}</strong>
          {installments > 2 && (
            <> · months 2–{installments}: <strong>{formatEUR(baseValue)}</strong> each</>
          )}
        </p>
      )}
    </div>
  );
}
