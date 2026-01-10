import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CardSkeleton } from '@/components/ui/loading-skeletons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { SlideUp } from '@/components/animations';
import { useStudentDashboard } from '@/hooks/useStudent';
import { useAuthStore } from '@/lib/authStore';
import { calculateAverageScore, getGradeColorClass, getGradeLetter } from '@/utils/grades';
import { ResponsiveTable } from '@/components/ui/responsive-table';

export function StudentGradesPage() {
  const user = useAuthStore((state) => state.user);
  const { data: dashboardData, isLoading, error } = useStudentDashboard(user?.id || '');

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

  const grades = dashboardData?.recentGrades || [];

  const averageScore = grades.length > 0 ? calculateAverageScore(grades) : '-';

  const tableHeaders = [
    { key: 'no', label: 'No.' },
    { key: 'subject', label: 'Mata Pelajaran' },
    { key: 'score', label: 'Nilai', className: 'text-center' },
    { key: 'grade', label: 'Predikat', className: 'text-center' },
    { key: 'feedback', label: 'Keterangan' },
  ];

  const tableRows = grades.map((grade, index) => ({
    id: grade.id,
    cells: [
      { key: 'no', content: index + 1, className: 'font-medium' },
      { key: 'subject', content: grade.courseName },
      { key: 'score', content: grade.score, className: 'text-center font-semibold' },
      {
        key: 'grade',
        content: (
          <Badge className={`text-white ${getGradeColorClass(grade.score)}`}>
            {getGradeLetter(grade.score)}
          </Badge>
        ),
        className: 'text-center',
      },
      { key: 'feedback', content: grade.feedback },
    ],
  }));

  return (
    <SlideUp className="space-y-6">
      <h1 className="text-3xl font-bold">Rapor Akademik</h1>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Laporan Hasil Belajar</CardTitle>
          <CardDescription>Semester Ganjil - Tahun Ajaran 2023/2024</CardDescription>
        </CardHeader>
        <CardContent>
          {grades.length > 0 ? (
            <div className="space-y-4">
              <ResponsiveTable headers={tableHeaders} rows={tableRows} />
              <div className="md:hidden p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Rata-rata</span>
                  <span className="font-bold text-lg">{averageScore}</span>
                </div>
              </div>
              <div className="hidden md:block border-t pt-4">
                <table className="w-full caption-bottom text-sm">
                  <tfoot>
                    <tr className="border-t">
                      <td colSpan={2} className="p-2 align-middle font-bold text-lg">Rata-rata</td>
                      <td className="p-2 align-middle text-center font-bold text-lg">{averageScore}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No grades available.</p>
          )}
        </CardContent>
      </Card>
    </SlideUp>
  );
}
