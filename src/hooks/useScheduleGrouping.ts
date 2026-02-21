import { useMemo } from 'react';

const SCHEDULE_DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'] as const;
type ScheduleDay = (typeof SCHEDULE_DAYS)[number];

interface ScheduleItemBase {
  day: ScheduleDay;
}

export function useScheduleGrouping<T extends ScheduleItemBase>(
  schedule: T[]
): Record<string, T[]> {
  return useMemo(() => {
    const grouped: Record<string, T[]> = {
      Senin: [],
      Selasa: [],
      Rabu: [],
      Kamis: [],
      Jumat: [],
    };
    schedule.forEach((item) => {
      if (grouped[item.day]) {
        grouped[item.day].push(item);
      }
    });
    return grouped;
  }, [schedule]);
}
