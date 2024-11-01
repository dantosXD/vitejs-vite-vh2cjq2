import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CatchForm, CatchFormProps } from './catch-form';
import { useCatchStore } from '@/lib/stores/catch-store';
import type { Catch, Group } from '@/lib/types';

interface CatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Catch;
  groups: Group[];
}

export function CatchDialog({
  open,
  onOpenChange,
  initialData,
  groups,
}: CatchDialogProps) {
  const { createCatch, updateCatch } = useCatchStore();

  const handleSubmit = async (data: Catch) => {
    try {
      if (initialData) {
        await updateCatch(initialData.id, data);
      } else {
        await createCatch(data);
      }
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the store
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Add'} Catch</DialogTitle>
        </DialogHeader>
        <CatchForm
          initialData={initialData}
          groups={groups}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}