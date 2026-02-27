import { useMemo, memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/PageHeader'
import { DashboardStatCard } from '@/components/dashboard/DashboardStatCard'
import { AnnouncementItem } from '@/components/dashboard/AnnouncementItem'
import { DashboardCardEmptyState } from '@/components/dashboard/DashboardCardEmptyState'
import { EnrollmentChart } from '@/components/dashboard/EnrollmentChart'
import { Users, GraduationCap, School, BookCopy } from 'lucide-react'
import { SlideUp } from '@/components/animations'
import type { AdminDashboardData } from '@shared/types'

const StatCard = memo(function StatCard({
  title,
  value,
  icon,
  prefersReducedMotion,
  delay,
}: {
  title: string
  value: string
  icon: React.ReactNode
  prefersReducedMotion: boolean
  delay: number
}) {
  return (
    <SlideUp delay={delay} style={prefersReducedMotion ? { opacity: 1 } : {}}>
      <DashboardStatCard title={title} value={value} icon={icon} />
    </SlideUp>
  )
})

interface AdminDashboardContentProps {
  data: AdminDashboardData
  prefersReducedMotion: boolean
}

const AdminDashboardContent = memo(function AdminDashboardContent({
  data,
  prefersReducedMotion,
}: AdminDashboardContentProps) {
  const stats = useMemo(
    () => [
      {
        title: 'Total Students',
        value: data.totalStudents.toString(),
        icon: <Users className="h-6 w-6 text-blue-500" aria-hidden="true" />,
      },
      {
        title: 'Total Teachers',
        value: data.totalTeachers.toString(),
        icon: <GraduationCap className="h-6 w-6 text-green-500" aria-hidden="true" />,
      },
      {
        title: 'Total Parents',
        value: data.totalParents.toString(),
        icon: <School className="h-6 w-6 text-purple-500" aria-hidden="true" />,
      },
      {
        title: 'Total Classes',
        value: data.totalClasses.toString(),
        icon: <BookCopy className="h-6 w-6 text-orange-500" aria-hidden="true" />,
      },
    ],
    [data.totalStudents, data.totalTeachers, data.totalParents, data.totalClasses]
  )

  const enrollmentData = useMemo(
    () => [
      { name: 'Students', students: data.userDistribution.students },
      { name: 'Teachers', students: data.userDistribution.teachers },
      { name: 'Parents', students: data.userDistribution.parents },
      { name: 'Admins', students: data.userDistribution.admins },
    ],
    [
      data.userDistribution.students,
      data.userDistribution.teachers,
      data.userDistribution.parents,
      data.userDistribution.admins,
    ]
  )

  return (
    <SlideUp delay={0} className="space-y-6" style={prefersReducedMotion ? { opacity: 1 } : {}}>
      <SlideUp delay={0.1} style={prefersReducedMotion ? { opacity: 1 } : {}}>
        <PageHeader
          title="Admin Dashboard"
          description="Overall school management and statistics."
        />
      </SlideUp>
      <div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        role="region"
        aria-label="School statistics"
      >
        {stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            prefersReducedMotion={prefersReducedMotion}
            delay={index * 0.1 + 0.2}
          />
        ))}
      </div>
      <div
        className="grid gap-6 lg:grid-cols-5"
        role="region"
        aria-label="Dashboard charts and announcements"
      >
        <SlideUp
          delay={0.6}
          className="lg:col-span-3"
          style={prefersReducedMotion ? { opacity: 1 } : {}}
        >
          <Card className="h-[400px] hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle id="distribution-heading">User Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <EnrollmentChart data={enrollmentData} aria-labelledby="distribution-heading" />
            </CardContent>
          </Card>
        </SlideUp>
        <SlideUp
          delay={0.7}
          className="lg:col-span-2"
          style={prefersReducedMotion ? { opacity: 1 } : {}}
        >
          <Card className="h-[400px] hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle id="announcements-heading">Recent Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              {data.recentAnnouncements.length === 0 ? (
                <DashboardCardEmptyState message="No announcements available." />
              ) : (
                <ul
                  className="space-y-4"
                  aria-labelledby="announcements-heading"
                  aria-label={`${data.recentAnnouncements.length} announcements`}
                >
                  {data.recentAnnouncements.map(ann => (
                    <AnnouncementItem key={ann.id} announcement={ann} />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </SlideUp>
      </div>
    </SlideUp>
  )
})

export { AdminDashboardContent }
