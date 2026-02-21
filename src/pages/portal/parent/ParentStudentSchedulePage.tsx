import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { SlideUp } from '@/components/animations';
import { ScheduleSkeleton } from '@/components/ui/loading-skeletons';
import { ScheduleGrid } from '@/components/dashboard/ScheduleGrid';
import { useAuthStore } from '@/lib/authStore';
import { useChildSchedule } from '@/hooks/useParent';
import { useScheduleGrouping } from '@/hooks/useScheduleGrouping';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function ParentStudentSchedulePage() {
  const user = useAuthStore((state) => state.user);
  const parentId = user?.id ?? '';

  const { data: scheduleData = [], isLoading, error, refetch } = useChildSchedule(parentId);

  const groupedSchedule = useScheduleGrouping(scheduleData);

  if (isLoading) {
    return (
      <SlideUp className="space-y-6">
        <Skeleton className="h-9 w-1/3" />
        <ScheduleSkeleton />
      </SlideUp>
    );
  }

  if (error) {
    return (
      <SlideUp className="space-y-6">
        <PageHeader
          title="Jadwal Pelajaran Anak Anda"
          description="Gagal memuat jadwal"
        />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Gagal memuat jadwal pelajaran. Silakan coba lagi.</AlertDescription>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Coba Lagi
          </Button>
        </Alert>
      </SlideUp>
    );
  }

  return (
    <SlideUp className="space-y-6">
      <PageHeader
        title="Jadwal Pelajaran Anak Anda"
        description="Berikut adalah jadwal pelajaran mingguan."
      />
      <ScheduleGrid
        groupedSchedule={groupedSchedule}
        renderLessonDetails={(lesson) => (
          <p className="font-medium">{lesson.courseId}</p>
        )}
      />
    </SlideUp>
  );
}
