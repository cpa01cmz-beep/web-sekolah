import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SlideUp } from '@/components/animations';
import { toast } from 'sonner';
import { useQuery, useMutation, queryClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/authStore';
import type { SchoolClass } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { TableSkeleton } from '@/components/ui/loading-skeletons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { isValidScore, MIN_SCORE, MAX_SCORE } from '@/utils/validation';

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
  const [currentScore, setCurrentScore] = useState<string>('');
  const [currentFeedback, setCurrentFeedback] = useState<string>('');
  const { data: classes, isLoading: isLoadingClasses } = useQuery<SchoolClass[]>(
    ['teachers', user?.id || '', 'classes'],
    { enabled: !!user }
  );
  const { data: students, isLoading: isLoadingStudents } = useQuery<StudentGrade[]>(
    ['classes', selectedClass || '', 'students'],
    { enabled: !!selectedClass }
  );
  const gradeMutation = useMutation<UpdateGradeData, Error, UpdateGradeData>(['grades', editingStudent?.gradeId || ''], {
    method: 'PUT',
    onSuccess: () => {
      toast.success(`Grade for ${editingStudent?.name} updated successfully.`);
      queryClient.invalidateQueries({ queryKey: ['classes', selectedClass, 'students'] });
      setEditingStudent(null);
    },
    onError: (error) => {
      toast.error(`Failed to update grade: ${error.message}`);
    },
  });
  const handleSaveChanges = () => {
    if (!editingStudent || !editingStudent.gradeId) {
        toast.error("Cannot save changes. No grade record exists for this student yet.");
        return;
    };
    const scoreValue = currentScore === '' ? null : parseInt(currentScore, 10);
    if (!isValidScore(scoreValue)) {
      toast.error(`Please enter a valid score between ${MIN_SCORE} and ${MAX_SCORE}.`);
      return;
    }
    gradeMutation.mutate({ score: scoreValue, feedback: currentFeedback });
  };
  const handleEditClick = (student: StudentGrade) => {
    setEditingStudent(student);
    setCurrentScore(student.score?.toString() || '');
    setCurrentFeedback(student.feedback || '');
  };

  const isScoreInvalid = useMemo(() => {
    if (currentScore === '') return false;
    const score = parseInt(currentScore, 10);
    return !isValidScore(score);
  }, [currentScore]);
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
            <CardTitle>Students in {classes?.find(c => c.id === selectedClass)?.name}</CardTitle>
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
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell className="text-center">{student.score ?? 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground truncate max-w-xs">{student.feedback}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleEditClick(student)} 
                            aria-label={`Edit grade for ${student.name}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
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
      {editingStudent && (
        <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Grade for {editingStudent.name}</DialogTitle>
              <DialogDescription>Update the score and provide feedback.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="score" className="text-right pt-2">
                  Score
                </Label>
                <div className="col-span-3 space-y-2">
                  <Input
                    id="score"
                    type="number"
                    value={currentScore}
                    onChange={(e) => setCurrentScore(e.target.value)}
                    className="col-span-3"
                    placeholder="0-100"
                    min="0"
                    max="100"
                    step="1"
                    aria-invalid={isScoreInvalid}
                    aria-describedby="score-helper score-error"
                  />
                  <p id="score-helper" className="text-xs text-muted-foreground">Enter a score between 0 and 100. Leave empty for no score.</p>
                  {isScoreInvalid && (
                    <p id="score-error" className="text-xs text-destructive" role="alert">
                      Please enter a valid score between 0 and 100
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="feedback" className="text-right pt-2">
                  Feedback
                </Label>
                <div className="col-span-3 space-y-2">
                  <Textarea
                    id="feedback"
                    value={currentFeedback}
                    onChange={(e) => setCurrentFeedback(e.target.value)}
                    className="col-span-3"
                    placeholder="Enter feedback..."
                    rows={3}
                    aria-describedby="feedback-helper"
                  />
                  <p id="feedback-helper" className="text-xs text-muted-foreground">Provide constructive feedback to help student improve</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
              <Button type="submit" onClick={handleSaveChanges} disabled={gradeMutation.isPending} aria-busy={gradeMutation.isPending}>
                {gradeMutation.isPending ? 'Saving...' : 'Save changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </SlideUp>
  );
}
