import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardListCard } from '../DashboardListCard';
import { Bell } from 'lucide-react';

interface TestItem {
  id: string;
  name: string;
}

describe('DashboardListCard', () => {
  const mockItems: TestItem[] = [
    { id: '1', name: 'Item One' },
    { id: '2', name: 'Item Two' },
    { id: '3', name: 'Item Three' },
  ];

  it('renders title and icon', () => {
    const { container } = render(
      <DashboardListCard
        title="Test Card"
        icon={<Bell className="h-4 w-4" aria-hidden="true" />}
        items={mockItems}
        emptyMessage="No items"
        renderItem={(item) => <span>{item.name}</span>}
        getKey={(item) => item.id}
      />
    );

    expect(screen.getByText('Test Card')).toBeInTheDocument();
    const svg = container.querySelector('svg[aria-hidden="true"]');
    expect(svg).toBeInTheDocument();
  });

  it('renders list of items', () => {
    render(
      <DashboardListCard
        title="Test Card"
        icon={<Bell className="h-4 w-4" aria-hidden="true" />}
        items={mockItems}
        emptyMessage="No items"
        renderItem={(item) => <span>{item.name}</span>}
        getKey={(item) => item.id}
      />
    );

    expect(screen.getByText('Item One')).toBeInTheDocument();
    expect(screen.getByText('Item Two')).toBeInTheDocument();
    expect(screen.getByText('Item Three')).toBeInTheDocument();
  });

  it('renders empty message when no items', () => {
    render(
      <DashboardListCard
        title="Test Card"
        icon={<Bell className="h-4 w-4" aria-hidden="true" />}
        items={[]}
        emptyMessage="No items available"
        renderItem={(item) => <span>{item.name}</span>}
        getKey={(item) => item.id}
      />
    );

    expect(screen.getByText('No items available')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('renders list with correct aria attributes', () => {
    render(
      <DashboardListCard
        title="Notifications"
        icon={<Bell className="h-4 w-4" aria-hidden="true" />}
        items={mockItems}
        emptyMessage="No items"
        renderItem={(item) => <span>{item.name}</span>}
        getKey={(item) => item.id}
      />
    );

    const list = screen.getByRole('list');
    expect(list).toHaveAttribute('aria-labelledby', 'notifications-heading');
    expect(list).toHaveAttribute('aria-label', '3 items');
  });

  it('uses custom aria label function', () => {
    render(
      <DashboardListCard
        title="Notifications"
        icon={<Bell className="h-4 w-4" aria-hidden="true" />}
        items={mockItems}
        emptyMessage="No items"
        renderItem={(item) => <span>{item.name}</span>}
        getKey={(item) => item.id}
        itemAriaLabel={(count) => `${count} notifications`}
      />
    );

    const list = screen.getByRole('list');
    expect(list).toHaveAttribute('aria-label', '3 notifications');
  });

  it('uses custom title id', () => {
    render(
      <DashboardListCard
        title="Notifications"
        icon={<Bell className="h-4 w-4" aria-hidden="true" />}
        items={mockItems}
        emptyMessage="No items"
        renderItem={(item) => <span>{item.name}</span>}
        getKey={(item) => item.id}
        titleId="custom-title-id"
      />
    );

    const title = screen.getByText('Notifications');
    expect(title).toHaveAttribute('id', 'custom-title-id');
  });

  it('applies custom className', () => {
    const { container } = render(
      <DashboardListCard
        title="Test Card"
        icon={<Bell className="h-4 w-4" aria-hidden="true" />}
        items={mockItems}
        emptyMessage="No items"
        renderItem={(item) => <span>{item.name}</span>}
        getKey={(item) => item.id}
        className="custom-card-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-card-class');
  });

  it('applies custom listClassName', () => {
    render(
      <DashboardListCard
        title="Test Card"
        icon={<Bell className="h-4 w-4" aria-hidden="true" />}
        items={mockItems}
        emptyMessage="No items"
        renderItem={(item) => <span>{item.name}</span>}
        getKey={(item) => item.id}
        listClassName="custom-list-class space-y-4"
      />
    );

    const list = screen.getByRole('list');
    expect(list).toHaveClass('custom-list-class');
    expect(list).toHaveClass('space-y-4');
  });

  it('handles null icon', () => {
    render(
      <DashboardListCard
        title="Test Card"
        icon={null}
        items={mockItems}
        emptyMessage="No items"
        renderItem={(item) => <span>{item.name}</span>}
        getKey={(item) => item.id}
      />
    );

    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Item One')).toBeInTheDocument();
  });

  it('generates title id from title when not provided', () => {
    render(
      <DashboardListCard
        title="Recent Announcements"
        icon={<Bell className="h-4 w-4" aria-hidden="true" />}
        items={mockItems}
        emptyMessage="No items"
        renderItem={(item) => <span>{item.name}</span>}
        getKey={(item) => item.id}
      />
    );

    const title = screen.getByText('Recent Announcements');
    expect(title).toHaveAttribute('id', 'recent-announcements-heading');
  });
});
