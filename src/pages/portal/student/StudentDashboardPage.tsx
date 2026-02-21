import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/PageHeader';
import { SlideUp } from '@/components/animations';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AnnouncementItem } from '@/components/dashboard/AnnouncementItem';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { Clock, BookOpen, Megaphone } from 'lucide-react';
import { useStudentDashboard } from '@/hooks/useStudent';
import { useAuthStore } from '@/lib/authStore';
import type { StudentDashboardData } from '@shared/types';
import { getGradeColorClass, getGradeLetter } from '@/utils/grades';
import { GRADE_C_THRESHOLD } from '@/constants/grades';
import { DashboardDisplayLimits } from '@/config/dashboard';
import { memo } from 'react';

const ScheduleItem = memo(({ item }: { item: StudentDashboardData['schedule'][0] }) => (
  <li className="flex items-start">
    <div className="text-sm font-semibold w-24">{item.time}</div>
    <div className="text-sm">
      <p className="font-medium">{item.courseName}</p>
      <p className="text-xs text-muted-foreground">{item.teacherName}</p>
    </div>
  </li>
));
ScheduleItem.displayName = 'ScheduleItem';

const GradeItem = memo(({ grade }: { grade: StudentDashboardData['recentGrades'][0] }) => {
  const isPassing = grade.score >= GRADE_C_THRESHOLD;
  return (
    <li className="flex items-center justify-between">
      <p className="text-sm font-medium">{grade.courseName}</p>
      <Badge className={`text-white ${getGradeColorClass(grade.score)}`}>
        <span className="sr-only">{isPassing ? 'Passing grade: ' : 'Failing grade: '}</span>
        {getGradeLetter(grade.score)} ({grade.score})
      </Badge>
    </li>
  );
});
GradeItem.displayName = 'GradeItem';

export function StudentDashboardPage() {
  const prefersReducedMotion = useReducedMotion();
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, error } = useStudentDashboard(user?.id || '');

  return (
    <DashboardLayout<StudentDashboardData> isLoading={isLoading} error={error} data={data}>
      {(data) => (
        <SlideUp delay={0} style={prefersReducedMotion ? { opacity: 1 } : {}}>
          <div className="space-y-6">
            <SlideUp delay={0.1} style={prefersReducedMotion ? { opacity: 1 } : {}}>
              <PageHeader 
                title="Student Dashboard" 
                description="Here's a summary of your academic activities."
              />
            </SlideUp>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" role="region" aria-label="Student dashboard overview">
              <SlideUp delay={0.2} style={prefersReducedMotion ? { opacity: 1 } : {}}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle id="schedule-heading" className="text-sm font-medium">Today's Schedule</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </CardHeader>
                  <CardContent>
                    {data.schedule.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4" role="status">No classes scheduled for today.</p>
                    ) : (
                      <ul className="space-y-3" aria-labelledby="schedule-heading" aria-label={`${data.schedule.length} scheduled classes`}>
                        {data.schedule.slice(0, DashboardDisplayLimits.SCHEDULE_ITEMS_STUDENT).map((item) => (
                          <ScheduleItem key={`${item.courseId}-${item.time}`} item={item} />
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </SlideUp>
              <SlideUp delay={0.3} style={prefersReducedMotion ? { opacity: 1 } : {}}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle id="grades-heading" className="text-sm font-medium">Recent Grades</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </CardHeader>
                  <CardContent>
                    {data.recentGrades.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4" role="status">No grades recorded yet.</p>
                    ) : (
                      <ul className="space-y-3" aria-labelledby="grades-heading" aria-label={`${data.recentGrades.length} recent grades`}>
                        {data.recentGrades.map((grade) => (
                          <GradeItem key={grade.id} grade={grade} />
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </SlideUp>
              <SlideUp delay={0.4} style={prefersReducedMotion ? { opacity: 1 } : {}}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle id="announcements-heading" className="text-sm font-medium">Announcements</CardTitle>
                    <Megaphone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </CardHeader>
                  <CardContent>
                    {data.announcements.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4" role="status">No announcements available.</p>
                    ) : (
                      <ul className="space-y-3" aria-labelledby="announcements-heading" aria-label={`${data.announcements.length} announcements`}>
                        {data.announcements.map((ann) => (
                          <AnnouncementItem key={ann.id} announcement={ann} variant="simple" />
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </SlideUp>
            </div>
          </div>
        </SlideUp>
      )}
    </DashboardLayout>
  );
}
