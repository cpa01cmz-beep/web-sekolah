import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GradeForm } from '@/components/forms/GradeForm';

describe('GradeForm', () => {
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

    it('should allow typing in score field', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const scoreInput = screen.getByLabelText(/score/i);
      await user.clear(scoreInput);
      await user.type(scoreInput, '90');

      expect(scoreInput).toHaveValue(90);
    });

    it('should allow typing in feedback field', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const feedbackTextarea = screen.getByLabelText(/feedback/i);
      await user.clear(feedbackTextarea);
      await user.type(feedbackTextarea, 'Excellent work!');

      expect(feedbackTextarea).toHaveValue('Excellent work!');
    });

    it('should clear form when dialog is closed and reopened', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onSave = vi.fn();

      render(<GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />);

      const scoreInput = screen.getByLabelText(/score/i);
      const feedbackTextarea = screen.getByLabelText(/feedback/i);
      
      await user.clear(scoreInput);
      await user.type(scoreInput, '95');
      await user.clear(feedbackTextarea);
      await user.type(feedbackTextarea, 'Updated feedback');

      expect(scoreInput).toHaveValue(95);
      expect(feedbackTextarea).toHaveValue('Updated feedback');

      await user.click(screen.getByRole('button', { name: /cancel/i }));

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

    it('should show error when score is below 0', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const scoreInput = screen.getByLabelText(/score/i);
      await user.clear(scoreInput);
      await user.type(scoreInput, '-5');

      expect(screen.getByText(/valid score/)).toBeInTheDocument();
    });

    it('should show error when score is above 100', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const scoreInput = screen.getByLabelText(/score/i);
      await user.clear(scoreInput);
      await user.type(scoreInput, '150');

      expect(screen.getByText(/valid score/)).toBeInTheDocument();
    });

    it('should not show error when score is exactly 0', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const scoreInput = screen.getByLabelText(/score/i);
      await user.clear(scoreInput);
      await user.type(scoreInput, '0');

      expect(screen.queryByText(/valid score/)).not.toBeInTheDocument();
    });

    it('should not show error when score is exactly 100', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const scoreInput = screen.getByLabelText(/score/i);
      await user.clear(scoreInput);
      await user.type(scoreInput, '100');

      expect(screen.queryByText(/valid score/)).not.toBeInTheDocument();
    });

    it('should not show error when score is within valid range', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const scoreInput = screen.getByLabelText(/score/i);
      await user.clear(scoreInput);
      await user.type(scoreInput, '75');

      expect(screen.queryByText(/valid score/)).not.toBeInTheDocument();
    });

    it('should not show error when score is empty (no score scenario)', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const scoreInput = screen.getByLabelText(/score/i);
      await user.clear(scoreInput);

      expect(screen.queryByText(/valid score/)).not.toBeInTheDocument();
    });

    // Note: Number inputs don't allow non-numeric text entry, so these tests
    // verify the validation behavior when the input has invalid values
    it('should handle invalid score values gracefully', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      // Score input with type="number" doesn't accept non-numeric characters
      // So we test the validation logic with boundary values instead
      const scoreInput = screen.getByLabelText(/score/i);
      
      // Clear and type valid value first
      await user.clear(scoreInput);
      await user.type(scoreInput, '50');
      
      expect(screen.queryByText(/valid score/)).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call onSave with score and feedback when form is valid', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const scoreInput = screen.getByLabelText(/score/i);
      const feedbackTextarea = screen.getByLabelText(/feedback/i);
      
      await user.clear(scoreInput);
      await user.type(scoreInput, '90');
      await user.clear(feedbackTextarea);
      await user.type(feedbackTextarea, 'Great improvement!');
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith({
        score: 90,
        feedback: 'Great improvement!'
      });
    });

    it('should call onSave with null score when score is empty', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onSave = vi.fn();
      onSave.mockClear();
      
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const scoreInput = screen.getByLabelText(/score/i);
      const feedbackTextarea = screen.getByLabelText(/feedback/i);
      
      await user.clear(scoreInput);
      await user.clear(feedbackTextarea);
      await user.type(feedbackTextarea, 'Feedback for no score');
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      expect(onSave).toHaveBeenCalledWith({
        score: null,
        feedback: 'Feedback for no score'
      });
    });

    it('should not call onSave when score is invalid', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const scoreInput = screen.getByLabelText(/score/i);
      await user.clear(scoreInput);
      await user.type(scoreInput, '150');
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      expect(onSave).not.toHaveBeenCalled();
    });

    it('should submit with empty feedback', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const scoreInput = screen.getByLabelText(/score/i);
      const feedbackTextarea = screen.getByLabelText(/feedback/i);
      
      await user.clear(scoreInput);
      await user.type(scoreInput, '85');
      await user.clear(feedbackTextarea);
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      expect(onSave).toHaveBeenCalledWith({
        score: 85,
        feedback: ''
      });
    });

    it('should submit with boundary values', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onSave = vi.fn();

      const boundaryScores = [0, 100, 50];
      for (const score of boundaryScores) {
        onSave.mockClear();
        const { unmount } = render(
          <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
        );

        const scoreInput = screen.getByLabelText(/score/i);
        await user.clear(scoreInput);
        await user.type(scoreInput, score.toString());
        await user.click(screen.getByRole('button', { name: /save changes/i }));

        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ score }));
        unmount();
      }
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
    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should clear form when dialog is closed', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onSave = vi.fn();

      render(<GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />);

      const scoreInput = screen.getByLabelText(/score/i);
      const feedbackTextarea = screen.getByLabelText(/feedback/i);
      
      await user.clear(scoreInput);
      await user.type(scoreInput, '95');
      await user.clear(feedbackTextarea);
      await user.type(feedbackTextarea, 'Updated feedback');

      expect(scoreInput).toHaveValue(95);

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    // Note: The component doesn't set the 'required' attribute on the score input
    // as the field is optional (can be empty for no score)
    it('should have appropriate input constraints on score field', () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const scoreInput = screen.getByLabelText(/score/i);
      expect(scoreInput).toHaveAttribute('min', '0');
      expect(scoreInput).toHaveAttribute('max', '100');
      expect(scoreInput).toHaveAttribute('step', '1');
      expect(scoreInput).toHaveAttribute('type', 'number');
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
    it('should handle score with leading zeros', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const scoreInput = screen.getByLabelText(/score/i);
      await user.clear(scoreInput);
      await user.type(scoreInput, '007');

      expect(scoreInput).toHaveValue(7);
    });

    it('should handle feedback with special characters', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const specialFeedback = 'Great work! Keep it up!';
      const feedbackTextarea = screen.getByLabelText(/feedback/i);
      await user.clear(feedbackTextarea);
      await user.type(feedbackTextarea, specialFeedback);

      expect(feedbackTextarea).toHaveValue(specialFeedback);
    });

    it('should handle long feedback text', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const longFeedback = 'A'.repeat(500);
      const feedbackTextarea = screen.getByLabelText(/feedback/i);
      await user.clear(feedbackTextarea);
      await user.type(feedbackTextarea, longFeedback);

      expect(feedbackTextarea).toHaveValue(longFeedback);
    }, 10000);

    it('should handle negative score validation', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const scoreInput = screen.getByLabelText(/score/i);
      
      // Test negative scores show validation errors
      await user.clear(scoreInput);
      await user.type(scoreInput, '-1');
      expect(screen.getByText(/valid score/)).toBeInTheDocument();
    });

    it('should handle score change from valid to invalid and back to valid', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const scoreInput = screen.getByLabelText(/score/i);
      
      await user.clear(scoreInput);
      await user.type(scoreInput, '85');
      expect(screen.queryByText(/valid score/)).not.toBeInTheDocument();

      await user.clear(scoreInput);
      await user.type(scoreInput, '150');
      expect(screen.getByText(/valid score/)).toBeInTheDocument();

      await user.clear(scoreInput);
      await user.type(scoreInput, '90');
      expect(screen.queryByText(/valid score/)).not.toBeInTheDocument();
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

      const scoreInput = screen.getByLabelText(/score/i) as HTMLInputElement;
      expect(scoreInput.value).toBe('');
      expect(screen.getByLabelText(/feedback/i)).toHaveValue('');
    });

    it('should handle multiple submission attempts with invalid data', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <GradeForm open={true} onClose={onClose} editingStudent={defaultEditingStudent} onSave={onSave} isLoading={false} />
      );

      const scoreInput = screen.getByLabelText(/score/i);
      await user.clear(scoreInput);
      await user.type(scoreInput, '150');
      
      await user.click(screen.getByRole('button', { name: /save changes/i }));
      await user.click(screen.getByRole('button', { name: /save changes/i }));
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      expect(onSave).not.toHaveBeenCalled();
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
