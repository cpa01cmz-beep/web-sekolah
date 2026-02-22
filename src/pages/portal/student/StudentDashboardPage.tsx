import { PageHeader } from '@/components/PageHeader';
import { SlideUp } from '@/components/animations';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardListCard } from '@/components/dashboard/DashboardListCard';
import { AnnouncementItem } from '@/components/dashboard/AnnouncementItem';
import { GradeListItem } from '@/components/dashboard/GradeListItem';
import { ScheduleListItem } from '@/components/dashboard/ScheduleListItem';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { Clock, BookOpen, Megaphone } from 'lucide-react';
import { useStudentDashboard } from '@/hooks/useStudent';
import { useAuthStore } from '@/lib/authStore';
import type { StudentDashboardData } from '@shared/types';

export function StudentDashboardPage() {
  const prefersReducedMotion = useReducedMotion();
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, error } = useStudentDashboard(user?.id || '');

  return (
    <DashboardLayout<StudentDashboardData> isLoading={isLoading} error={error} data={data}>
      {(data) => (
        <SlideUp delay={0} style={prefersReducedMotion ? { opacity: 1 } : {}}>
          <div className="space-y-6">
            <SlideUp delay={0.1} style={prefersReducedMotion ? { opacity: 1 } : {}}>
              <PageHeader 
                title="Student Dashboard" 
                description="Here's a summary of your academic activities."
              />
            </SlideUp>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" role="region" aria-label="Student dashboard overview">
              <SlideUp delay={0.2} style={prefersReducedMotion ? { opacity: 1 } : {}}>
                <DashboardListCard
                  title="Today's Schedule"
                  icon={<Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
                  items={data.schedule.slice(0, 3)}
                  emptyMessage="No classes scheduled for today."
                  renderItem={(item) => (
                    <ScheduleListItem item={item} showTeacher teacherName={item.teacherName} />
                  )}
                  getKey={(item) => `${item.courseId}-${item.time}`}
                  itemAriaLabel={(count) => `${count} scheduled classes`}
                />
              </SlideUp>
              <SlideUp delay={0.3} style={prefersReducedMotion ? { opacity: 1 } : {}}>
                <DashboardListCard
                  title="Recent Grades"
                  icon={<BookOpen className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
                  items={data.recentGrades}
                  emptyMessage="No grades recorded yet."
                  renderItem={(grade) => <GradeListItem courseName={grade.courseName} score={grade.score} />}
                  getKey={(grade) => grade.id}
                  itemAriaLabel={(count) => `${count} recent grades`}
                />
              </SlideUp>
              <SlideUp delay={0.4} style={prefersReducedMotion ? { opacity: 1 } : {}}>
                <DashboardListCard
                  title="Announcements"
                  icon={<Megaphone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
                  items={data.announcements}
                  emptyMessage="No announcements available."
                  renderItem={(ann) => <AnnouncementItem announcement={ann} variant="simple" />}
                  getKey={(ann) => ann.id}
                />
              </SlideUp>
            </div>
          </div>
        </SlideUp>
      )}
    </DashboardLayout>
  );
}
