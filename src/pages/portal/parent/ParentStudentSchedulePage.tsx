import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SlideUp } from '@/components/animations';

const scheduleData = {
  "Senin": [
    { time: "07:30 - 09:00", subject: "Matematika", teacher: "Mr. John Doe" },
    { time: "09:30 - 11:00", subject: "Bahasa Indonesia", teacher: "Ms. Sarah Lee" },
    { time: "12:00 - 13:30", subject: "Fisika", teacher: "Ms. Jane Smith" },
  ],
  "Selasa": [
    { time: "07:30 - 09:00", subject: "Bahasa Inggris", teacher: "Mr. David Chen" },
    { time: "09:30 - 11:00", subject: "Kimia", teacher: "Ms. Emily White" },
    { time: "12:00 - 13:30", subject: "Sejarah", teacher: "Mr. Robert Brown" },
  ],
  "Rabu": [
    { time: "07:30 - 09:00", subject: "Biologi", teacher: "Ms. Olivia Green" },
    { time: "09:30 - 11:00", subject: "Matematika", teacher: "Mr. John Doe" },
    { time: "12:00 - 13:30", subject: "Pendidikan Jasmani", teacher: "Mr. Mike Ross" },
  ],
  "Kamis": [
    { time: "07:30 - 09:00", subject: "Geografi", teacher: "Ms. Laura Hill" },
    { time: "09:30 - 11:00", subject: "Bahasa Indonesia", teacher: "Ms. Sarah Lee" },
    { time: "12:00 - 13:30", subject: "Seni Budaya", teacher: "Ms. Chloe King" },
  ],
  "Jumat": [
    { time: "07:30 - 09:00", subject: "Ekonomi", teacher: "Mr. Peter Jones" },
    { time: "09:30 - 11:00", subject: "Pendidikan Agama", teacher: "Mr. Abdul" },
  ],
};

export function ParentStudentSchedulePage() {
  return (
    <SlideUp className="space-y-6">
      <h1 className="text-3xl font-bold">Jadwal Pelajaran Anak Anda</h1>
      <p className="text-muted-foreground">Berikut adalah jadwal pelajaran mingguan untuk Budi Hartono.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.entries(scheduleData).map(([day, lessons], index) => (
          <SlideUp key={day} delay={index * 0.1}>
            <Card className="h-full hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle>{day}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Mata Pelajaran</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lessons.map((lesson, lessonIndex) => (
                      <TableRow key={lessonIndex}>
                        <TableCell className="font-mono text-xs">{lesson.time}</TableCell>
                        <TableCell>
                          <p className="font-medium">{lesson.subject}</p>
                          <p className="text-xs text-muted-foreground">{lesson.teacher}</p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </SlideUp>
        ))}
      </div>
    </SlideUp>
  );
}
