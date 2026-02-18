import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { DashboardSkeleton } from '@/components/ui/loading-skeletons';
import { PageHeader } from '@/components/PageHeader';
import { SlideUp } from '@/components/animations';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { Clock, BookOpen, Megaphone, AlertTriangle, Inbox } from 'lucide-react';
import { useStudentDashboard } from '@/hooks/useStudent';
import { useAuthStore } from '@/lib/authStore';
import type { StudentDashboardData } from '@shared/types';
import { formatDate } from '@/utils/date';
import { getGradeLetter } from '@/utils/grades';
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
  const isPassing = grade.score >= 70;
  return (
    <li className="flex items-center justify-between">
      <p className="text-sm font-medium">{grade.courseName}</p>
      <Badge className={isPassing ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
        <span className="sr-only">{isPassing ? 'Passing grade: ' : 'Failing grade: '}</span>
        {getGradeLetter(grade.score)} ({grade.score})
      </Badge>
    </li>
  );
});
GradeItem.displayName = 'GradeItem';

const AnnouncementItem = memo(({ ann }: { ann: StudentDashboardData['announcements'][0] }) => (
  <li className="text-sm">
    <p className="font-medium truncate">{ann.title}</p>
    <p className="text-xs text-muted-foreground">{formatDate(ann.date)}</p>
  </li>
));
AnnouncementItem.displayName = 'AnnouncementItem';

export function StudentDashboardPage() {
  const prefersReducedMotion = useReducedMotion();
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, error } = useStudentDashboard(user?.id || '');

  if (isLoading) return <DashboardSkeleton />;
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
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
    <SlideUp delay={0} style={prefersReducedMotion ? { opacity: 1 } : {}}>
      <div className="space-y-6">
        <SlideUp delay={0.1} style={prefersReducedMotion ? { opacity: 1 } : {}}>
          <PageHeader 
            title="Student Dashboard" 
            description="Here's a summary of your academic activities."
          />
        </SlideUp>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <SlideUp delay={0.2} style={prefersReducedMotion ? { opacity: 1 } : {}}>
            <Card className="h-full hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Schedule</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {data.schedule.slice(0, 3).map((item) => (
                    <ScheduleItem key={`${item.courseId}-${item.time}`} item={item} />
                  ))}
                </ul>
              </CardContent>
            </Card>
          </SlideUp>
          <SlideUp delay={0.3} style={prefersReducedMotion ? { opacity: 1 } : {}}>
            <Card className="h-full hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Grades</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {data.recentGrades.map((grade) => (
                    <GradeItem key={grade.id} grade={grade} />
                  ))}
                </ul>
              </CardContent>
            </Card>
          </SlideUp>
          <SlideUp delay={0.4} style={prefersReducedMotion ? { opacity: 1 } : {}}>
            <Card className="h-full hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Announcements</CardTitle>
                <Megaphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {data.announcements.map((ann) => (
                    <AnnouncementItem key={ann.id} ann={ann} />
                  ))}
                </ul>
              </CardContent>
            </Card>
          </SlideUp>
        </div>
      </div>
    </SlideUp>
  );
}
