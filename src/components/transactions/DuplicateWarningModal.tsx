import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DuplicateWarningModal({ open, onConfirm, onCancel }: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            Possible duplicate
          </DialogTitle>
          <DialogDescription>
            A transaction with the same category, value, and date already exists. Do you want to
            save it anyway?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Save anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
