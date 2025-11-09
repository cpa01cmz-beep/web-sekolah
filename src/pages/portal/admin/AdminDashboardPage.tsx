import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, School, Megaphone, Activity } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};
export function AdminDashboardPage() {
  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overall school management and statistics.</p>
      </motion.div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {mockAdminData.stats.map((stat, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card className="h-[400px] hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle>Student Enrollment by Grade</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockAdminData.enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="students" fill="#0D47A1" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants} className="lg:col-span-2">
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
        </motion.div>
      </div>
    </motion.div>
  );
}