import { memo } from 'react'
import type { ScheduleItem } from '@shared/types'

interface ScheduleListItemBase extends ScheduleItem {
  courseName: string
  teacherName: string
}

interface ScheduleListItemProps {
  item: ScheduleListItemBase
  variant?: 'default' | 'compact'
}

export const ScheduleListItem = memo(function ScheduleListItem({
  item,
  variant = 'default',
}: ScheduleListItemProps) {
  if (variant === 'compact') {
    return (
      <li className="text-sm">
        <p className="font-medium">{item.courseName}</p>
        <p className="text-xs text-muted-foreground">
          {item.time} - {item.day}
        </p>
      </li>
    )
  }

  return (
    <li className="flex items-start">
      <div className="text-sm font-semibold w-24">{item.time}</div>
      <div className="text-sm">
        <p className="font-medium">{item.courseName}</p>
        <p className="text-xs text-muted-foreground">{item.teacherName}</p>
      </div>
    </li>
  )
})
