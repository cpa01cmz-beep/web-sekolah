import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/PageHeader'
import { SlideUp } from '@/components/animations'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { AnnouncementItem } from '@/components/dashboard/AnnouncementItem'
import { GradeListItem } from '@/components/dashboard/GradeListItem'
import { DashboardCardEmptyState } from '@/components/dashboard/DashboardCardEmptyState'
import { ScheduleListItem } from '@/components/dashboard/ScheduleListItem'
import { DashboardStatCard } from '@/components/dashboard/DashboardStatCard'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { Clock, BookOpen, Megaphone, TrendingUp, Target, Award } from 'lucide-react'
import { useStudentDashboard } from '@/hooks/useStudent'
import { useAuthStore } from '@/stores/authStore'
import type { StudentDashboardData } from '@shared/types'
import { LineChart } from '@/components/charts/LineChart'
import { RadarChart } from '@/components/charts/RadarChart'
import { CHART_COLORS } from '@/theme/colors'
import { useMemo } from 'react'
import { calculateAverage, aggregateByField, generateTrendDataPoints } from '@/utils/analytics'

export function StudentDashboardPage() {
  const prefersReducedMotion = useReducedMotion()
  const user = useAuthStore(state => state.user)
  const { data, isLoading, error } = useStudentDashboard(user?.id || '')

  const analyticsData = useMemo(() => {
    if (!data) return null
    const grades = data.recentGrades
    const scores = grades.map(g => g.score)
    const avgScore = grades.length > 0 ? Math.round(calculateAverage(scores) * 10) / 10 : 0
    const uniqueSubjects = [...new Set(grades.map(g => g.courseName))]
    const performanceTrend =
      grades.length > 0
        ? generateTrendDataPoints(
            scores,
            grades.map(g => g.courseName.substring(0, 8))
          )
        : []
    const subjectComparison =
      grades.length > 0
        ? aggregateByField(grades, 'courseName', 'score', 'avg').map(item => ({
            name: item.name,
            average: item.value,
          }))
        : []
    return {
      avgScore,
      totalSubjects: uniqueSubjects.length,
      totalGrades: grades.length,
      performanceTrend,
      subjectComparison,
    }
  }, [data])

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
            {analyticsData && analyticsData.totalGrades > 0 && (
              <SlideUp delay={0.15} style={prefersReducedMotion ? { opacity: 1 } : {}}>
                <div
                  className="grid gap-4 md:grid-cols-3"
                  role="region"
                  aria-label="Academic performance metrics"
                >
                  <DashboardStatCard
                    title="Average Score"
                    value={analyticsData.avgScore.toString()}
                    icon={TrendingUp}
                    description="Your overall average"
                  />
                  <DashboardStatCard
                    title="Subjects"
                    value={analyticsData.totalSubjects.toString()}
                    icon={BookOpen}
                    description="Courses enrolled"
                  />
                  <DashboardStatCard
                    title="Total Grades"
                    value={analyticsData.totalGrades.toString()}
                    icon={Award}
                    description="Grades recorded"
                  />
                </div>
              </SlideUp>
            )}
            {analyticsData && analyticsData.performanceTrend.length > 0 && (
              <SlideUp delay={0.2} style={prefersReducedMotion ? { opacity: 1 } : {}}>
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle id="analytics-heading" className="text-sm font-medium">
                      Performance Trends
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      data={analyticsData.performanceTrend}
                      series={[{ dataKey: 'score', name: 'Score', color: CHART_COLORS.primary }]}
                      xAxisKey="name"
                      height={250}
                      showLegend={false}
                      showDots
                      ariaLabel="Performance trends across subjects"
                    />
                  </CardContent>
                </Card>
              </SlideUp>
            )}
            {analyticsData && analyticsData.subjectComparison.length > 0 && (
              <SlideUp delay={0.25} style={prefersReducedMotion ? { opacity: 1 } : {}}>
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle id="subjects-heading" className="text-sm font-medium">
                      Subject Performance
                    </CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </CardHeader>
                  <CardContent>
                    <RadarChart
                      data={analyticsData.subjectComparison}
                      series={[
                        { dataKey: 'average', name: 'Average', color: CHART_COLORS.secondary },
                      ]}
                      angleKey="name"
                      height={280}
                      showLegend={false}
                      ariaLabel="Subject performance comparison"
                    />
                  </CardContent>
                </Card>
              </SlideUp>
            )}
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
                          <ScheduleListItem key={`${item.courseId}-${item.time}`} item={item} />
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
