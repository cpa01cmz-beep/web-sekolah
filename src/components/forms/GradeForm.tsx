import { useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
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

  const handleClose = useCallback(() => {
    setCurrentScore('');
    setCurrentFeedback('');
    onClose();
  }, [onClose]);

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

  const isScoreInvalid = currentScore !== '' && !isValidScore(parseInt(currentScore, 10));

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
              <Label htmlFor="score" className="text-right pt-2">
                Score
              </Label>
              <div className="col-span-3 space-y-2">
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
                  aria-invalid={isScoreInvalid}
                  aria-describedby="score-helper score-error"
                />
                <p id="score-helper" className="text-xs text-muted-foreground">Enter a score between 0 and 100. Leave empty for no score.</p>
                {isScoreInvalid && (
                  <p id="score-error" className="text-xs text-destructive" role="alert">
                    Please enter a valid score between 0 and 100
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="feedback" className="text-right pt-2">
                Feedback
              </Label>
              <div className="col-span-3 space-y-2">
                <Textarea
                  id="feedback"
                  value={currentFeedback}
                  onChange={(e) => setCurrentFeedback(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter feedback..."
                  rows={3}
                  aria-describedby="feedback-helper"
                />
                <p id="feedback-helper" className="text-xs text-muted-foreground">Provide constructive feedback to help student improve</p>
              </div>
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
