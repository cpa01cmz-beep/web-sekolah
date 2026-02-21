import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardCardEmptyState } from '@/components/dashboard/DashboardCardEmptyState';

describe('DashboardCardEmptyState', () => {
  describe('Rendering', () => {
    it('should render message text', () => {
      render(<DashboardCardEmptyState message="No data available" />);

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('should render with long message', () => {
      const longMessage = 'There are no announcements available at this time. Please check back later.';
      render(<DashboardCardEmptyState message={longMessage} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should render with empty message', () => {
      const { container } = render(<DashboardCardEmptyState message="" />);

      const element = container.querySelector('[role="status"]');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have text-sm class', () => {
      const { container } = render(<DashboardCardEmptyState message="Empty" />);

      expect(container.querySelector('.text-sm')).toBeInTheDocument();
    });

    it('should have text-muted-foreground class', () => {
      const { container } = render(<DashboardCardEmptyState message="Empty" />);

      expect(container.querySelector('.text-muted-foreground')).toBeInTheDocument();
    });

    it('should have text-center class', () => {
      const { container } = render(<DashboardCardEmptyState message="Empty" />);

      expect(container.querySelector('.text-center')).toBeInTheDocument();
    });

    it('should have py-4 class for padding', () => {
      const { container } = render(<DashboardCardEmptyState message="Empty" />);

      expect(container.querySelector('.py-4')).toBeInTheDocument();
    });

    it('should apply custom className when provided', () => {
      const { container } = render(
        <DashboardCardEmptyState message="Empty" className="custom-class" />
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('should merge custom className with default classes', () => {
      const { container } = render(
        <DashboardCardEmptyState message="Empty" className="custom-class another-class" />
      );

      expect(container.querySelector('.custom-class.another-class')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have role="status" for screen readers', () => {
      const { container } = render(<DashboardCardEmptyState message="No data" />);

      expect(container.querySelector('[role="status"]')).toBeInTheDocument();
    });

    it('should be visible', () => {
      render(<DashboardCardEmptyState message="No data" />);

      expect(screen.getByText('No data')).toBeVisible();
    });
  });

  describe('Memoization', () => {
    it('should have displayName for React DevTools', () => {
      expect(DashboardCardEmptyState.displayName).toBe('DashboardCardEmptyState');
    });

    it('should be memoized to prevent unnecessary re-renders', () => {
      const { rerender } = render(<DashboardCardEmptyState message="Empty" />);

      rerender(<DashboardCardEmptyState message="Empty" />);

      expect(screen.getByText('Empty')).toBeInTheDocument();
    });
  });
});
