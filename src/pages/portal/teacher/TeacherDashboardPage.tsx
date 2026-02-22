import { PageHeader } from '@/components/PageHeader';
import { DashboardStatCard } from '@/components/dashboard/DashboardStatCard';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardListCard } from '@/components/dashboard/DashboardListCard';
import { AnnouncementItem } from '@/components/dashboard/AnnouncementItem';
import { TeacherGradeListItem } from '@/components/dashboard/TeacherGradeListItem';
import { BookCopy, Megaphone, Award } from 'lucide-react';
import { SlideUp } from '@/components/animations';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useTeacherDashboard } from '@/hooks/useTeacher';
import { useAuthStore } from '@/lib/authStore';
import type { TeacherDashboardData } from '@shared/types';

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
              <DashboardListCard
                title="Recent Grades"
                icon={<Award className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
                items={data.recentGrades}
                emptyMessage="No recent grades recorded."
                renderItem={(grade) => (
                  <TeacherGradeListItem
                    studentName={grade.studentName}
                    courseName={grade.courseName}
                    score={grade.score}
                  />
                )}
                getKey={(grade) => grade.id}
                listClassName="space-y-2"
                itemAriaLabel={(count) => `${count} recent grades`}
              />
            </SlideUp>
            <SlideUp delay={0.4} style={prefersReducedMotion ? { opacity: 1 } : {}}>
              <DashboardListCard
                title="Recent Announcements"
                icon={<Megaphone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
                items={data.recentAnnouncements}
                emptyMessage="No announcements available."
                renderItem={(ann) => <AnnouncementItem announcement={ann} variant="simple" />}
                getKey={(ann) => ann.id}
                listClassName="space-y-2"
              />
            </SlideUp>
          </div>
        </SlideUp>
      )}
    </DashboardLayout>
  );
}