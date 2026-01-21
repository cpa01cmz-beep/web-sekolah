import { useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { isValidScore } from '@/utils/validation';

interface StudentGrade {
  id: string;
  name: string;
  score: number | null;
  feedback: string;
  gradeId: string | null;
}

interface GradeFormProps {
  open: boolean;
  onClose: () => void;
  editingStudent: StudentGrade | null;
  onSave: (data: { score: number | null; feedback: string }) => void;
  isLoading: boolean;
}

export function GradeForm({ open, onClose, editingStudent, onSave, isLoading }: GradeFormProps) {
  const [currentScore, setCurrentScore] = useState<string>(() => editingStudent?.score?.toString() || '');
  const [currentFeedback, setCurrentFeedback] = useState<string>(() => editingStudent?.feedback || '');

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      setCurrentScore('');
      setCurrentFeedback('');
      onClose();
    } else if (editingStudent) {
      setCurrentScore(editingStudent.score?.toString() || '');
      setCurrentFeedback(editingStudent.feedback || '');
    }
  }, [editingStudent, onClose]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const scoreValue = currentScore === '' ? null : parseInt(currentScore, 10);
    if (!isValidScore(scoreValue)) {
      return;
    }
    onSave({ score: scoreValue, feedback: currentFeedback });
  };

  const scoreError = useMemo(() => {
    if (currentScore === '') return '';
    const scoreValue = parseInt(currentScore, 10);
    return isValidScore(scoreValue) ? '' : 'Please enter a valid score between 0 and 100';
  }, [currentScore]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Grade for {editingStudent?.name}</DialogTitle>
          <DialogDescription>Update score and provide feedback.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-start gap-4">
              <FormField
                id="score"
                label="Score"
                error={scoreError}
                helperText="Enter a score between 0 and 100. Leave empty for no score."
                className="col-span-3"
              >
                <Input
                  id="score"
                  type="number"
                  value={currentScore}
                  onChange={(e) => setCurrentScore(e.target.value)}
                  className="col-span-3"
                  placeholder="0-100"
                  min="0"
                  max="100"
                  step="1"
                  aria-invalid={!!scoreError}
                  aria-describedby={scoreError ? 'score-error' : 'score-helper'}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <FormField
                id="feedback"
                label="Feedback"
                helperText="Provide constructive feedback to help student improve"
                className="col-span-3"
              >
                <Textarea
                  id="feedback"
                  value={currentFeedback}
                  onChange={(e) => setCurrentFeedback(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter feedback..."
                  rows={3}
                  aria-describedby="feedback-helper"
                />
              </FormField>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
            <Button type="submit" disabled={isLoading} aria-busy={isLoading}>
              {isLoading ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
