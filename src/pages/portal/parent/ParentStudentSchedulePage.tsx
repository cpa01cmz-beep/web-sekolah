import { PageHeader } from '@/components/PageHeader';
import { SlideUp } from '@/components/animations';
import { ScheduleGrid } from '@/components/dashboard/ScheduleGrid';
import { ScheduleLayout } from '@/components/dashboard/ScheduleLayout';
import { useAuthStore } from '@/stores/authStore';
import { useChildSchedule } from '@/hooks/useParent';
import { useScheduleGrouping } from '@/hooks/useScheduleGrouping';
import type { ScheduleItem } from '@shared/types';

function ParentScheduleContent({ schedule }: { schedule: ScheduleItem[] }) {
  const groupedSchedule = useScheduleGrouping(schedule);
  return (
    <SlideUp className="space-y-6">
      <PageHeader
        title="Jadwal Pelajaran Anak Anda"
        description="Berikut adalah jadwal pelajaran mingguan."
      />
      <ScheduleGrid
        groupedSchedule={groupedSchedule}
        timeColumnLabel="Waktu"
        subjectColumnLabel="Mata Pelajaran"
        emptyMessage="Tidak ada jadwal"
        renderLessonDetails={(lesson) => (
          <p className="font-medium">{lesson.courseId}</p>
        )}
      />
    </SlideUp>
  );
}

export function ParentStudentSchedulePage() {
  const user = useAuthStore((state) => state.user);
  const parentId = user?.id ?? '';

  const { data: scheduleData, isLoading, error, refetch } = useChildSchedule(parentId);

  return (
    <ScheduleLayout<ScheduleItem[] | undefined>
      isLoading={isLoading}
      error={error}
      data={scheduleData}
      onRetry={() => refetch()}
    >
      {(data) => <ParentScheduleContent schedule={data || []} />}
    </ScheduleLayout>
  );
}
