import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { SlideUp } from '@/components/animations';
import { CardSkeleton } from '@/components/ui/loading-skeletons';
import { useAuthStore } from '@/lib/authStore';
import { useChildSchedule } from '@/hooks/useParent';
import { AlertTriangle, RefreshCw } from 'lucide-react';

type ScheduleItem = {
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat';
  time: string;
  courseId: string;
};

const groupByDay = (schedule: ScheduleItem[]) => {
  return schedule.reduce((acc, item) => {
    const day = item.day;
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {} as Record<string, ScheduleItem[]>);
};

export function ParentStudentSchedulePage() {
  const user = useAuthStore((state) => state.user);
  const parentId = user?.id ?? '';

  const { data: scheduleData, isLoading, error, refetch } = useChildSchedule(parentId);

  if (isLoading) {
    return (
      <SlideUp className="space-y-6">
        <PageHeader
          title="Jadwal Pelajaran Anak Anda"
          description="Memuat jadwal pelajaran..."
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} lines={4} />
          ))}
        </div>
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

  const groupedSchedule = scheduleData ? groupByDay(scheduleData) : {};

  return (
    <SlideUp className="space-y-6">
      <PageHeader
        title="Jadwal Pelajaran Anak Anda"
        description="Berikut adalah jadwal pelajaran mingguan."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.entries(groupedSchedule).map(([day, lessons], index) => (
          <SlideUp key={day} delay={index * 0.1}>
            <Card className="h-full hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle>{day}</CardTitle>
              </CardHeader>
              <CardContent>
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
                          <p className="font-medium">{lesson.courseId}</p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </SlideUp>
        ))}
      </div>
    </SlideUp>
  );
}
