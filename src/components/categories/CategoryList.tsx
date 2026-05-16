"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { CategoryForm } from "./CategoryForm";
import type { Category } from "@/types/database";

export function CategoryList({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      if (error.code === "23503") {
        toast({
          title: "Cannot delete",
          description: "This category is used by one or more transactions.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
      return;
    }

    toast({ title: "Category deleted" });
    router.refresh();
  };

  const handleEdit = (cat: Category) => {
    setEditing(cat);
    setFormOpen(true);
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button
          onClick={() => { setEditing(null); setFormOpen(true); }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-12">
          No categories yet. Create one to get started.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>{cat.name}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(cat.id)}
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

      <CategoryForm open={formOpen} onOpenChange={setFormOpen} editing={editing} />
    </div>
  );
}
