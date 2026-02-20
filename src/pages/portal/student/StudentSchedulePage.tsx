import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SlideUp } from '@/components/animations';
import { ScheduleSkeleton } from '@/components/ui/loading-skeletons';
import { useStudentSchedule } from '@/hooks/useStudent';
import { useAuthStore } from '@/lib/authStore';
import { useMemo } from 'react';

const WEEKDAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'] as const;

export function StudentSchedulePage() {
  const user = useAuthStore((state) => state.user);
  const { data: schedule = [], isLoading, error } = useStudentSchedule(user?.id || '');

  const scheduleByDay = useMemo(() => {
    const grouped: Record<string, typeof schedule> = {
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

  if (isLoading) return (
    <SlideUp className="space-y-6">
      <Skeleton className="h-9 w-1/3" />
      <ScheduleSkeleton days={WEEKDAYS} />
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
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.entries(scheduleByDay).map(([day, lessons], index) => (
          <SlideUp key={day} delay={index * 0.1}>
            <Card className="h-full hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle>{day}</CardTitle>
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
                            <p className="text-xs text-muted-foreground">{lesson.teacherName}</p>
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