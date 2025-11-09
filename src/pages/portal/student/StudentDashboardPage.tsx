import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, Megaphone, CheckCircle } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
// Mock Data for Phase 1
const mockSchedule = [
  { time: '08:00 - 09:30', subject: 'Mathematics', teacher: 'Mr. John Doe' },
  { time: '10:00 - 11:30', subject: 'Physics', teacher: 'Ms. Jane Smith' },
  { time: '13:00 - 14:30', subject: 'History', teacher: 'Mr. Robert Brown' },
];
const mockGrades = [
  { subject: 'Mathematics', grade: 'A', score: 95 },
  { subject: 'Physics', grade: 'B+', score: 88 },
];
const mockAnnouncements = [
  { title: 'School Holiday Announcement', date: '2024-07-20' },
  { title: 'Mid-term Exam Schedule', date: '2024-07-18' },
];
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
      type: 'spring' as const, // Fix: Explicitly cast type to satisfy framer-motion's Variants type
      stiffness: 100,
    },
  },
};
export function StudentDashboardPage() {
  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="text-muted-foreground">Here's a summary of your academic activities.</p>
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
                {mockSchedule.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="text-sm font-semibold w-24">{item.time}</div>
                    <div className="text-sm">
                      <p className="font-medium">{item.subject}</p>
                      <p className="text-xs text-muted-foreground">{item.teacher}</p>
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
              <CardTitle className="text-sm font-medium">Recent Grades</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {mockGrades.map((grade, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <p className="text-sm font-medium">{grade.subject}</p>
                    <Badge variant={grade.grade === 'A' ? 'default' : 'secondary'} className="bg-green-500 text-white">
                      {grade.grade} ({grade.score})
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="h-full hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Announcements</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {mockAnnouncements.map((ann, index) => (
                  <li key={index} className="text-sm">
                    <p className="font-medium truncate">{ann.title}</p>
                    <p className="text-xs text-muted-foreground">{ann.date}</p>
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