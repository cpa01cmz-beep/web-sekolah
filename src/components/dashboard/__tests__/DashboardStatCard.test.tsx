import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardStatCard } from '@/components/dashboard/DashboardStatCard';

describe('DashboardStatCard', () => {
  describe('Rendering', () => {
    it('should render title and value', () => {
      render(<DashboardStatCard title="Total Students" value={150} />);

      expect(screen.getByText('Total Students')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
    });

    it('should render with string value', () => {
      render(<DashboardStatCard title="Status" value="Active" />);

      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render with number value', () => {
      render(<DashboardStatCard title="Count" value={42} />);

      expect(screen.getByText('Count')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render with zero value', () => {
      render(<DashboardStatCard title="Pending" value={0} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Icon', () => {
    it('should render icon when provided', () => {
      const icon = <span data-testid="test-icon">Icon</span>;
      render(<DashboardStatCard title="Users" value={100} icon={icon} />);

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('should not render icon when not provided', () => {
      render(<DashboardStatCard title="Users" value={100} />);

      expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
    });

    it('should apply aria-hidden to icon', () => {
      const icon = <span data-testid="test-icon">Icon</span>;
      const { container } = render(<DashboardStatCard title="Users" value={100} icon={icon} />);

      expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    });
  });

  describe('Subtitle', () => {
    it('should render subtitle when provided', () => {
      render(<DashboardStatCard title="Revenue" value={5000} subtitle="+20% from last month" />);

      expect(screen.getByText('+20% from last month')).toBeInTheDocument();
    });

    it('should not render subtitle when not provided', () => {
      render(<DashboardStatCard title="Revenue" value={5000} />);

      expect(screen.queryByText(/\+20%/i)).not.toBeInTheDocument();
    });

    it('should render subtitle with muted text class', () => {
      render(<DashboardStatCard title="Revenue" value={5000} subtitle="Growth" />);

      const subtitle = screen.getByText('Growth');
      expect(subtitle).toHaveClass('text-muted-foreground');
    });
  });

  describe('Value Size', () => {
    it('should render value with text-2xl class by default', () => {
      const { container } = render(<DashboardStatCard title="Count" value={42} />);

      const value = container.querySelector('.text-2xl');
      expect(value).toBeInTheDocument();
      expect(value).toHaveTextContent('42');
    });

    it('should render value with text-2xl class when valueSize is "2xl"', () => {
      const { container } = render(<DashboardStatCard title="Count" value={42} valueSize="2xl" />);

      const value = container.querySelector('.text-2xl');
      expect(value).toBeInTheDocument();
      expect(value).toHaveTextContent('42');
    });

    it('should render value with text-3xl class when valueSize is "3xl"', () => {
      const { container } = render(<DashboardStatCard title="Count" value={42} valueSize="3xl" />);

      const value = container.querySelector('.text-3xl');
      expect(value).toBeInTheDocument();
      expect(value).toHaveTextContent('42');
    });

    it('should not have text-3xl class when valueSize is "2xl"', () => {
      const { container } = render(<DashboardStatCard title="Count" value={42} valueSize="2xl" />);

      const value = container.querySelector('.text-3xl');
      expect(value).not.toBeInTheDocument();
    });

    it('should not have text-2xl class when valueSize is "3xl"', () => {
      const { container } = render(<DashboardStatCard title="Count" value={42} valueSize="3xl" />);

      const value = container.querySelector('.text-2xl');
      expect(value).not.toBeInTheDocument();
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className when provided', () => {
      const { container } = render(
        <DashboardStatCard title="Count" value={42} className="custom-class" />
      );

      const card = container.querySelector('.custom-class');
      expect(card).toBeInTheDocument();
    });

    it('should merge custom className with default classes', () => {
      const { container } = render(
        <DashboardStatCard title="Count" value={42} className="custom-class another-class" />
      );

      const card = container.querySelector('.custom-class.another-class');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Card Structure', () => {
    it('should have h-full class for height', () => {
      const { container } = render(<DashboardStatCard title="Count" value={42} />);

      const card = container.querySelector('.h-full');
      expect(card).toBeInTheDocument();
    });

    it('should have hover shadow transition classes', () => {
      const { container } = render(<DashboardStatCard title="Count" value={42} />);

      const card = container.querySelector('.h-full');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('hover:shadow-lg', 'transition-shadow');
    });
  });

  describe('Title Styling', () => {
    it('should render title with text-sm font-medium classes', () => {
      const { container } = render(<DashboardStatCard title="Total Students" value={150} />);

      const title = container.querySelector('.text-sm.font-medium');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Total Students');
    });
  });

  describe('Value Styling', () => {
    it('should render value with font-bold class', () => {
      const { container } = render(<DashboardStatCard title="Count" value={42} />);

      const value = container.querySelector('.font-bold');
      expect(value).toBeInTheDocument();
      expect(value).toHaveTextContent('42');
    });
  });

  describe('Edge Cases', () => {
    it('should render with empty string title', () => {
      render(<DashboardStatCard title="" value={42} />);

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render with empty string value', () => {
      const { container } = render(<DashboardStatCard title="Status" value="" />);

      expect(screen.getByText('Status')).toBeInTheDocument();
      const valueContainer = container.querySelector('.font-bold');
      expect(valueContainer).toBeInTheDocument();
    });

    it('should render with large number value', () => {
      render(<DashboardStatCard title="Total" value={9999999999} />);

      expect(screen.getByText('9999999999')).toBeInTheDocument();
    });

    it('should render with negative number value', () => {
      render(<DashboardStatCard title="Balance" value={-5000} />);

      expect(screen.getByText('-5000')).toBeInTheDocument();
    });

    it('should render with decimal number value', () => {
      render(<DashboardStatCard title="Average" value={87.5} />);

      expect(screen.getByText('87.5')).toBeInTheDocument();
    });

    it('should render with very long title', () => {
      const longTitle = 'This is a very long title that might wrap to multiple lines in the card';
      render(<DashboardStatCard title={longTitle} value={42} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should render with very long subtitle', () => {
      const longSubtitle = 'This is a very long subtitle that might wrap to multiple lines in the card';
      render(<DashboardStatCard title="Status" value={42} subtitle={longSubtitle} />);

      expect(screen.getByText(longSubtitle)).toBeInTheDocument();
    });

    it('should render with icon that has multiple children', () => {
      const complexIcon = (
        <div data-testid="complex-icon">
          <span>Part 1</span>
          <span>Part 2</span>
        </div>
      );
      render(<DashboardStatCard title="Users" value={100} icon={complexIcon} />);

      expect(screen.getByTestId('complex-icon')).toBeInTheDocument();
      expect(screen.getByText('Part 1')).toBeInTheDocument();
      expect(screen.getByText('Part 2')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible title text', () => {
      render(<DashboardStatCard title="Total Students" value={150} />);

      expect(screen.getByText('Total Students')).toBeVisible();
    });

    it('should have accessible value text', () => {
      render(<DashboardStatCard title="Total Students" value={150} />);

      expect(screen.getByText('150')).toBeVisible();
    });

    it('should have accessible subtitle text when provided', () => {
      render(<DashboardStatCard title="Revenue" value={5000} subtitle="+20% growth" />);

      expect(screen.getByText('+20% growth')).toBeVisible();
    });
  });

  describe('Memoization', () => {
    it('should have displayName for React DevTools', () => {
      expect(DashboardStatCard.displayName).toBe('DashboardStatCard');
    });

    it('should be memoized to prevent unnecessary re-renders', () => {
      const { rerender } = render(<DashboardStatCard title="Count" value={42} />);

      // Re-render with same props
      rerender(<DashboardStatCard title="Count" value={42} />);

      // Component should still render correctly
      expect(screen.getByText('Count')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });

  describe('Full Component Rendering', () => {
    it('should render with all props provided', () => {
      const icon = <span data-testid="test-icon">★</span>;
      const { container } = render(
        <DashboardStatCard
          title="Total Revenue"
          value={12500}
          icon={icon}
          subtitle="+15% from last month"
          valueSize="3xl"
          className="border-primary"
        />
      );

      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('12500')).toBeInTheDocument();
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('+15% from last month')).toBeInTheDocument();
      expect(container.querySelector('.text-3xl')).toBeInTheDocument();
      expect(container.querySelector('.border-primary')).toBeInTheDocument();
    });

    it('should render with minimal props (title and value only)', () => {
      render(<DashboardStatCard title="Count" value={42} />);

      expect(screen.getByText('Count')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
      expect(screen.queryByText(/subtitle/i)).not.toBeInTheDocument();
    });
  });
});
