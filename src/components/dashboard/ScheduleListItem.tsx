import { memo } from 'react'

export interface ScheduleListItemProps {
  courseName: string
  time: string
  teacherName?: string
  day?: string
}

export const ScheduleListItem = memo(function ScheduleListItem({
  courseName,
  time,
  teacherName,
  day,
}: ScheduleListItemProps) {
  if (teacherName) {
    return (
      <li className="flex items-start">
        <div className="text-sm font-semibold w-24">{time}</div>
        <div className="text-sm">
          <p className="font-medium">{courseName}</p>
          <p className="text-xs text-muted-foreground">{teacherName}</p>
        </div>
      </li>
    )
  }

  return (
    <li className="text-sm">
      <p className="font-medium">{courseName}</p>
      <p className="text-xs text-muted-foreground">
        {time}
        {day ? ` - ${day}` : ''}
      </p>
    </li>
  )
})
