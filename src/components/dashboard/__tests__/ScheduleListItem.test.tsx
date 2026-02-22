import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScheduleListItem } from '../ScheduleListItem';

describe('ScheduleListItem', () => {
  const baseItem = {
    time: '08:00',
    courseName: 'Mathematics',
  };

  it('renders time and course name', () => {
    render(<ScheduleListItem item={baseItem} />);
    expect(screen.getByText('08:00')).toBeInTheDocument();
    expect(screen.getByText('Mathematics')).toBeInTheDocument();
  });

  it('renders teacher name when showTeacher is true', () => {
    render(
      <ScheduleListItem
        item={baseItem}
        showTeacher
        teacherName="Mr. Smith"
      />
    );
    expect(screen.getByText('Mr. Smith')).toBeInTheDocument();
  });

  it('does not render teacher name when showTeacher is false', () => {
    render(
      <ScheduleListItem
        item={baseItem}
        showTeacher={false}
        teacherName="Mr. Smith"
      />
    );
    expect(screen.queryByText('Mr. Smith')).not.toBeInTheDocument();
  });

  it('renders day when showDay is true', () => {
    render(
      <ScheduleListItem
        item={baseItem}
        showDay
        day="Senin"
      />
    );
    expect(screen.getByText('Senin')).toBeInTheDocument();
  });

  it('does not render day when showDay is false', () => {
    render(
      <ScheduleListItem
        item={baseItem}
        showDay={false}
        day="Senin"
      />
    );
    expect(screen.queryByText('Senin')).not.toBeInTheDocument();
  });

  it('renders both teacher and day when both are enabled', () => {
    render(
      <ScheduleListItem
        item={baseItem}
        showTeacher
        teacherName="Mr. Smith"
        showDay
        day="Senin"
      />
    );
    expect(screen.getByText('Mr. Smith')).toBeInTheDocument();
    expect(screen.getByText('Senin')).toBeInTheDocument();
  });
});
