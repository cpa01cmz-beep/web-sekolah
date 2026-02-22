import { memo } from 'react';

interface TeacherGradeListItemProps {
  studentName: string;
  courseName: string;
  score: number;
}

export const TeacherGradeListItem = memo(function TeacherGradeListItem({
  studentName,
  courseName,
  score,
}: TeacherGradeListItemProps) {
  return (
    <div className="text-sm">
      <p className="font-medium">{studentName}</p>
      <p className="text-xs text-muted-foreground">
        {courseName}: Score {score}
      </p>
    </div>
  );
});
