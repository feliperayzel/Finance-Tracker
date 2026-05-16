"use client";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import type { AlertSubscription } from "@/types/database";

export function AlertSubscriptionList({ subscriptions }: { subscriptions: AlertSubscription[] }) {
  const router = useRouter();
  const { toast } = useToast();

  const toggleActive = async (id: string, active: boolean) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("alert_subscriptions")
      .update({ active })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("alert_subscriptions").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Subscription removed" });
    router.refresh();
  };

  if (subscriptions.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-8">
        No email subscriptions yet.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Frequency</TableHead>
          <TableHead>Active</TableHead>
          <TableHead className="w-16" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {subscriptions.map((sub) => (
          <TableRow key={sub.id}>
            <TableCell>{sub.email}</TableCell>
            <TableCell>
              <Badge variant="outline" className="capitalize">
                {sub.frequency}
              </Badge>
            </TableCell>
            <TableCell>
              <Switch
                checked={sub.active}
                onCheckedChange={(v) => toggleActive(sub.id, v)}
              />
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDelete(sub.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
