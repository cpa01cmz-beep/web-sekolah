import { memo } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { SlideUp } from '@/components/animations'
import { ScheduleGrid } from '@/components/dashboard/ScheduleGrid'
import { ScheduleLayout } from '@/components/dashboard/ScheduleLayout'
import { useStudentSchedule } from '@/hooks/useStudent'
import { useScheduleGrouping } from '@/hooks/useScheduleGrouping'
import { useAuthStore } from '@/stores/authStore'
import type { ScheduleItem } from '@shared/types'

const StudentScheduleContent = memo(function StudentScheduleContent({
  schedule,
}: {
  schedule: ScheduleItem[]
}) {
  const scheduleByDay = useScheduleGrouping(schedule)
  return (
    <SlideUp className="space-y-6">
      <PageHeader title="Jadwal Pelajaran" />
      <ScheduleGrid
        groupedSchedule={scheduleByDay}
        timeColumnLabel="Waktu"
        subjectColumnLabel="Mata Pelajaran"
        emptyMessage="Tidak ada jadwal"
        renderLessonDetails={lesson => (
          <>
            <p className="font-medium">{lesson.courseName}</p>
            <p className="text-xs text-muted-foreground">{lesson.teacherName}</p>
          </>
        )}
      />
    </SlideUp>
  )
})

export function StudentSchedulePage() {
  const user = useAuthStore(state => state.user)
  const { data: schedule, isLoading, error } = useStudentSchedule(user?.id || '')

  return (
    <ScheduleLayout<ScheduleItem[] | undefined> isLoading={isLoading} error={error} data={schedule}>
      {data => <StudentScheduleContent schedule={data || []} />}
    </ScheduleLayout>
  )
}
