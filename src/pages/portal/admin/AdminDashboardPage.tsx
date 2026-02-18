import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { DashboardSkeleton } from '@/components/ui/loading-skeletons';
import { PageHeader } from '@/components/PageHeader';
import { DashboardStatCard } from '@/components/dashboard/DashboardStatCard';
import { AnnouncementItem } from '@/components/dashboard/AnnouncementItem';
import { EnrollmentChart } from '@/components/dashboard/EnrollmentChart';
import { Users, GraduationCap, School, Megaphone, AlertTriangle, Inbox } from 'lucide-react';
import { SlideUp } from '@/components/animations';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useAdminDashboard } from '@/hooks/useAdmin';

export function AdminDashboardPage() {
  const prefersReducedMotion = useReducedMotion();
  const { data, isLoading, error } = useAdminDashboard();

  const stats = useMemo(() => data ? [
    {
      title: 'Total Students',
      value: data.totalStudents.toString(),
      icon: <Users className="h-6 w-6 text-blue-500" />,
    },
    {
      title: 'Total Teachers',
      value: data.totalTeachers.toString(),
      icon: <GraduationCap className="h-6 w-6 text-green-500" />,
    },
    {
      title: 'Total Parents',
      value: data.totalParents.toString(),
      icon: <School className="h-6 w-6 text-purple-500" />,
    },
    {
      title: 'Total Classes',
      value: data.totalClasses.toString(),
      icon: <Megaphone className="h-6 w-6 text-orange-500" />,
    },
  ] : [], [data]);

  const enrollmentData = useMemo(() => data ? [
    { name: 'Students', students: data.userDistribution.students },
    { name: 'Teachers', students: data.userDistribution.teachers },
    { name: 'Parents', students: data.userDistribution.parents },
    { name: 'Admins', students: data.userDistribution.admins },
  ] : [], [data]);

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
          title="Admin Dashboard"
          description="Overall school management and statistics."
        />
      </SlideUp>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <SlideUp key={stat.title} delay={index * 0.1 + 0.2} style={prefersReducedMotion ? { opacity: 1 } : {}}>
            <DashboardStatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
            />
          </SlideUp>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <SlideUp delay={0.6} className="lg:col-span-3" style={prefersReducedMotion ? { opacity: 1 } : {}}>
          <Card className="h-[400px] hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <EnrollmentChart data={enrollmentData} />
            </CardContent>
          </Card>
        </SlideUp>
        <SlideUp delay={0.7} className="lg:col-span-2" style={prefersReducedMotion ? { opacity: 1 } : {}}>
          <Card className="h-[400px] hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
            </CardHeader>
              <CardContent>
                {data.recentAnnouncements.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No announcements available.</p>
                ) : (
                  <ul className="space-y-4">
                    {data.recentAnnouncements.map((ann) => (
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
