import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useScheduleGrouping } from '../useScheduleGrouping'

interface ScheduleItem {
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat'
  subject: string
}

describe('useScheduleGrouping', () => {
  it('should return empty arrays for all days when schedule is empty', () => {
    const { result } = renderHook(() => useScheduleGrouping<ScheduleItem>([]))

    expect(result.current.Senin).toEqual([])
    expect(result.current.Selasa).toEqual([])
    expect(result.current.Rabu).toEqual([])
    expect(result.current.Kamis).toEqual([])
    expect(result.current.Jumat).toEqual([])
  })

  it('should group schedule items by day', () => {
    const schedule: ScheduleItem[] = [
      { day: 'Senin', subject: 'Math' },
      { day: 'Senin', subject: 'English' },
      { day: 'Selasa', subject: 'Science' },
      { day: 'Rabu', subject: 'History' },
      { day: 'Kamis', subject: 'Art' },
      { day: 'Jumat', subject: 'PE' },
    ]

    const { result } = renderHook(() => useScheduleGrouping(schedule))

    expect(result.current.Senin).toHaveLength(2)
    expect(result.current.Senin).toContainEqual({ day: 'Senin', subject: 'Math' })
    expect(result.current.Senin).toContainEqual({ day: 'Senin', subject: 'English' })
    expect(result.current.Selasa).toHaveLength(1)
    expect(result.current.Selasa).toContainEqual({ day: 'Selasa', subject: 'Science' })
    expect(result.current.Rabu).toHaveLength(1)
    expect(result.current.Kamis).toHaveLength(1)
    expect(result.current.Jumat).toHaveLength(1)
  })

  it('should return new array references when schedule changes', () => {
    const schedule1: ScheduleItem[] = [{ day: 'Senin', subject: 'Math' }]
    const schedule2: ScheduleItem[] = [{ day: 'Selasa', subject: 'English' }]

    const { result, rerender } = renderHook(({ schedule }) => useScheduleGrouping(schedule), {
      initialProps: { schedule: schedule1 },
    })

    const seninResult = result.current.Senin

    rerender({ schedule: schedule2 })

    expect(result.current.Senin).toEqual([])
    expect(result.current.Selasa).toHaveLength(1)
  })

  it('should handle items with only some days', () => {
    const schedule: ScheduleItem[] = [
      { day: 'Senin', subject: 'Math' },
      { day: 'Rabu', subject: 'Science' },
      { day: 'Jumat', subject: 'Art' },
    ]

    const { result } = renderHook(() => useScheduleGrouping(schedule))

    expect(result.current.Senin).toHaveLength(1)
    expect(result.current.Selasa).toHaveLength(0)
    expect(result.current.Rabu).toHaveLength(1)
    expect(result.current.Kamis).toHaveLength(0)
    expect(result.current.Jumat).toHaveLength(1)
  })

  it('should preserve order of items within each day', () => {
    const schedule: ScheduleItem[] = [
      { day: 'Senin', subject: 'First' },
      { day: 'Senin', subject: 'Second' },
      { day: 'Senin', subject: 'Third' },
    ]

    const { result } = renderHook(() => useScheduleGrouping(schedule))

    expect(result.current.Senin[0].subject).toBe('First')
    expect(result.current.Senin[1].subject).toBe('Second')
    expect(result.current.Senin[2].subject).toBe('Third')
  })

  it('should use memoization to avoid unnecessary recalculations', () => {
    const schedule: ScheduleItem[] = [{ day: 'Senin', subject: 'Math' }]

    const { result, rerender } = renderHook(() => useScheduleGrouping(schedule))

    const firstResult = result.current

    rerender({ schedule })

    expect(result.current).toBe(firstResult)
  })
})
