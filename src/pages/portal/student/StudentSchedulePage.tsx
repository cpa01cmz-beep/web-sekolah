import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SlideUp } from '@/components/animations';
import { ScheduleSkeleton } from '@/components/ui/loading-skeletons';
import { ScheduleGrid } from '@/components/dashboard/ScheduleGrid';
import { useStudentSchedule } from '@/hooks/useStudent';
import { useScheduleGrouping } from '@/hooks/useScheduleGrouping';
import { useAuthStore } from '@/lib/authStore';

export function StudentSchedulePage() {
  const user = useAuthStore((state) => state.user);
  const { data: schedule = [], isLoading, error } = useStudentSchedule(user?.id || '');

  const scheduleByDay = useScheduleGrouping(schedule);

  if (isLoading) return (
    <SlideUp className="space-y-6">
      <Skeleton className="h-9 w-1/3" />
      <ScheduleSkeleton />
    </SlideUp>
  );

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load schedule data. Please try again later.</AlertDescription>
      </Alert>
    );
  }

  return (
    <SlideUp className="space-y-6">
      <PageHeader title="Jadwal Pelajaran" />
      <ScheduleGrid
        groupedSchedule={scheduleByDay}
        renderLessonDetails={(lesson) => (
          <>
            <p className="font-medium">{lesson.courseName}</p>
            <p className="text-xs text-muted-foreground">{lesson.teacherName}</p>
          </>
        )}
      />
    </SlideUp>
  );
}