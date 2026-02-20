import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/PageHeader';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AnnouncementItem } from '@/components/dashboard/AnnouncementItem';
import { Award, CalendarCheck, Megaphone } from 'lucide-react';
import { SlideUp } from '@/components/animations';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useParentDashboard } from '@/hooks/useParent';
import { useAuthStore } from '@/lib/authStore';
import { getGradeColorClass, getGradeLetter } from '@/utils/grades';
import type { ParentDashboardData } from '@shared/types';

const GradeItem = memo(({ grade }: { grade: ParentDashboardData['childGrades'][0] }) => {
  const isPassing = grade.score >= 70;
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

const ScheduleItem = memo(({ item }: { item: ParentDashboardData['childSchedule'][0] }) => (
  <li className="text-sm">
    <p className="font-medium">{item.courseName}</p>
    <p className="text-xs text-muted-foreground">
      {item.time} - {item.day}
    </p>
  </li>
));
ScheduleItem.displayName = 'ScheduleItem';

export function ParentDashboardPage() {
  const prefersReducedMotion = useReducedMotion();
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, error } = useParentDashboard(user?.id || '');

  return (
    <DashboardLayout<ParentDashboardData> isLoading={isLoading} error={error} data={data}>
      {(data) => (
        <SlideUp delay={0} className="space-y-6" style={prefersReducedMotion ? { opacity: 1 } : {}}>
          <SlideUp delay={0.1} style={prefersReducedMotion ? { opacity: 1 } : {}}>
            <PageHeader
              title="Parent Dashboard"
              description={
                <>Monitoring academic progress for <span className="font-semibold">{data.child.name}</span>.</>
              }
            />
          </SlideUp>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" role="region" aria-label="Parent dashboard overview">
            <SlideUp delay={0.2} style={prefersReducedMotion ? { opacity: 1 } : {}}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle id="grades-heading" className="text-sm font-medium">Recent Grades</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </CardHeader>
                  <CardContent>
                    {data.childGrades.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4" role="status">No grades recorded yet.</p>
                    ) : (
                      <ul className="space-y-3" aria-labelledby="grades-heading" aria-label={`${data.childGrades.length} recent grades`}>
                        {data.childGrades.map((grade) => (
                          <GradeItem key={grade.id} grade={grade} />
                        ))}
                      </ul>
                    )}
                  </CardContent>
              </Card>
            </SlideUp>
            <SlideUp delay={0.3} style={prefersReducedMotion ? { opacity: 1 } : {}}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle id="schedule-heading" className="text-sm font-medium">Child's Schedule</CardTitle>
                  <CalendarCheck className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </CardHeader>
                  <CardContent>
                    {data.childSchedule.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4" role="status">No schedule available.</p>
                    ) : (
                      <ul className="space-y-2" aria-labelledby="schedule-heading" aria-label={`${Math.min(data.childSchedule.length, 5)} scheduled classes`}>
                        {data.childSchedule.slice(0, 5).map((item) => (
                          <ScheduleItem key={`${item.courseId}-${item.time}`} item={item} />
                        ))}
                      </ul>
                    )}
                  </CardContent>
              </Card>
            </SlideUp>
            <SlideUp delay={0.4} style={prefersReducedMotion ? { opacity: 1 } : {}}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle id="announcements-heading" className="text-sm font-medium">School Announcements</CardTitle>
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
        </SlideUp>
      )}
    </DashboardLayout>
  );
}