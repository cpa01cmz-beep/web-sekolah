import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { DashboardSkeleton } from '@/components/ui/loading-skeletons';
import { PageHeader } from '@/components/PageHeader';
import { Award, CalendarCheck, Megaphone, AlertTriangle, Inbox } from 'lucide-react';
import { SlideUp } from '@/components/animations';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useParentDashboard } from '@/hooks/useParent';
import { useAuthStore } from '@/lib/authStore';
import { formatDate } from '@/utils/date';
import { getGradeBadgeVariant, getGradeLetter } from '@/utils/grades';
import type { ParentDashboardData } from '@shared/types';

const GradeItem = memo(({ grade }: { grade: ParentDashboardData['childGrades'][0] }) => {
  const isPassing = grade.score >= 70;
  return (
    <li className="flex items-center justify-between">
      <p className="text-sm font-medium">{grade.courseName}</p>
      <Badge variant={getGradeBadgeVariant(grade.score)}>
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

const AnnouncementItem = memo(({ ann }: { ann: ParentDashboardData['announcements'][0] }) => (
  <li className="text-sm">
    <p className="font-medium truncate">{ann.title}</p>
    <p className="text-xs text-muted-foreground">{formatDate(ann.date)}</p>
  </li>
));
AnnouncementItem.displayName = 'AnnouncementItem';

export function ParentDashboardPage() {
  const prefersReducedMotion = useReducedMotion();
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, error } = useParentDashboard(user?.id || '');

  if (isLoading) return <DashboardSkeleton />;
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load dashboard data. Please try again later.</AlertDescription>
      </Alert>
    );
  }
  if (!data) {
    return (
      <EmptyState
        icon={Inbox}
        title="No data available"
        description="We couldn't find any data for your dashboard. Please try again later or contact support if issue persists."
        variant="error"
      />
    );
  }

  return (
    <SlideUp delay={0} className="space-y-6" style={prefersReducedMotion ? { opacity: 1 } : {}}>
      <SlideUp delay={0.1} style={prefersReducedMotion ? { opacity: 1 } : {}}>
        <PageHeader
          title="Parent Dashboard"
          description={
            <>Monitoring academic progress for <span className="font-semibold">{data.child.name}</span>.</>
          }
        />
      </SlideUp>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SlideUp delay={0.2} style={prefersReducedMotion ? { opacity: 1 } : {}}>
          <Card className="h-full hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Grades</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
              <CardContent>
                {data.childGrades.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No grades recorded yet.</p>
                ) : (
                  <ul className="space-y-3">
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
              <CardTitle className="text-sm font-medium">Child's Schedule</CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
              <CardContent>
                {data.childSchedule.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No schedule available.</p>
                ) : (
                  <ul className="space-y-2">
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
              <CardTitle className="text-sm font-medium">School Announcements</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
              <CardContent>
                {data.announcements.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No announcements available.</p>
                ) : (
                  <ul className="space-y-3">
                    {data.announcements.map((ann) => (
                      <AnnouncementItem key={ann.id} ann={ann} />
                    ))}
                  </ul>
                )}
              </CardContent>
          </Card>
        </SlideUp>
      </div>
    </SlideUp>
  );
}