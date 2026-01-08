import { useState, useMemo, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SlideUp } from '@/components/animations';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/authStore';
import { useMutation, queryClient } from '@/lib/api-client';
import { useTeacherClasses, useTeacherClassStudents } from '@/hooks/useTeacher';
import { Skeleton } from '@/components/ui/skeleton';
import { TableSkeleton } from '@/components/ui/loading-skeletons';
import { GradeForm } from '@/components/forms/GradeForm';

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

const StudentGradeRow = memo(({ student, onEdit }: { student: StudentGrade; onEdit: (student: StudentGrade) => void }) => {
  return (
    <TableRow key={student.id}>
      <TableCell className="font-medium">{student.name}</TableCell>
      <TableCell className="text-center">{student.score ?? 'N/A'}</TableCell>
      <TableCell className="text-muted-foreground truncate max-w-xs">{student.feedback}</TableCell>
      <TableCell className="text-right">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onEdit(student)}
          aria-label={`Edit grade for ${student.name}`}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
});
StudentGradeRow.displayName = 'StudentGradeRow';
export function TeacherGradeManagementPage() {
  const user = useAuthStore((state) => state.user);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<StudentGrade | null>(null);
  const { data: classes, isLoading: isLoadingClasses } = useTeacherClasses(user?.id || '');
  const { data: students, isLoading: isLoadingStudents } = useTeacherClassStudents(selectedClass || '');
  const gradeMutation = useMutation<UpdateGradeData, Error, UpdateGradeData>(['grades', editingStudent?.gradeId || ''], {
    method: 'PUT',
    onSuccess: () => {
      toast.success(`Grade for ${editingStudent?.name} updated successfully.`);
      queryClient.invalidateQueries({ queryKey: ['classes', selectedClass || '', 'students'] });
      setEditingStudent(null);
    },
    onError: (error) => {
      toast.error(`Failed to update grade: ${error.message}`);
    },
  });

  const handleSaveGrade = (data: UpdateGradeData) => {
    if (!editingStudent || !editingStudent.gradeId) {
      toast.error("Cannot save changes. No grade record exists for this student yet.");
      return;
    }
    gradeMutation.mutate(data);
  };

  const handleCloseModal = () => {
    setEditingStudent(null);
  };

  const selectedClassName = useMemo(() => {
    return classes?.find(c => c.id === selectedClass)?.name || '';
  }, [classes, selectedClass]);
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
            <Select onValueChange={setSelectedClass}>
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead className="text-center">Score</TableHead>
                      <TableHead>Feedback</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                      <TableBody>
                    {students.map(student => (
                      <StudentGradeRow
                        key={student.id}
                        student={student}
                        onEdit={(student) => setEditingStudent(student)}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No students found in this class.</p>
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
