import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CardSkeleton } from '@/components/ui/loading-skeletons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { SlideUp } from '@/components/animations';
import { useStudentGrades } from '@/hooks/useStudent';
import { useAuthStore } from '@/lib/authStore';
import { getGradeColorClass, getGradeLetter, calculateAverageScore } from '@/utils/grades';

export function StudentGradesPage() {
  const user = useAuthStore((state) => state.user);
  const { data: grades = [], isLoading, error } = useStudentGrades(user?.id || '');

  if (isLoading) return <CardSkeleton lines={5} showHeader />;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load grades data. Please try again later.</AlertDescription>
      </Alert>
    );
  }

  const averageScore = calculateAverageScore(grades);

  return (
    <SlideUp className="space-y-6">
      <h1 className="text-3xl font-bold">Rapor Akademik</h1>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Laporan Hasil Belajar</CardTitle>
          <CardDescription>Semester Ganjil - Tahun Ajaran 2023/2024</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">No.</TableHead>
                <TableHead>Mata Pelajaran</TableHead>
                <TableHead className="text-center">Nilai</TableHead>
                <TableHead className="text-center">Predikat</TableHead>
                <TableHead>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map((grade, index) => (
                <TableRow key={index} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{grade.courseName}</TableCell>
                  <TableCell className="text-center font-semibold">{grade.score}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={`text-white ${getGradeColorClass(grade.score)}`}>
                      {getGradeLetter(grade.score)}
                    </Badge>
                  </TableCell>
                  <TableCell>{grade.feedback}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2} className="font-bold text-lg">Rata-rata</TableCell>
                <TableCell className="text-center font-bold text-lg">{averageScore}</TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </SlideUp>
  );
}