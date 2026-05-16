"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { alertSchema, type AlertFormData } from "@/lib/validations/alert.schema";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Controller } from "react-hook-form";

export function AlertSubscriptionForm({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm<AlertFormData>({
    resolver: zodResolver(alertSchema),
    defaultValues: { email: userEmail, frequency: "weekly" },
  });

  const onSubmit = async (data: AlertFormData) => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("alert_subscriptions").insert({
      email: data.email,
      frequency: data.frequency,
      user_id: user!.id,
    });
    setLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Alert subscription added" });
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Add email alert</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px] space-y-1">
            <Label>Email</Label>
            <Input type="email" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="w-40 space-y-1">
            <Label>Frequency</Label>
            <Controller
              name="frequency"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Adding…" : "Add"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
