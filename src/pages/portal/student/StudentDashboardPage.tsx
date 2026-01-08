import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { DashboardSkeleton } from '@/components/ui/loading-skeletons';
import { PageHeader } from '@/components/PageHeader';
import { SlideUp } from '@/components/animations';
import { Clock, BookOpen, Megaphone, AlertTriangle, Inbox } from 'lucide-react';
import { useStudentDashboard } from '@/hooks/useStudent';
import { useAuthStore } from '@/lib/authStore';
import type { StudentDashboardData } from '@shared/types';
import { formatDate } from '@/utils/date';

export function StudentDashboardPage() {
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
    <SlideUp delay={0}>
      <div className="space-y-6">
        <SlideUp delay={0.1}>
          <PageHeader 
            title="Student Dashboard" 
            description="Here's a summary of your academic activities."
          />
        </SlideUp>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <SlideUp delay={0.2}>
            <Card className="h-full hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Schedule</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {data.schedule.slice(0, 3).map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="text-sm font-semibold w-24">{item.time}</div>
                      <div className="text-sm">
                        <p className="font-medium">{item.courseName}</p>
                        <p className="text-xs text-muted-foreground">{item.teacherName}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </SlideUp>
          <SlideUp delay={0.3}>
            <Card className="h-full hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Grades</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {data.recentGrades.map((grade, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <p className="text-sm font-medium">{grade.courseName}</p>
                      <Badge className="bg-green-500 text-white">
                        {grade.score}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </SlideUp>
          <SlideUp delay={0.4}>
            <Card className="h-full hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Announcements</CardTitle>
                <Megaphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {data.announcements.map((ann, index) => (
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
      </div>
    </SlideUp>
  );
}
