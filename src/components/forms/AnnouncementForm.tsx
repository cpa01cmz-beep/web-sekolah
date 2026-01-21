import { useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { validateTitle, validateContent } from '@/utils/validation';

interface AnnouncementFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string; content: string }) => void;
  isLoading: boolean;
}

export function AnnouncementForm({ open, onClose, onSave, isLoading }: AnnouncementFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const titleErrorMemo = useMemo(() => validateTitle(title, showValidationErrors, 5), [title, showValidationErrors]);
  const contentErrorMemo = useMemo(() => validateContent(content, showValidationErrors, 10), [content, showValidationErrors]);

  const handleClose = useCallback(() => {
    setTitle('');
    setContent('');
    setShowValidationErrors(false);
    onClose();
  }, [onClose]);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      setTitle('');
      setContent('');
      setShowValidationErrors(false);
      onClose();
    }
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidationErrors(true);

    if (titleErrorMemo || contentErrorMemo) {
      return;
    }

    onSave({ title: title.trim(), content: content.trim() });
  };

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
              error={titleErrorMemo}
              helperText="Enter a descriptive title (minimum 5 characters)"
              required
            >
              <Input
                id="announcement-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Announcement Title"
                aria-required="true"
                aria-invalid={!!titleErrorMemo}
                aria-describedby={titleErrorMemo ? 'title-error' : 'title-helper'}
              />
            </FormField>
            <FormField
              id="announcement-content"
              label="Content"
              error={contentErrorMemo}
              helperText="Provide detailed information (minimum 10 characters)"
              required
            >
              <Textarea
                id="announcement-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your announcement here..."
                rows={5}
                aria-required="true"
                aria-invalid={!!contentErrorMemo}
                aria-describedby={contentErrorMemo ? 'content-error' : 'content-helper'}
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
}
