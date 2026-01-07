import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, School, Megaphone, Activity } from 'lucide-react';
import { SlideUp } from '@/components/animations';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
const mockAdminData = {
  stats: [
    { title: 'Total Students', value: '1,250', icon: <Users className="h-6 w-6 text-blue-500" /> },
    { title: 'Total Teachers', value: '85', icon: <GraduationCap className="h-6 w-6 text-green-500" /> },
    { title: 'Total Classes', value: '42', icon: <School className="h-6 w-6 text-purple-500" /> },
    { title: 'Announcements', value: '12', icon: <Megaphone className="h-6 w-6 text-orange-500" /> },
  ],
  enrollmentData: [
    { name: 'Grade 10', students: 450 },
    { name: 'Grade 11', students: 420 },
    { name: 'Grade 12', students: 380 },
  ],
  recentActivity: [
    { action: 'New student enrolled: Ahmad', timestamp: '2 mins ago' },
    { action: 'Ibu Siti posted a new announcement', timestamp: '1 hour ago' },
    { action: 'Grade report for Class 11-A updated', timestamp: '3 hours ago' },
    { action: 'New teacher account created: Mr. Budi', timestamp: '1 day ago' },
  ],
};

function EnrollmentChart() {
  const [Chart, setChart] = useState<{ BarChart: any, Bar: any, XAxis: any, YAxis: any, CartesianGrid: any, Tooltip: any, Legend: any, ResponsiveContainer: any } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    import('recharts').then((recharts) => {
      setChart({
        BarChart: recharts.BarChart,
        Bar: recharts.Bar,
        XAxis: recharts.XAxis,
        YAxis: recharts.YAxis,
        CartesianGrid: recharts.CartesianGrid,
        Tooltip: recharts.Tooltip,
        Legend: recharts.Legend,
        ResponsiveContainer: recharts.ResponsiveContainer,
      });
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !Chart) {
    return <div className="h-[300px] animate-pulse bg-muted rounded-lg" />;
  }

  return (
    <Chart.ResponsiveContainer width="100%" height={300}>
      <Chart.BarChart data={mockAdminData.enrollmentData}>
        <Chart.CartesianGrid strokeDasharray="3 3" />
        <Chart.XAxis dataKey="name" />
        <Chart.YAxis />
        <Chart.Tooltip />
        <Chart.Legend />
        <Chart.Bar dataKey="students" fill="#0D47A1" />
      </Chart.BarChart>
    </Chart.ResponsiveContainer>
  );
}

export function AdminDashboardPage() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <SlideUp className="space-y-6" style={prefersReducedMotion ? { opacity: 1 } : {}}>
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overall school management and statistics.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {mockAdminData.stats.map((stat, index) => (
          <SlideUp key={index} delay={index * 0.1} style={prefersReducedMotion ? { opacity: 1 } : {}}>
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
        <SlideUp delay={0.4} className="lg:col-span-3" style={prefersReducedMotion ? { opacity: 1 } : {}}>
          <Card className="h-[400px] hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle>Student Enrollment by Grade</CardTitle>
            </CardHeader>
            <CardContent>
              <EnrollmentChart />
            </CardContent>
          </Card>
        </SlideUp>
        <SlideUp delay={0.5} className="lg:col-span-2" style={prefersReducedMotion ? { opacity: 1 } : {}}>
          <Card className="h-[400px] hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {mockAdminData.recentActivity.map((activity, index) => (
                  <li key={index} className="flex items-start">
                    <Activity className="h-4 w-4 mt-1 mr-3 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </SlideUp>
      </div>
    </SlideUp>
  );
}