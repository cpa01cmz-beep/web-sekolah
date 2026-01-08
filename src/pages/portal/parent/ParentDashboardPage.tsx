import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { DashboardSkeleton } from '@/components/ui/loading-skeletons';
import { PageHeader } from '@/components/PageHeader';
import { Award, CalendarCheck, Megaphone, UserCheck, AlertTriangle, Inbox } from 'lucide-react';
import { SlideUp } from '@/components/animations';
import { useParentDashboard } from '@/hooks/useParent';
import { useAuthStore } from '@/lib/authStore';
import type { Grade } from '@shared/types';

export function ParentDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, error } = useParentDashboard(user?.id || '');

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

  const getGradeBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 80) return 'secondary';
    if (score >= 70) return 'outline';
    return 'destructive';
  };

  const getGradeLetter = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  return (
    <SlideUp delay={0} className="space-y-6">
      <SlideUp delay={0.1}>
        <PageHeader
          title="Parent Dashboard"
          description={
            <>Monitoring academic progress for <span className="font-semibold">{data.childName}</span>.</>
          }
        />
      </SlideUp>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SlideUp delay={0.2}>
          <Card className="h-full hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Grades</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {data.childGrades.map((grade, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <p className="text-sm font-medium">{grade.courseId}</p>
                    <Badge variant={getGradeBadgeVariant(grade.score)} className="bg-green-500 text-white">
                      {getGradeLetter(grade.score)} ({grade.score})
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </SlideUp>
        <SlideUp delay={0.3}>
          <Card className="h-full hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Child's Schedule</CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.childSchedule.slice(0, 5).map((item, index) => (
                  <li key={index} className="text-sm">
                    <p className="font-medium">{item.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.time} - {item.day}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </SlideUp>
        <SlideUp delay={0.4}>
          <Card className="h-full hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">School Announcements</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {data.recentAnnouncements.map((ann, index) => (
                  <li key={index} className="text-sm">
                    <p className="font-medium truncate">{ann.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(ann.date).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </SlideUp>
      </div>
    </SlideUp>
  );
}