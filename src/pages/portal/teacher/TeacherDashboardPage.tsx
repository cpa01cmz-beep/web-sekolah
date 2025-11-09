import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, BookCopy, Megaphone, Users } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
const mockTeacherData = {
  schedule: [
    { time: '08:00 - 09:30', subject: 'Mathematics', class: '11-A' },
    { time: '10:00 - 11:30', subject: 'Physics', class: '12-B' },
    { time: '13:00 - 14:30', subject: 'Mathematics', class: '11-C' },
  ],
  classes: [
    { id: '11-A', name: 'Class 11-A', studentCount: 32, subject: 'Mathematics' },
    { id: '12-B', name: 'Class 12-B', studentCount: 28, subject: 'Physics' },
    { id: '11-C', name: 'Class 11-C', studentCount: 35, subject: 'Mathematics' },
  ],
  announcements: [
    { title: 'School Holiday Announcement', date: '2024-07-20', author: 'Admin' },
    { title: 'Parent-Teacher Meeting Schedule', date: '2024-07-19', author: 'Admin' },
    { title: 'Mid-term Exam Schedule', date: '2024-07-18', author: 'Admin' },
  ],
};
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};
const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
    },
  },
};
export function TeacherDashboardPage() {
  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <p className="text-muted-foreground">A summary of your teaching activities and announcements.</p>
      </motion.div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div variants={itemVariants}>
          <Card className="h-full hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Schedule</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {mockTeacherData.schedule.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="text-sm font-semibold w-24">{item.time}</div>
                    <div className="text-sm">
                      <p className="font-medium">{item.subject}</p>
                      <p className="text-xs text-muted-foreground">Class {item.class}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="h-full hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Classes</CardTitle>
              <BookCopy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {mockTeacherData.classes.map((c, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.subject}</p>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Users className="h-3 w-3 mr-1" />
                      {c.studentCount}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="h-full hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Announcements</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {mockTeacherData.announcements.map((ann, index) => (
                  <li key={index} className="text-sm">
                    <p className="font-medium truncate">{ann.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {ann.date} by {ann.author}
                    </p>
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