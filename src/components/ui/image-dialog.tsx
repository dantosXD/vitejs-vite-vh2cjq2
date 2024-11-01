import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';

interface ImageDialogProps {
  image: string;
  alt: string;
  trigger: React.ReactNode;
}

export function ImageDialog({ image, alt, trigger }: ImageDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-3xl p-0">
        <VisuallyHidden>
          <DialogTitle>{alt}</DialogTitle>
        </VisuallyHidden>
        <img
          src={image}
          alt={alt}
          className="w-full h-auto rounded-lg"
        />
      </DialogContent>
    </Dialog>
  );
}