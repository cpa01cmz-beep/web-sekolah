import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, CalendarCheck, Megaphone, UserCheck } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SlideUp } from '@/components/animations';
import { useAuthStore } from '@/lib/authStore';
const mockParentData = {
  childName: 'Budi Hartono',
  recentGrades: [
    { subject: 'Mathematics', grade: 'A', score: 95 },
    { subject: 'Physics', grade: 'B+', score: 88 },
    { subject: 'History', grade: 'A-', score: 91 },
  ],
  attendance: {
    present: 120,
    absent: 2,
    late: 1,
  },
  announcements: [
    { title: 'Parent-Teacher Meeting Schedule', date: '2024-07-19', author: 'Admin' },
    { title: 'School Holiday Announcement', date: '2024-07-20', author: 'Admin' },
    { title: 'Mid-term Exam Schedule', date: '2024-07-18', author: 'Admin' },
  ],
};
export function ParentDashboardPage() {
  const user = useAuthStore((state) => state.user);
  return (
    <SlideUp className="space-y-6">
      <PageHeader 
        title="Parent Dashboard" 
        description={
          <>Monitoring academic progress for <span className="font-semibold">{mockParentData.childName}</span>.</>
        } 
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SlideUp delay={0.1}>
          <Card className="h-full hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Grades</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {mockParentData.recentGrades.map((grade, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <p className="text-sm font-medium">{grade.subject}</p>
                    <Badge variant={grade.grade.startsWith('A') ? 'default' : 'secondary'} className="bg-green-500 text-white">
                      {grade.grade} ({grade.score})
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </SlideUp>
        <SlideUp delay={0.2}>
          <Card className="h-full hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Summary</CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-center pt-4">
              <div>
                <p className="text-2xl font-bold text-green-600">{mockParentData.attendance.present}</p>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{mockParentData.attendance.late}</p>
                <p className="text-xs text-muted-foreground">Late</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{mockParentData.attendance.absent}</p>
                <p className="text-xs text-muted-foreground">Absent</p>
              </div>
            </CardContent>
          </Card>
        </SlideUp>
        <SlideUp delay={0.3}>
          <Card className="h-full hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">School Announcements</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {mockParentData.announcements.map((ann, index) => (
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
        </SlideUp>
      </div>
    </SlideUp>
  );
}