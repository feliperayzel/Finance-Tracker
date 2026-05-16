import { createClient } from "@/lib/supabase/server";
import { CategoryList } from "@/components/categories/CategoryList";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Categories</h1>
      <CategoryList categories={categories ?? []} />
    </div>
  );
}
