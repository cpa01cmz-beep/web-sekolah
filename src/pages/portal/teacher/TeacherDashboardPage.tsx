import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/PageHeader';
import { DashboardStatCard } from '@/components/dashboard/DashboardStatCard';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AnnouncementItem } from '@/components/dashboard/AnnouncementItem';
import { DashboardCardEmptyState } from '@/components/dashboard/DashboardCardEmptyState';
import { BookCopy, Megaphone, Award } from 'lucide-react';
import { SlideUp } from '@/components/animations';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useTeacherDashboard } from '@/hooks/useTeacher';
import { useAuthStore } from '@/lib/authStore';
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

export function TeacherDashboardPage() {
  const prefersReducedMotion = useReducedMotion();
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, error } = useTeacherDashboard(user?.id || '');

  return (
    <DashboardLayout<TeacherDashboardData> isLoading={isLoading} error={error} data={data}>
      {(data) => (
        <SlideUp delay={0} className="space-y-6" style={prefersReducedMotion ? { opacity: 1 } : {}}>
          <SlideUp delay={0.1} style={prefersReducedMotion ? { opacity: 1 } : {}}>
            <PageHeader
              title="Teacher Dashboard"
              description={`Welcome back, ${data.name}! Here's a summary of your teaching activities and announcements.`}
            />
          </SlideUp>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" role="region" aria-label="Teacher dashboard overview">
            <SlideUp delay={0.2} style={prefersReducedMotion ? { opacity: 1 } : {}}>
              <DashboardStatCard
                title="Your Classes"
                value={data.totalClasses.toString()}
                icon={<BookCopy className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
                subtitle={`Total students: ${data.totalStudents}`}
                valueSize="3xl"
              />
            </SlideUp>
            <SlideUp delay={0.3} style={prefersReducedMotion ? { opacity: 1 } : {}}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle id="grades-heading" className="text-sm font-medium">Recent Grades</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  {data.recentGrades.length === 0 ? (
                    <DashboardCardEmptyState message="No recent grades recorded." />
                  ) : (
                    <ul className="space-y-2" aria-labelledby="grades-heading" aria-label={`${data.recentGrades.length} recent grades`}>
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
                  <CardTitle id="announcements-heading" className="text-sm font-medium">Recent Announcements</CardTitle>
                  <Megaphone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  {data.recentAnnouncements.length === 0 ? (
                    <DashboardCardEmptyState message="No announcements available." />
                  ) : (
                    <ul className="space-y-2" aria-labelledby="announcements-heading" aria-label={`${data.recentAnnouncements.length} announcements`}>
                      {data.recentAnnouncements.map((ann) => (
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