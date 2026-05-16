import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AlertSubscriptionForm } from "@/components/alerts/AlertSubscriptionForm";
import { AlertSubscriptionList } from "@/components/alerts/AlertSubscriptionList";

export default async function AlertsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: subscriptions } = await supabase
    .from("alert_subscriptions")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Email Alerts</h1>
      <p className="text-sm text-muted-foreground">
        Register email addresses to receive reminders to log your expenses on a regular schedule.
        Alerts are sent every Monday at 09:00 UTC (weekly), every other Monday (biweekly),
        or on the 1st of each month (monthly).
      </p>

      <AlertSubscriptionForm userEmail={user.email ?? ""} />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Active subscriptions
        </h2>
        <AlertSubscriptionList subscriptions={subscriptions ?? []} />
      </div>
    </div>
  );
}
