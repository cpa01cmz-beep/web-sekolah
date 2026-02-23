import { memo } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { SlideUp } from '@/components/animations'
import { ScheduleGrid } from '@/components/dashboard/ScheduleGrid'
import { ScheduleLayout } from '@/components/dashboard/ScheduleLayout'
import { useTeacherSchedule } from '@/hooks/useTeacher'
import { useScheduleGrouping } from '@/hooks/useScheduleGrouping'
import { useAuthStore } from '@/lib/authStore'
import type { TeacherScheduleItem } from '@shared/types'

const TeacherScheduleContent = memo(function TeacherScheduleContent({
  schedule,
}: {
  schedule: TeacherScheduleItem[]
}) {
  const scheduleByDay = useScheduleGrouping(schedule)
  return (
    <SlideUp className="space-y-6">
      <PageHeader
        title="Teaching Schedule"
        description="View your weekly teaching schedule across all assigned classes."
      />
      <ScheduleGrid
        groupedSchedule={scheduleByDay}
        showCalendarIcon
        renderLessonDetails={lesson => (
          <>
            <p className="font-medium">{lesson.courseName}</p>
            <p className="text-xs text-muted-foreground">{lesson.className}</p>
          </>
        )}
      />
    </SlideUp>
  )
})

export function TeacherSchedulePage() {
  const user = useAuthStore(state => state.user)
  const { data: schedule, isLoading, error } = useTeacherSchedule(user?.id || '')

  return (
    <ScheduleLayout<TeacherScheduleItem[] | undefined>
      isLoading={isLoading}
      error={error}
      data={schedule}
    >
      {data => <TeacherScheduleContent schedule={data || []} />}
    </ScheduleLayout>
  )
}
