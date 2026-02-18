import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/PageHeader';
import { SlideUp } from '@/components/animations';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/authStore';
import { useMutation, queryClient } from '@/lib/api-client';
import { useTeacherClasses, useTeacherClassStudents } from '@/hooks/useTeacher';
import { Skeleton } from '@/components/ui/skeleton';
import { TableSkeleton } from '@/components/ui/loading-skeletons';
import { GradeForm } from '@/components/forms/GradeForm';
import { ResponsiveTable } from '@/components/ui/responsive-table';
import { GradeActions } from '@/components/tables/GradeActions';
import { MESSAGES } from '@/constants/messages';

interface UpdateGradeData {
  score: number | null;
  feedback: string;
}
type StudentGrade = {
  id: string;
  name: string;
  score: number | null;
  feedback: string;
  gradeId: string | null;
};

export function TeacherGradeManagementPage() {
  const user = useAuthStore((state) => state.user);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<StudentGrade | null>(null);
  const { data: classes, isLoading: isLoadingClasses } = useTeacherClasses(user?.id || '');
  const { data: students, isLoading: isLoadingStudents } = useTeacherClassStudents(selectedClass || '');
  const gradeMutation = useMutation<UpdateGradeData, Error, UpdateGradeData>(['grades', editingStudent?.gradeId || ''], {
    method: 'PUT',
    onSuccess: () => {
      toast.success(MESSAGES.GRADE.UPDATED(editingStudent?.name || 'student'));
      queryClient.invalidateQueries({ queryKey: ['classes', selectedClass || '', 'students'] });
      setEditingStudent(null);
    },
    onError: (error) => {
      toast.error(MESSAGES.GRADE.UPDATE_FAILED(error.message));
    },
  });

  const handleSaveGrade = useCallback((data: UpdateGradeData) => {
    if (!editingStudent || !editingStudent.gradeId) {
      toast.error(MESSAGES.GRADE.NO_RECORD);
      return;
    }
    gradeMutation.mutate(data);
  }, [editingStudent, gradeMutation]);

  const handleCloseModal = useCallback(() => {
    setEditingStudent(null);
  }, []);

  const handleSetSelectedClass = useCallback((value: string) => {
    setSelectedClass(value);
  }, []);

  const handleEditStudent = useCallback((studentId: string) => {
    const student = students?.find(s => s.id === studentId);
    if (student) {
      setEditingStudent(student);
    }
  }, [students]);

  const selectedClassName = useMemo(() => {
    return classes?.find(c => c.id === selectedClass)?.name || '';
  }, [classes, selectedClass]);

  const tableHeaders = useMemo(() => [
    { key: 'name', label: 'Student Name' },
    { key: 'score', label: 'Score', className: 'text-center' },
    { key: 'feedback', label: 'Feedback' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ], []);

  const tableRows = useMemo(() => (students || []).map(student => ({
    id: student.id,
    cells: [
      { key: 'name', content: student.name, className: 'font-medium' },
      { key: 'score', content: student.score ?? 'N/A', className: 'text-center' },
      {
        key: 'feedback',
        content: student.feedback || 'No feedback',
        className: 'text-muted-foreground truncate max-w-xs',
      },
      {
        key: 'actions',
        content: <GradeActions studentId={student.id} studentName={student.name} onEdit={handleEditStudent} />,
        className: 'text-right',
      },
    ],
  })), [students, handleEditStudent]);

  return (
    <SlideUp className="space-y-6">
      <PageHeader title="Grade Management" />
      <Card>
        <CardHeader>
          <CardTitle>Select a Class</CardTitle>
          <CardDescription>Choose a class to view and manage student grades.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingClasses ? (
            <Skeleton className="h-10 w-full md:w-[280px]" />
          ) : (
            <Select onValueChange={handleSetSelectedClass}>
              <SelectTrigger className="w-full md:w-[280px]">
                <SelectValue placeholder="Select class..." />
              </SelectTrigger>
              <SelectContent>
                {classes?.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>
      {selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle>Students in {selectedClassName}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStudents ? (
              <TableSkeleton columns={4} rows={3} />
            ) : students && students.length > 0 ? (
              <ResponsiveTable headers={tableHeaders} rows={tableRows} />
            ) : (
              <p className="text-muted-foreground text-center py-8">No students found in this class.</p>
            )}
          </CardContent>
        </Card>
      )}
      <GradeForm
        open={!!editingStudent}
        onClose={handleCloseModal}
        editingStudent={editingStudent}
        onSave={handleSaveGrade}
        isLoading={gradeMutation.isPending}
      />
    </SlideUp>
  );
}
