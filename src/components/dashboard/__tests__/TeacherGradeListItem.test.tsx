import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeacherGradeListItem } from '../TeacherGradeListItem';

describe('TeacherGradeListItem', () => {
  it('renders student name', () => {
    render(
      <TeacherGradeListItem
        studentName="John Doe"
        courseName="Mathematics"
        score={85}
      />
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders course name and score', () => {
    render(
      <TeacherGradeListItem
        studentName="John Doe"
        courseName="Mathematics"
        score={85}
      />
    );
    expect(screen.getByText(/Mathematics/)).toBeInTheDocument();
    expect(screen.getByText(/85/)).toBeInTheDocument();
  });

  it('renders with low score', () => {
    render(
      <TeacherGradeListItem
        studentName="Jane Doe"
        courseName="Science"
        score={45}
      />
    );
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText(/Science/)).toBeInTheDocument();
    expect(screen.getByText(/45/)).toBeInTheDocument();
  });

  it('renders with perfect score', () => {
    render(
      <TeacherGradeListItem
        studentName="Bob Smith"
        courseName="History"
        score={100}
      />
    );
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    expect(screen.getByText(/History/)).toBeInTheDocument();
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });
});
