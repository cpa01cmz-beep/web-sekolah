import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SlideUp } from '@/components/animations';
import { CalendarDays } from 'lucide-react';

interface ScheduleItemBase {
  time: string;
}

interface ScheduleGridProps<T extends ScheduleItemBase> {
  groupedSchedule: Record<string, T[]>;
  renderLessonDetails: (lesson: T) => React.ReactNode;
  showCalendarIcon?: boolean;
  emptyMessage?: string;
}

function ScheduleGridComponent<T extends ScheduleItemBase>({
  groupedSchedule,
  renderLessonDetails,
  showCalendarIcon = false,
  emptyMessage = 'Tidak ada jadwal',
}: ScheduleGridProps<T>) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {Object.entries(groupedSchedule).map(([day, lessons], index) => (
        <SlideUp key={day} delay={index * 0.1}>
          <Card className="h-full hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className={showCalendarIcon ? 'flex items-center gap-2' : ''}>
                {showCalendarIcon && <CalendarDays className="h-5 w-5" aria-hidden="true" />}
                {day}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lessons.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead scope="col">Waktu</TableHead>
                      <TableHead scope="col">Mata Pelajaran</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lessons.map((lesson, lessonIndex) => (
                      <TableRow key={lessonIndex}>
                        <TableCell className="font-mono text-xs">{lesson.time}</TableCell>
                        <TableCell>{renderLessonDetails(lesson)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">{emptyMessage}</p>
              )}
            </CardContent>
          </Card>
        </SlideUp>
      ))}
    </div>
  );
}

export const ScheduleGrid = memo(ScheduleGridComponent) as typeof ScheduleGridComponent;
