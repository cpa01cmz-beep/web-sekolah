import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { DashboardSkeleton } from '@/components/ui/loading-skeletons';
import { PageHeader } from '@/components/PageHeader';
import { DashboardStatCard } from '@/components/dashboard/DashboardStatCard';
import { BookCopy, Megaphone, Clock, AlertTriangle, Inbox } from 'lucide-react';
import { SlideUp } from '@/components/animations';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useTeacherDashboard } from '@/hooks/useTeacher';
import { useAuthStore } from '@/lib/authStore';
import { formatDate } from '@/utils/date';
import type { TeacherDashboardData } from '@shared/types';

const GradeItem = memo(({ grade }: { grade: TeacherDashboardData['recentGrades'][0] }) => (
  <li className="text-sm">
    <p className="font-medium">{grade.studentName}</p>
    <p className="text-xs text-muted-foreground">
      {grade.courseName}: Score {grade.score}
    </p>
  </li>
));
GradeItem.displayName = 'GradeItem';

const AnnouncementItem = memo(({ ann }: { ann: TeacherDashboardData['recentAnnouncements'][0] }) => (
  <li className="text-sm">
    <p className="font-medium truncate">{ann.title}</p>
    <p className="text-xs text-muted-foreground">{formatDate(ann.date)}</p>
  </li>
));
AnnouncementItem.displayName = 'AnnouncementItem';

export function TeacherDashboardPage() {
  const prefersReducedMotion = useReducedMotion();
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, error } = useTeacherDashboard(user?.id || '');

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
    <SlideUp delay={0} className="space-y-6" style={prefersReducedMotion ? { opacity: 1 } : {}}>
      <SlideUp delay={0.1} style={prefersReducedMotion ? { opacity: 1 } : {}}>
        <PageHeader
          title="Teacher Dashboard"
          description={`Welcome back, ${data.name}! Here's a summary of your teaching activities and announcements.`}
        />
      </SlideUp>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SlideUp delay={0.2} style={prefersReducedMotion ? { opacity: 1 } : {}}>
          <DashboardStatCard
            title="Your Classes"
            value={data.totalClasses.toString()}
            icon={<BookCopy className="h-4 w-4 text-muted-foreground" />}
            subtitle={`Total students: ${data.totalStudents}`}
            valueSize="3xl"
          />
        </SlideUp>
        <SlideUp delay={0.3} style={prefersReducedMotion ? { opacity: 1 } : {}}>
          <Card className="h-full hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Grades</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
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
              <CardTitle className="text-sm font-medium">Recent Announcements</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.recentAnnouncements.map((ann) => (
                  <AnnouncementItem key={ann.id} ann={ann} />
                ))}
              </ul>
            </CardContent>
          </Card>
        </SlideUp>
      </div>
    </SlideUp>
  );
}