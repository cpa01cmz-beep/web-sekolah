import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
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
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  useEffect(() => {
    if (!open) {
      setTitle('');
      setContent('');
      setTitleError('');
      setContentError('');
      setShowValidationErrors(false);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidationErrors(true);

    const newTitleError = validateTitle(title, showValidationErrors, 5);
    const newContentError = validateContent(content, showValidationErrors, 10);

    if (newTitleError || newContentError) {
      return;
    }

    onSave({ title: title.trim(), content: content.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Announcement</DialogTitle>
          <DialogDescription>Post a new school-wide announcement.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="announcement-title" className="flex items-center gap-2">
                Title
                <span className="text-destructive" aria-label="required">*</span>
              </Label>
              <Input
                id="announcement-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Announcement Title"
                aria-required="true"
                aria-invalid={!!titleError}
                aria-describedby={titleError ? 'title-error' : 'title-helper'}
              />
              <p id="title-helper" className="text-xs text-muted-foreground">Enter a descriptive title (minimum 5 characters)</p>
              {titleError && (
                <p id="title-error" className="text-xs text-destructive flex items-center gap-1" role="alert" aria-live="polite">
                  <AlertCircle className="h-3 w-3" aria-hidden="true" />
                  {titleError}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement-content" className="flex items-center gap-2">
                Content
                <span className="text-destructive" aria-label="required">*</span>
              </Label>
              <Textarea
                id="announcement-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your announcement here..."
                rows={5}
                aria-required="true"
                aria-invalid={!!contentError}
                aria-describedby={contentError ? 'content-error' : 'content-helper'}
              />
              <p id="content-helper" className="text-xs text-muted-foreground">Provide detailed information (minimum 10 characters)</p>
              {contentError && (
                <p id="content-error" className="text-xs text-destructive flex items-center gap-1" role="alert" aria-live="polite">
                  <AlertCircle className="h-3 w-3" aria-hidden="true" />
                  {contentError}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
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
