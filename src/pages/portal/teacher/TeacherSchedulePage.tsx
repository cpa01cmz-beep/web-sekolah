import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CalendarDays } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SlideUp } from '@/components/animations';
import { ScheduleSkeleton } from '@/components/ui/loading-skeletons';
import { useTeacherSchedule } from '@/hooks/useTeacher';
import { useScheduleGrouping } from '@/hooks/useScheduleGrouping';
import { useAuthStore } from '@/lib/authStore';

export function TeacherSchedulePage() {
  const user = useAuthStore((state) => state.user);
  const { data: schedule = [], isLoading, error } = useTeacherSchedule(user?.id || '');

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
      <PageHeader 
        title="Teaching Schedule" 
        description="View your weekly teaching schedule across all assigned classes."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.entries(scheduleByDay).map(([day, lessons], index) => (
          <SlideUp key={day} delay={index * 0.1}>
            <Card className="h-full hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" aria-hidden="true" />
                  {day}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lessons.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Waktu</TableHead>
                        <TableHead>Mata Pelajaran</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lessons.map((lesson, lessonIndex) => (
                        <TableRow key={lessonIndex}>
                          <TableCell className="font-mono text-xs">{lesson.time}</TableCell>
                          <TableCell>
                            <p className="font-medium">{lesson.courseName}</p>
                            <p className="text-xs text-muted-foreground">{lesson.className}</p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Tidak ada jadwal</p>
                )}
              </CardContent>
            </Card>
          </SlideUp>
        ))}
      </div>
    </SlideUp>
  );
}
