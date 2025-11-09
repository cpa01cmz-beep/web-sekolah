import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
const mockGradesData = [
  { subject: 'Pendidikan Agama', score: 92, grade: 'A', feedback: 'Sangat Baik' },
  { subject: 'Bahasa Indonesia', score: 88, grade: 'B', feedback: 'Baik' },
  { subject: 'Matematika', score: 95, grade: 'A', feedback: 'Sangat Baik' },
  { subject: 'Ilmu Pengetahuan Alam', score: 85, grade: 'B', feedback: 'Baik' },
  { subject: 'Ilmu Pengetahuan Sosial', score: 89, grade: 'B', feedback: 'Baik' },
  { subject: 'Bahasa Inggris', score: 90, grade: 'A', feedback: 'Sangat Baik' },
  { subject: 'Seni Budaya', score: 82, grade: 'B', feedback: 'Baik' },
  { subject: 'Pendidikan Jasmani', score: 93, grade: 'A', feedback: 'Sangat Baik' },
];
const getGradeColor = (grade: string) => {
  if (grade === 'A') return 'bg-green-500 hover:bg-green-600';
  if (grade === 'B') return 'bg-blue-500 hover:bg-blue-600';
  if (grade === 'C') return 'bg-yellow-500 hover:bg-yellow-600';
  return 'bg-red-500 hover:bg-red-600';
};
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};
export function StudentGradesPage() {
  const averageScore = (mockGradesData.reduce((acc, curr) => acc + curr.score, 0) / mockGradesData.length).toFixed(2);
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
              {mockGradesData.map((grade, index) => (
                <TableRow key={index} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{grade.subject}</TableCell>
                  <TableCell className="text-center font-semibold">{grade.score}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={`text-white ${getGradeColor(grade.grade)}`}>{grade.grade}</Badge>
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