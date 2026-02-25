import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CardSkeleton } from '@/components/ui/loading-skeletons'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, PieChart as PieChartIcon } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { SlideUp } from '@/components/animations'
import { useStudentDashboard } from '@/hooks/useStudent'
import { useAuthStore } from '@/stores/authStore'
import { calculateAverageScore, getGradeColorClass, getGradeLetter } from '@/utils/grades'
import { ResponsiveTable } from '@/components/ui/responsive-table'
import { PieChart } from '@/components/charts/PieChart'
import type { ChartDataPoint } from '@/components/charts/types'
import { GRADE_COLORS } from '@/theme/colors'

const TABLE_HEADERS = [
  { key: 'no', label: 'No.' },
  { key: 'subject', label: 'Mata Pelajaran' },
  { key: 'score', label: 'Nilai', className: 'text-center' },
  { key: 'grade', label: 'Predikat', className: 'text-center' },
  { key: 'feedback', label: 'Keterangan' },
]

function calculateGradeDistribution(grades: { score: number }[]): ChartDataPoint[] {
  const distribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 }
  grades.forEach(grade => {
    const letter = getGradeLetter(grade.score)
    distribution[letter]++
  })
  return Object.entries(distribution)
    .filter(([, count]) => count > 0)
    .map(([name, value]) => ({
      name,
      value,
      color: GRADE_COLORS[name],
    }))
}

export function StudentGradesPage() {
  const user = useAuthStore(state => state.user)
  const { data: dashboardData, isLoading, error } = useStudentDashboard(user?.id || '')

  const grades = useMemo(() => dashboardData?.recentGrades ?? [], [dashboardData])

  const averageScore = useMemo(
    () => (grades.length > 0 ? calculateAverageScore(grades) : '-'),
    [grades]
  )

  const gradeDistribution = useMemo(() => calculateGradeDistribution(grades), [grades])

  const tableRows = useMemo(
    () =>
      grades.map((grade, index) => ({
        id: grade.id,
        cells: [
          { key: 'no', content: index + 1, className: 'font-medium' },
          { key: 'subject', content: grade.courseName },
          { key: 'score', content: grade.score, className: 'text-center font-semibold' },
          {
            key: 'grade',
            content: (
              <Badge className={`text-white ${getGradeColorClass(grade.score)}`}>
                <span className="sr-only">
                  {grade.score >= 70 ? 'Passing grade: ' : 'Failing grade: '}
                </span>
                {getGradeLetter(grade.score)}
              </Badge>
            ),
            className: 'text-center',
          },
          { key: 'feedback', content: grade.feedback },
        ],
      })),
    [grades]
  )

  if (isLoading) return <CardSkeleton lines={5} showHeader />

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load grades data. Please try again later.</AlertDescription>
      </Alert>
    )
  }

  return (
    <SlideUp className="space-y-6">
      <PageHeader title="Rapor Akademik" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader>
            <CardTitle>Laporan Hasil Belajar</CardTitle>
            <CardDescription>Semester Ganjil - Tahun Ajaran 2023/2024</CardDescription>
          </CardHeader>
          <CardContent>
            {grades.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveTable headers={TABLE_HEADERS} rows={tableRows} />
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
                        <td colSpan={2} className="p-2 align-middle font-bold text-lg">
                          Rata-rata
                        </td>
                        <td className="p-2 align-middle text-center font-bold text-lg">
                          {averageScore}
                        </td>
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
        {grades.length > 0 && (
          <Card className="h-full hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Distribusi Nilai</CardTitle>
              <PieChartIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <PieChart
                data={gradeDistribution}
                height={200}
                showLegend
                showTooltip
                ariaLabel="Grade distribution chart showing count of each grade letter"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </SlideUp>
  )
}
