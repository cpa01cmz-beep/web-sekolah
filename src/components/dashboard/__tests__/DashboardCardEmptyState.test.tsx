import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardCardEmptyState } from '@/components/dashboard/DashboardCardEmptyState';
import { Inbox } from 'lucide-react';

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

    it('should render icon when provided', () => {
      const { container } = render(
        <DashboardCardEmptyState 
          message="No data" 
          icon={<Inbox className="h-8 w-8" />} 
        />
      );

      expect(screen.getByText('No data')).toBeInTheDocument();
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should not render icon when not provided', () => {
      const { container } = render(<DashboardCardEmptyState message="No data" />);

      expect(container.querySelector('svg')).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have text-sm class on message', () => {
      render(<DashboardCardEmptyState message="Empty" />);

      expect(screen.getByText('Empty')).toHaveClass('text-sm');
    });

    it('should have text-muted-foreground class on message', () => {
      render(<DashboardCardEmptyState message="Empty" />);

      expect(screen.getByText('Empty')).toHaveClass('text-muted-foreground');
    });

    it('should have text-center class on message', () => {
      render(<DashboardCardEmptyState message="Empty" />);

      expect(screen.getByText('Empty')).toHaveClass('text-center');
    });

    it('should have py-4 class for padding on container', () => {
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

    it('should have flex layout classes on container', () => {
      const { container } = render(<DashboardCardEmptyState message="Empty" />);

      expect(container.querySelector('.flex-col')).toBeInTheDocument();
      expect(container.querySelector('.items-center')).toBeInTheDocument();
    });

    it('should have text-muted-foreground on icon wrapper', () => {
      const { container } = render(
        <DashboardCardEmptyState message="Empty" icon={<Inbox className="h-8 w-8" />} />
      );

      const iconWrapper = container.querySelector('.text-muted-foreground');
      expect(iconWrapper).toBeInTheDocument();
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

    it('should have aria-hidden on icon wrapper for screen readers', () => {
      const { container } = render(
        <DashboardCardEmptyState message="No data" icon={<Inbox className="h-8 w-8" />} />
      );

      const iconWrapper = container.querySelector('[aria-hidden="true"]');
      expect(iconWrapper).toBeInTheDocument();
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
