import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CardSkeleton } from '@/components/ui/loading-skeletons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStudentGrades } from '@/hooks/useStudent';
import { useAuthStore } from '@/lib/authStore';
import { GRADE_A_THRESHOLD, GRADE_B_THRESHOLD, GRADE_C_THRESHOLD } from '@/constants/grades';

const getGradeColor = (score: number) => {
  if (score >= GRADE_A_THRESHOLD) return 'bg-green-500 hover:bg-green-600';
  if (score >= GRADE_B_THRESHOLD) return 'bg-blue-500 hover:bg-blue-600';
  if (score >= GRADE_C_THRESHOLD) return 'bg-yellow-500 hover:bg-yellow-600';
  return 'bg-red-500 hover:bg-red-600';
};

const getGrade = (score: number) => {
  if (score >= GRADE_A_THRESHOLD) return 'A';
  if (score >= GRADE_B_THRESHOLD) return 'B';
  if (score >= GRADE_C_THRESHOLD) return 'C';
  return 'D';
};

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

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

  const averageScore = grades.length > 0
    ? (grades.reduce((acc, curr) => acc + curr.score, 0) / grades.length).toFixed(2)
    : '0.00';

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ type: 'tween', ease: 'anticipate', duration: 0.5 }}
      className="space-y-6"
    >
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
                    <Badge className={`text-white ${getGradeColor(grade.score)}`}>
                      {getGrade(grade.score)}
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
    </motion.div>
  );
}