import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GradeListItem } from '@/components/dashboard/GradeListItem';

describe('GradeListItem', () => {
  describe('Rendering', () => {
    it('should render course name', () => {
      render(<GradeListItem courseName="Mathematics" score={85} />);

      expect(screen.getByText('Mathematics')).toBeInTheDocument();
    });

    it('should render score in badge', () => {
      render(<GradeListItem courseName="Science" score={90} />);

      expect(screen.getByText(/90/)).toBeInTheDocument();
    });

    it('should render grade letter A for score 90+', () => {
      render(<GradeListItem courseName="Physics" score={95} />);

      expect(screen.getByText(/A \(/)).toBeInTheDocument();
    });

    it('should render grade letter B for score 80-89', () => {
      render(<GradeListItem courseName="Chemistry" score={85} />);

      expect(screen.getByText(/B \(/)).toBeInTheDocument();
    });

    it('should render grade letter C for score 70-79', () => {
      render(<GradeListItem courseName="Biology" score={75} />);

      expect(screen.getByText(/C \(/)).toBeInTheDocument();
    });

    it('should render grade letter D for score 60-69', () => {
      render(<GradeListItem courseName="History" score={65} />);

      expect(screen.getByText(/D \(/)).toBeInTheDocument();
    });

    it('should render grade letter F for score below 60', () => {
      render(<GradeListItem courseName="Geography" score={45} />);

      expect(screen.getByText(/F \(/)).toBeInTheDocument();
    });
  });

  describe('Passing/Failing Indication', () => {
    it('should indicate passing grade for score 70+', () => {
      const { container } = render(<GradeListItem courseName="English" score={75} />);

      expect(container.querySelector('.sr-only')).toHaveTextContent('Passing grade:');
    });

    it('should indicate passing grade for score exactly 70', () => {
      const { container } = render(<GradeListItem courseName="Art" score={70} />);

      expect(container.querySelector('.sr-only')).toHaveTextContent('Passing grade:');
    });

    it('should indicate failing grade for score below 70', () => {
      const { container } = render(<GradeListItem courseName="Music" score={65} />);

      expect(container.querySelector('.sr-only')).toHaveTextContent('Failing grade:');
    });

    it('should indicate failing grade for score 0', () => {
      const { container } = render(<GradeListItem courseName="PE" score={0} />);

      expect(container.querySelector('.sr-only')).toHaveTextContent('Failing grade:');
    });
  });

  describe('Accessibility', () => {
    it('should have screen reader text for grade status', () => {
      const { container } = render(<GradeListItem courseName="Math" score={80} />);

      expect(container.querySelector('.sr-only')).toBeInTheDocument();
    });

    it('should render as list item', () => {
      const { container } = render(<GradeListItem courseName="Math" score={85} />);

      expect(container.querySelector('li')).toBeInTheDocument();
    });

    it('should have course name visible', () => {
      render(<GradeListItem courseName="Mathematics" score={90} />);

      expect(screen.getByText('Mathematics')).toBeVisible();
    });
  });

  describe('Edge Cases', () => {
    it('should handle score of 0', () => {
      render(<GradeListItem courseName="Test Course" score={0} />);

      expect(screen.getByText(/0\)/)).toBeInTheDocument();
      expect(screen.getByText(/F \(/)).toBeInTheDocument();
    });

    it('should handle score of 100', () => {
      render(<GradeListItem courseName="Perfect Score" score={100} />);

      expect(screen.getByText(/100/)).toBeInTheDocument();
      expect(screen.getByText(/A \(/)).toBeInTheDocument();
    });

    it('should handle long course name', () => {
      const longName = 'Advanced Placement Computer Science Principles';
      render(<GradeListItem courseName={longName} score={85} />);

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('should handle boundary score 89', () => {
      render(<GradeListItem courseName="Test" score={89} />);

      expect(screen.getByText(/B \(89\)/)).toBeInTheDocument();
    });

    it('should handle boundary score 90', () => {
      render(<GradeListItem courseName="Test" score={90} />);

      expect(screen.getByText(/A \(90\)/)).toBeInTheDocument();
    });

    it('should handle boundary score 79', () => {
      render(<GradeListItem courseName="Test" score={79} />);

      expect(screen.getByText(/C \(79\)/)).toBeInTheDocument();
    });

    it('should handle boundary score 80', () => {
      render(<GradeListItem courseName="Test" score={80} />);

      expect(screen.getByText(/B \(80\)/)).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have font-medium class on course name', () => {
      const { container } = render(<GradeListItem courseName="Math" score={85} />);

      expect(container.querySelector('.font-medium')).toHaveTextContent('Math');
    });

    it('should have text-sm class on course name', () => {
      const { container } = render(<GradeListItem courseName="Math" score={85} />);

      expect(container.querySelector('.text-sm.font-medium')).toBeInTheDocument();
    });

    it('should have flex layout for item', () => {
      const { container } = render(<GradeListItem courseName="Math" score={85} />);

      expect(container.querySelector('li.flex')).toBeInTheDocument();
    });

    it('should have justify-between class', () => {
      const { container } = render(<GradeListItem courseName="Math" score={85} />);

      expect(container.querySelector('.justify-between')).toBeInTheDocument();
    });
  });

  describe('Memoization', () => {
    it('should be memoized to prevent unnecessary re-renders', () => {
      const { rerender } = render(<GradeListItem courseName="Math" score={85} />);

      rerender(<GradeListItem courseName="Math" score={85} />);

      expect(screen.getByText('Math')).toBeInTheDocument();
      expect(screen.getByText(/85/)).toBeInTheDocument();
    });
  });
});
