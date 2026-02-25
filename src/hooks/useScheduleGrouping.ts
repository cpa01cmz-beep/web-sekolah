import { useMemo } from 'react'
import { SCHEDULE_DAYS, type ScheduleDay } from '@shared/types'

interface ScheduleItemBase {
  day: ScheduleDay
}

export function useScheduleGrouping<T extends ScheduleItemBase>(
  schedule: T[]
): Record<ScheduleDay, T[]> {
  return useMemo(() => {
    const grouped: Record<ScheduleDay, T[]> = SCHEDULE_DAYS.reduce(
      (acc, day) => ({ ...acc, [day]: [] }),
      {} as Record<ScheduleDay, T[]>
    )
    schedule.forEach(item => {
      if (grouped[item.day]) {
        grouped[item.day].push(item)
      }
    })
    return grouped
  }, [schedule])
}
