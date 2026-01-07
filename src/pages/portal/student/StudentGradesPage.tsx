import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStudentGrades } from '@/hooks/useStudent';
import { useAuthStore } from '@/lib/authStore';

const getGradeColor = (score: number) => {
  if (score >= 90) return 'bg-green-500 hover:bg-green-600';
  if (score >= 80) return 'bg-blue-500 hover:bg-blue-600';
  if (score >= 70) return 'bg-yellow-500 hover:bg-yellow-600';
  return 'bg-red-500 hover:bg-red-600';
};

const getGrade = (score: number) => {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  return 'D';
};

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

function GradesSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between space-x-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function StudentGradesPage() {
  const user = useAuthStore((state) => state.user);
  const { data: grades = [], isLoading, error } = useStudentGrades(user?.id || '');

  if (isLoading) return <GradesSkeleton />;

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
                <TableRow key={grade.id} className="hover:bg-muted/50">
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