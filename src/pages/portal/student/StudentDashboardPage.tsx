import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/PageHeader'
import { SlideUp } from '@/components/animations'
import {
  DashboardLayout,
  AnnouncementItem,
  GradeListItem,
  DashboardCardEmptyState,
  ScheduleListItem,
} from '@/components/dashboard'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { Clock, BookOpen, Megaphone } from 'lucide-react'
import { useStudentDashboard } from '@/hooks/useStudent'
import { useAuthStore } from '@/lib/authStore'
import type { StudentDashboardData } from '@shared/types'

export function StudentDashboardPage() {
  const prefersReducedMotion = useReducedMotion()
  const user = useAuthStore(state => state.user)
  const { data, isLoading, error } = useStudentDashboard(user?.id || '')

  return (
    <DashboardLayout<StudentDashboardData> isLoading={isLoading} error={error} data={data}>
      {data => (
        <SlideUp delay={0} style={prefersReducedMotion ? { opacity: 1 } : {}}>
          <div className="space-y-6">
            <SlideUp delay={0.1} style={prefersReducedMotion ? { opacity: 1 } : {}}>
              <PageHeader
                title="Student Dashboard"
                description="Here's a summary of your academic activities."
              />
            </SlideUp>
            <div
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              role="region"
              aria-label="Student dashboard overview"
            >
              <SlideUp delay={0.2} style={prefersReducedMotion ? { opacity: 1 } : {}}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle id="schedule-heading" className="text-sm font-medium">
                      Today's Schedule
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </CardHeader>
                  <CardContent>
                    {data.schedule.length === 0 ? (
                      <DashboardCardEmptyState message="No classes scheduled for today." />
                    ) : (
                      <ul
                        className="space-y-3"
                        aria-labelledby="schedule-heading"
                        aria-label={`${data.schedule.length} scheduled classes`}
                      >
                        {data.schedule.slice(0, 3).map(item => (
                          <ScheduleListItem
                            key={`${item.courseId}-${item.time}`}
                            courseName={item.courseName}
                            time={item.time}
                            teacherName={item.teacherName}
                          />
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </SlideUp>
              <SlideUp delay={0.3} style={prefersReducedMotion ? { opacity: 1 } : {}}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle id="grades-heading" className="text-sm font-medium">
                      Recent Grades
                    </CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </CardHeader>
                  <CardContent>
                    {data.recentGrades.length === 0 ? (
                      <DashboardCardEmptyState message="No grades recorded yet." />
                    ) : (
                      <ul
                        className="space-y-3"
                        aria-labelledby="grades-heading"
                        aria-label={`${data.recentGrades.length} recent grades`}
                      >
                        {data.recentGrades.map(grade => (
                          <GradeListItem
                            key={grade.id}
                            courseName={grade.courseName}
                            score={grade.score}
                          />
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </SlideUp>
              <SlideUp delay={0.4} style={prefersReducedMotion ? { opacity: 1 } : {}}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle id="announcements-heading" className="text-sm font-medium">
                      Announcements
                    </CardTitle>
                    <Megaphone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </CardHeader>
                  <CardContent>
                    {data.announcements.length === 0 ? (
                      <DashboardCardEmptyState message="No announcements available." />
                    ) : (
                      <ul
                        className="space-y-3"
                        aria-labelledby="announcements-heading"
                        aria-label={`${data.announcements.length} announcements`}
                      >
                        {data.announcements.map(ann => (
                          <AnnouncementItem key={ann.id} announcement={ann} variant="simple" />
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </SlideUp>
            </div>
          </div>
        </SlideUp>
      )}
    </DashboardLayout>
  )
}
