import { memo } from 'react';

interface ScheduleListItemBase {
  time: string;
  courseName: string;
}

interface ScheduleListItemProps {
  item: ScheduleListItemBase;
  showTeacher?: boolean;
  teacherName?: string;
  showDay?: boolean;
  day?: string;
}

export const ScheduleListItem = memo(function ScheduleListItem({
  item,
  showTeacher = false,
  teacherName,
  showDay = false,
  day,
}: ScheduleListItemProps) {
  return (
    <div className="flex items-start">
      <div className="text-sm font-semibold w-24">{item.time}</div>
      <div className="text-sm">
        <p className="font-medium">{item.courseName}</p>
        {showTeacher && teacherName && (
          <p className="text-xs text-muted-foreground">{teacherName}</p>
        )}
        {showDay && day && (
          <p className="text-xs text-muted-foreground">{day}</p>
        )}
      </div>
    </div>
  );
});
