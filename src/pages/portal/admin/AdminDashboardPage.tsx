import { useState, useEffect, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { DashboardSkeleton } from '@/components/ui/loading-skeletons';
import { PageHeader } from '@/components/PageHeader';
import { Users, GraduationCap, School, Megaphone, Activity, AlertTriangle, Inbox } from 'lucide-react';
import { SlideUp } from '@/components/animations';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useAdminDashboard } from '@/hooks/useAdmin';
import { THEME_COLORS } from '@/theme/colors';
import { formatDate } from '@/utils/date';
import type { AdminDashboardData } from '@shared/types';

const AnnouncementItem = memo(({ ann }: { ann: AdminDashboardData['recentAnnouncements'][0] }) => (
  <li className="flex items-start">
    <Activity className="h-4 w-4 mt-1 mr-3 text-muted-foreground flex-shrink-0" />
    <div>
      <p className="text-sm font-medium">{ann.title}</p>
      <p className="text-xs text-muted-foreground">{formatDate(ann.date)}</p>
    </div>
  </li>
));
AnnouncementItem.displayName = 'AnnouncementItem';

interface ChartComponents {
  BarChart: React.ComponentType<any>;
  Bar: React.ComponentType<any>;
  XAxis: React.ComponentType<any>;
  YAxis: React.ComponentType<any>;
  CartesianGrid: React.ComponentType<any>;
  Tooltip: React.ComponentType<any>;
  Legend: React.ComponentType<any>;
  ResponsiveContainer: React.ComponentType<any>;
}

function EnrollmentChart({ data }: { data: Array<{ name: string; students: number }> }) {
  const [Chart, setChart] = useState<ChartComponents | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      import('recharts/es6/chart/BarChart'),
      import('recharts/es6/cartesian/Bar'),
      import('recharts/es6/cartesian/XAxis'),
      import('recharts/es6/cartesian/YAxis'),
      import('recharts/es6/cartesian/CartesianGrid'),
      import('recharts/es6/component/Tooltip'),
      import('recharts/es6/component/Legend'),
      import('recharts/es6/component/ResponsiveContainer'),
    ]).then(([BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer]) => {
      setChart({
        BarChart: BarChart.BarChart,
        Bar: Bar.Bar,
        XAxis: XAxis.XAxis,
        YAxis: YAxis.YAxis,
        CartesianGrid: CartesianGrid.CartesianGrid,
        Tooltip: Tooltip.Tooltip,
        Legend: Legend.Legend,
        ResponsiveContainer: ResponsiveContainer.ResponsiveContainer,
      });
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !Chart) {
    return <div className="h-[300px] animate-pulse bg-muted rounded-lg" />;
  }

  return (
    <Chart.ResponsiveContainer width="100%" height={300}>
      <Chart.BarChart data={data}>
        <Chart.CartesianGrid strokeDasharray="3 3" />
        <Chart.XAxis dataKey="name" />
        <Chart.YAxis />
        <Chart.Tooltip />
        <Chart.Legend />
        <Chart.Bar dataKey="students" fill={THEME_COLORS.PRIMARY} />
      </Chart.BarChart>
    </Chart.ResponsiveContainer>
  );
}

export function AdminDashboardPage() {
  const prefersReducedMotion = useReducedMotion();
  const { data, isLoading, error } = useAdminDashboard();

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

  const stats = [
    { title: 'Total Students', value: data.totalStudents.toString(), icon: <Users className="h-6 w-6 text-blue-500" /> },
    { title: 'Total Teachers', value: data.totalTeachers.toString(), icon: <GraduationCap className="h-6 w-6 text-green-500" /> },
    { title: 'Total Parents', value: data.totalParents.toString(), icon: <School className="h-6 w-6 text-purple-500" /> },
    { title: 'Total Classes', value: data.totalClasses.toString(), icon: <Megaphone className="h-6 w-6 text-orange-500" /> },
  ];

  const enrollmentData = [
    { name: 'Students', students: data.userDistribution.students },
    { name: 'Teachers', students: data.userDistribution.teachers },
    { name: 'Parents', students: data.userDistribution.parents },
    { name: 'Admins', students: data.userDistribution.admins },
  ];

  return (
    <SlideUp delay={0} className="space-y-6" style={prefersReducedMotion ? { opacity: 1 } : {}}>
      <SlideUp delay={0.1}>
        <PageHeader
          title="Admin Dashboard"
          description="Overall school management and statistics."
        />
      </SlideUp>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <SlideUp key={stat.title} delay={stats.indexOf(stat) * 0.1 + 0.2} style={prefersReducedMotion ? { opacity: 1 } : {}}>
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
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
                <ul className="space-y-4">
                  {data.recentAnnouncements.map((ann) => (
                    <AnnouncementItem key={ann.id} ann={ann} />
                  ))}
                </ul>
              </CardContent>
          </Card>
        </SlideUp>
      </div>
    </SlideUp>
  );
}