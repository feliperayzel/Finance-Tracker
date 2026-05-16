import { createClient } from "@/lib/supabase/server";
import { PersonList } from "@/components/persons/PersonList";

export default async function PersonsPage() {
  const supabase = await createClient();
  const { data: persons } = await supabase
    .from("persons")
    .select("*")
    .order("name");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Persons</h1>
      <PersonList persons={persons ?? []} />
    </div>
  );
}
