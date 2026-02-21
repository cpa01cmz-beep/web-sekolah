import { useState, useCallback, memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { validateTitle, validateContent } from '@/utils/validation';
import { useFormValidation } from '@/hooks/useFormValidation';

interface AnnouncementFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string; content: string }) => void;
  isLoading: boolean;
}

export const AnnouncementForm = memo(function AnnouncementForm({
  open,
  onClose,
  onSave,
  isLoading,
}: AnnouncementFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const formData = { title, content };
  const {
    errors,
    validateAll,
    reset: resetValidation,
  } = useFormValidation(formData, {
    validators: {
      title: (value, show) => validateTitle(value, show, 5),
      content: (value, show) => validateContent(value, show, 10),
    },
  });

  const handleClose = useCallback(() => {
    setTitle('');
    setContent('');
    resetValidation();
    onClose();
  }, [onClose, resetValidation]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        setTitle('');
        setContent('');
        resetValidation();
        onClose();
      }
    },
    [onClose, resetValidation]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateAll()) {
        return;
      }

      onSave({ title: title.trim(), content: content.trim() });
    },
    [validateAll, title, content, onSave]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Announcement</DialogTitle>
          <DialogDescription>Post a new school-wide announcement.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <FormField
              id="announcement-title"
              label="Title"
              error={errors.title}
              helperText="Enter a descriptive title (minimum 5 characters)"
              required
            >
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Announcement Title"
                aria-busy={isLoading}
              />
            </FormField>
            <FormField
              id="announcement-content"
              label="Content"
              error={errors.content}
              helperText="Provide detailed information (minimum 10 characters)"
              required
            >
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your announcement here..."
                rows={5}
                aria-busy={isLoading}
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} aria-busy={isLoading}>
              {isLoading ? 'Posting...' : 'Post Announcement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});
AnnouncementForm.displayName = 'AnnouncementForm';
