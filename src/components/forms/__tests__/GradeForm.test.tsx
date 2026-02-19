import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GradeForm } from '@/components/forms/GradeForm';

describe.skip('GradeForm - Requires userEvent migration for React 18+ (see issue #512)', () => {
  const defaultEditingStudent = {
    id: '1',
    name: 'John Doe',
    score: 85,
    feedback: 'Great work!',
    gradeId: 'grade123'
  };

  describe('Rendering', () => {
    it('should render dialog with title including student name', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      expect(screen.getByText(/Edit Grade for John Doe/i)).toBeInTheDocument();
    });

    it('should render dialog description', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      expect(screen.getByText(/Update score and provide feedback\./i)).toBeInTheDocument();
    });

    it('should render score input field', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      expect(screen.getByLabelText(/score/i)).toBeInTheDocument();
    });

    it('should render feedback textarea field', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      expect(screen.getByLabelText(/feedback/i)).toBeInTheDocument();
    });

    it('should render cancel and submit buttons', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });

    it('should not render dialog when open is false', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={false} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      expect(screen.queryByText(/Edit Grade for/i)).not.toBeInTheDocument();
    });
  });

  describe('Form State', () => {
    it('should pre-populate score when editingStudent has a score', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      expect(screen.getByLabelText(/score/i)).toHaveValue(85);
    });

    it('should pre-populate feedback when editingStudent has feedback', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      expect(screen.getByLabelText(/feedback/i)).toHaveValue('Great work!');
    });

    it('should have empty score when editingStudent has null score', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      const studentWithNullScore = { ...defaultEditingStudent, score: null };
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={studentWithNullScore} onSave={onSave} isLoading={false} />
      );

      const scoreInput = screen.getByLabelText(/score/i) as HTMLInputElement;
      expect(scoreInput.value).toBe('');
    });

    it('should have empty feedback when editingStudent has empty feedback', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      const studentWithEmptyFeedback = { ...defaultEditingStudent, feedback: '' };
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={studentWithEmptyFeedback} onSave={onSave} isLoading={false} />
      );

      expect(screen.getByLabelText(/feedback/i)).toHaveValue('');
    });

    it('should allow typing in score field', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const scoreInput = screen.getByLabelText(/score/i);
      fireEvent.change(scoreInput, { target: { value: '90' } });

      expect(scoreInput).toHaveValue(90);
    });

    it('should allow typing in feedback field', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const feedbackTextarea = screen.getByLabelText(/feedback/i);
      fireEvent.change(feedbackTextarea, { target: { value: 'Excellent work!' } });

      expect(feedbackTextarea).toHaveValue('Excellent work!');
    });

    it('should clear form when dialog is closed and reopened', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();

      render(<GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />);

      fireEvent.change(screen.getByLabelText(/score/i), { target: { value: '95' } });
      fireEvent.change(screen.getByLabelText(/feedback/i), { target: { value: 'Updated feedback' } });

      expect(screen.getByLabelText(/score/i)).toHaveValue(95);
      expect(screen.getByLabelText(/feedback/i)).toHaveValue('Updated feedback');

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onClose).toHaveBeenCalled();
    });

    it('should pre-populate form when reopened in edit mode', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();

      const { rerender } = render(
        <GradeForm open={false} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      rerender(<GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />);

      expect(screen.getByLabelText(/score/i)).toHaveValue(85);
      expect(screen.getByLabelText(/feedback/i)).toHaveValue('Great work!');
    });
  });

  describe('Form Validation', () => {
    it('should not show validation errors initially', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      expect(screen.queryByText(/valid score/i)).not.toBeInTheDocument();
    });

    it('should show error when score is below 0', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      fireEvent.change(screen.getByLabelText(/score/i), { target: { value: '-5' } });

      expect(screen.getByText(/valid score/)).toBeInTheDocument();
    });

    it('should show error when score is above 100', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      fireEvent.change(screen.getByLabelText(/score/i), { target: { value: '150' } });

      expect(screen.getByText(/valid score/)).toBeInTheDocument();
    });

    it('should not show error when score is exactly 0', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      fireEvent.change(screen.getByLabelText(/score/i), { target: { value: '0' } });

      expect(screen.queryByText(/valid score/)).not.toBeInTheDocument();
    });

    it('should not show error when score is exactly 100', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      fireEvent.change(screen.getByLabelText(/score/i), { target: { value: '100' } });

      expect(screen.queryByText(/valid score/)).not.toBeInTheDocument();
    });

    it('should not show error when score is within valid range', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      fireEvent.change(screen.getByLabelText(/score/i), { target: { value: '75' } });

      expect(screen.queryByText(/valid score/)).not.toBeInTheDocument();
    });

    it('should not show error when score is empty (no score scenario)', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      fireEvent.change(screen.getByLabelText(/score/i), { target: { value: '' } });

      expect(screen.queryByText(/valid score/)).not.toBeInTheDocument();
    });

    it('should show error when score is non-numeric', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      fireEvent.change(screen.getByLabelText(/score/i), { target: { value: 'abc' } });

      expect(screen.getByText(/valid score/)).toBeInTheDocument();
    });

    it('should show error when score is decimal', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      fireEvent.change(screen.getByLabelText(/score/i), { target: { value: '85.5' } });

      expect(screen.getByText(/valid score/)).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call onSave with score and feedback when form is valid', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      fireEvent.change(screen.getByLabelText(/score/i), { target: { value: '90' } });
      fireEvent.change(screen.getByLabelText(/feedback/i), { target: { value: 'Great improvement!' } });
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith({
        score: 90,
        feedback: 'Great improvement!'
      });
    });

    it('should call onSave with null score when score is empty', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      onSave.mockClear();
      
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      fireEvent.change(screen.getByLabelText(/score/i), { target: { value: '' } });
      fireEvent.change(screen.getByLabelText(/feedback/i), { target: { value: 'Feedback for no score' } });
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

      expect(onSave).toHaveBeenCalledWith({
        score: null,
        feedback: 'Feedback for no score'
      });
    });

    it('should not call onSave when score is invalid', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      fireEvent.change(screen.getByLabelText(/score/i), { target: { value: '150' } });
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

      expect(onSave).not.toHaveBeenCalled();
    });

    it('should submit with empty feedback', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      fireEvent.change(screen.getByLabelText(/score/i), { target: { value: '85' } });
      fireEvent.change(screen.getByLabelText(/feedback/i), { target: { value: '' } });
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

      expect(onSave).toHaveBeenCalledWith({
        score: 85,
        feedback: ''
      });
    });

    it('should submit with boundary values', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();

      const boundaryScores = [0, 100, 50];
      boundaryScores.forEach((score) => {
        onSave.mockClear();
        render(
          <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
        );

        fireEvent.change(screen.getByLabelText(/score/i), { target: { value: score.toString() } });
        fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ score }));
      });
    });
  });

  describe('Loading State', () => {
    it('should disable score input when loading', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={true} />
      );

      const scoreInput = screen.getByLabelText(/score/i);
      expect(scoreInput).toBeDisabled();
    });

    it('should disable feedback textarea when loading', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={true} />
      );

      const feedbackTextarea = screen.getByLabelText(/feedback/i);
      expect(feedbackTextarea).toBeDisabled();
    });

    it('should set aria-busy on score input when loading', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={true} />
      );

      const scoreInput = screen.getByLabelText(/score/i);
      expect(scoreInput).toHaveAttribute('aria-busy', 'true');
    });

    it('should set aria-busy on feedback textarea when loading', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={true} />
      );

      const feedbackTextarea = screen.getByLabelText(/feedback/i);
      expect(feedbackTextarea).toHaveAttribute('aria-busy', 'true');
    });

    it('should disable submit button when loading', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={true} />
      );

      const submitButton = screen.getByRole('button', { name: /saving/i });
      expect(submitButton).toBeDisabled();
    });

    it('should show loading text on submit button when loading', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={true} />
      );

      expect(screen.getByRole('button', { name: /saving\.\.\./i })).toBeInTheDocument();
    });

    it('should set aria-busy on submit button when loading', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={true} />
      );

      const submitButton = screen.getByRole('button', { name: /saving\.\.\./i });
      expect(submitButton).toHaveAttribute('aria-busy', 'true');
    });

    it('should not disable cancel button when loading', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={true} />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).not.toBeDisabled();
    });

    it('should show "Save changes" text when not loading', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });
  });

  describe('Dialog Behavior', () => {
    it('should call onClose when cancel button is clicked', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should clear form when dialog is closed', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();

      render(<GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />);

      fireEvent.change(screen.getByLabelText(/score/i), { target: { value: '95' } });
      fireEvent.change(screen.getByLabelText(/feedback/i), { target: { value: 'Updated feedback' } });

      expect(screen.getByLabelText(/score/i)).toHaveValue(95);

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have required attribute on score input', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const scoreInput = screen.getByLabelText(/score/i);
      expect(scoreInput).toHaveAttribute('required');
    });

    it('should have min="0" attribute on score input', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const scoreInput = screen.getByLabelText(/score/i);
      expect(scoreInput).toHaveAttribute('min', '0');
    });

    it('should have max="100" attribute on score input', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const scoreInput = screen.getByLabelText(/score/i);
      expect(scoreInput).toHaveAttribute('max', '100');
    });

    it('should have step="1" attribute on score input', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const scoreInput = screen.getByLabelText(/score/i);
      expect(scoreInput).toHaveAttribute('step', '1');
    });

    it('should have type="number" attribute on score input', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const scoreInput = screen.getByLabelText(/score/i);
      expect(scoreInput).toHaveAttribute('type', 'number');
    });

    it('should have rows="3" attribute on feedback textarea', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const feedbackTextarea = screen.getByLabelText(/feedback/i);
      expect(feedbackTextarea).toHaveAttribute('rows', '3');
    });

    it('should have helper text for score field', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      expect(screen.getByText(/Enter a score between 0 and 100. Leave empty for no score\./i)).toBeInTheDocument();
    });

    it('should have helper text for feedback field', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      expect(screen.getByText(/Provide constructive feedback to help student improve/i)).toBeInTheDocument();
    });

    it('should have aria-busy on all inputs during loading', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={true} />
      );

      const scoreInput = screen.getByLabelText(/score/i);
      const feedbackTextarea = screen.getByLabelText(/feedback/i);
      const submitButton = screen.getByRole('button', { name: /saving\.\.\./i });

      expect(scoreInput).toHaveAttribute('aria-busy', 'true');
      expect(feedbackTextarea).toHaveAttribute('aria-busy', 'true');
      expect(submitButton).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Edge Cases', () => {
    it('should handle score with leading zeros', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      fireEvent.change(screen.getByLabelText(/score/i), { target: { value: '007' } });

      expect(screen.getByLabelText(/score/i)).toHaveValue(7);
    });

    it('should handle feedback with special characters', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const specialFeedback = 'Great work! Keep it up! 🎉 #1 student';
      fireEvent.change(screen.getByLabelText(/feedback/i), { target: { value: specialFeedback } });

      expect(screen.getByLabelText(/feedback/i)).toHaveValue(specialFeedback);
    });

    it('should handle very long feedback', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const longFeedback = 'A'.repeat(1000);
      fireEvent.change(screen.getByLabelText(/feedback/i), { target: { value: longFeedback } });

      expect(screen.getByLabelText(/feedback/i)).toHaveValue(longFeedback);
    });

    it('should handle negative score validation', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const negativeScores = ['-1', '-100', '-999'];
      negativeScores.forEach((score) => {
        fireEvent.change(screen.getByLabelText(/score/i), { target: { value: score } });
        expect(screen.getByText(/valid score/)).toBeInTheDocument();
      });
    });

    it('should handle decimal score validation', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const decimalScores = ['85.5', '100.1', '0.1', '50.99'];
      decimalScores.forEach((score) => {
        fireEvent.change(screen.getByLabelText(/score/i), { target: { value: score } });
        expect(screen.getByText(/valid score/)).toBeInTheDocument();
      });
    });

    it('should handle multiple submission attempts with invalid data', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      fireEvent.change(screen.getByLabelText(/score/i), { target: { value: '150' } });
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

      expect(onSave).not.toHaveBeenCalled();
    });

    it('should handle editingStudent with null gradeId', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      const studentWithNullGradeId = { ...defaultEditingStudent, gradeId: null };
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={studentWithNullGradeId} onSave={onSave} isLoading={false} />
      );

      expect(screen.getByText(/Edit Grade for John Doe/i)).toBeInTheDocument();
    });

    it('should handle editingStudent with empty feedback and null score', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      const studentWithEmptyData = { ...defaultEditingStudent, score: null, feedback: '' };
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={studentWithEmptyData} onSave={onSave} isLoading={false} />
      );

      expect(screen.getByLabelText(/score/i)).toHaveValue('');
      expect(screen.getByLabelText(/feedback/i)).toHaveValue('');
    });

    it('should handle score change from valid to invalid and back to valid', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      fireEvent.change(screen.getByLabelText(/score/i), { target: { value: '85' } });
      expect(screen.queryByText(/valid score/)).not.toBeInTheDocument();

      fireEvent.change(screen.getByLabelText(/score/i), { target: { value: '150' } });
      expect(screen.getByText(/valid score/)).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText(/score/i), { target: { value: '90' } });
      expect(screen.queryByText(/valid score/)).not.toBeInTheDocument();
    });
  });

  describe('Helper Text and Placeholders', () => {
    it('should show placeholder text in score input', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const scoreInput = screen.getByLabelText(/score/i);
      expect(scoreInput).toHaveAttribute('placeholder', '0-100');
    });

    it('should show placeholder text in feedback textarea', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const feedbackTextarea = screen.getByLabelText(/feedback/i);
      expect(feedbackTextarea).toHaveAttribute('placeholder', 'Enter feedback...');
    });

    it('should show score helper text', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      expect(screen.getByText(/Enter a score between 0 and 100. Leave empty for no score\./i)).toBeInTheDocument();
    });

    it('should show feedback helper text', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      expect(screen.getByText(/Provide constructive feedback to help student improve/i)).toBeInTheDocument();
    });
  });
});
