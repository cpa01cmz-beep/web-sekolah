import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { DashboardSkeleton } from '@/components/ui/loading-skeletons';
import { PageHeader } from '@/components/PageHeader';
import { Clock, BookCopy, Megaphone, Users, AlertTriangle, Inbox } from 'lucide-react';
import { SlideUp } from '@/components/animations';
import { useTeacherDashboard } from '@/hooks/useTeacher';
import { useAuthStore } from '@/lib/authStore';
import { formatDate } from '@/utils/date';

export function TeacherDashboardPage() {
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
    <SlideUp delay={0} className="space-y-6">
      <SlideUp delay={0.1}>
        <PageHeader
          title="Teacher Dashboard"
          description={`Welcome back, ${data.name}! Here's a summary of your teaching activities and announcements.`}
        />
      </SlideUp>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SlideUp delay={0.2}>
          <Card className="h-full hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Classes</CardTitle>
              <BookCopy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{data.totalClasses}</div>
              <p className="text-xs text-muted-foreground">Total students: {data.totalStudents}</p>
            </CardContent>
          </Card>
        </SlideUp>
        <SlideUp delay={0.3}>
          <Card className="h-full hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Grades</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.recentGrades.map((grade, index) => (
                  <li key={index} className="text-sm">
                    <p className="font-medium">{grade.studentId}</p>
                    <p className="text-xs text-muted-foreground">
                      Score: {grade.score} - {grade.courseId}
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
              <CardTitle className="text-sm font-medium">Recent Announcements</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.recentAnnouncements.map((ann, index) => (
                  <li key={index} className="text-sm">
                    <p className="font-medium truncate">{ann.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(ann.date)}</p>
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