import { memo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardListCard } from '@/components/dashboard/DashboardListCard';
import { AnnouncementItem } from '@/components/dashboard/AnnouncementItem';
import { GradeListItem } from '@/components/dashboard/GradeListItem';
import { Award, CalendarCheck, Megaphone } from 'lucide-react';
import { SlideUp } from '@/components/animations';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useParentDashboard } from '@/hooks/useParent';
import { useAuthStore } from '@/lib/authStore';
import type { ParentDashboardData } from '@shared/types';

const ScheduleItem = memo(({ item }: { item: ParentDashboardData['childSchedule'][0] }) => (
  <div className="text-sm">
    <p className="font-medium">{item.courseName}</p>
    <p className="text-xs text-muted-foreground">
      {item.time} - {item.day}
    </p>
  </div>
));
ScheduleItem.displayName = 'ScheduleItem';

export function ParentDashboardPage() {
  const prefersReducedMotion = useReducedMotion();
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, error } = useParentDashboard(user?.id || '');

  return (
    <DashboardLayout<ParentDashboardData> isLoading={isLoading} error={error} data={data}>
      {(data) => (
        <SlideUp delay={0} className="space-y-6" style={prefersReducedMotion ? { opacity: 1 } : {}}>
          <SlideUp delay={0.1} style={prefersReducedMotion ? { opacity: 1 } : {}}>
            <PageHeader
              title="Parent Dashboard"
              description={
                <>Monitoring academic progress for <span className="font-semibold">{data.child.name}</span>.</>
              }
            />
          </SlideUp>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" role="region" aria-label="Parent dashboard overview">
            <SlideUp delay={0.2} style={prefersReducedMotion ? { opacity: 1 } : {}}>
              <DashboardListCard
                title="Recent Grades"
                icon={<Award className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
                items={data.childGrades}
                emptyMessage="No grades recorded yet."
                renderItem={(grade) => <GradeListItem courseName={grade.courseName} score={grade.score} />}
                getKey={(grade) => grade.id}
                itemAriaLabel={(count) => `${count} recent grades`}
              />
            </SlideUp>
            <SlideUp delay={0.3} style={prefersReducedMotion ? { opacity: 1 } : {}}>
              <DashboardListCard
                title="Child's Schedule"
                icon={<CalendarCheck className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
                items={data.childSchedule.slice(0, 5)}
                emptyMessage="No schedule available."
                renderItem={(item) => <ScheduleItem item={item} />}
                getKey={(item) => `${item.courseId}-${item.time}`}
                listClassName="space-y-2"
                itemAriaLabel={(count) => `${count} scheduled classes`}
              />
            </SlideUp>
            <SlideUp delay={0.4} style={prefersReducedMotion ? { opacity: 1 } : {}}>
              <DashboardListCard
                title="School Announcements"
                icon={<Megaphone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
                items={data.announcements}
                emptyMessage="No announcements available."
                renderItem={(ann) => <AnnouncementItem announcement={ann} variant="simple" />}
                getKey={(ann) => ann.id}
              />
            </SlideUp>
          </div>
        </SlideUp>
      )}
    </DashboardLayout>
  );
}