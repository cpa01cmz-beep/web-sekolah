import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
type StudentGrade = {
  id: string;
  name: string;
  score: number | null;
  feedback: string;
};
const mockClasses = [
  { id: '11-A', name: 'Class 11-A' },
  { id: '12-B', name: 'Class 12-B' },
  { id: '11-C', name: 'Class 11-C' },
];
const mockStudents: Record<string, StudentGrade[]> = {
  '11-A': Array.from({ length: 10 }, (_, i) => ({ id: `s11a-${i+1}`, name: `Student 11A-${i+1}`, score: Math.random() > 0.2 ? Math.floor(70 + Math.random() * 30) : null, feedback: 'Good progress.' })),
  '12-B': Array.from({ length: 8 }, (_, i) => ({ id: `s12b-${i+1}`, name: `Student 12B-${i+1}`, score: Math.random() > 0.2 ? Math.floor(65 + Math.random() * 35) : null, feedback: 'Needs improvement in homework.' })),
  '11-C': Array.from({ length: 12 }, (_, i) => ({ id: `s11c-${i+1}`, name: `Student 11C-${i+1}`, score: Math.random() > 0.2 ? Math.floor(75 + Math.random() * 25) : null, feedback: 'Excellent participation.' })),
};
export function TeacherGradeManagementPage() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentGrade[]>([]);
  const [editingStudent, setEditingStudent] = useState<StudentGrade | null>(null);
  const [currentScore, setCurrentScore] = useState<string>('');
  const [currentFeedback, setCurrentFeedback] = useState<string>('');
  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    setStudents(mockStudents[classId] || []);
  };
  const handleEditClick = (student: StudentGrade) => {
    setEditingStudent(student);
    setCurrentScore(student.score?.toString() || '');
    setCurrentFeedback(student.feedback || '');
  };
  const handleSaveChanges = () => {
    if (!editingStudent) return;
    const scoreValue = currentScore === '' ? null : parseInt(currentScore, 10);
    if (scoreValue !== null && (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100)) {
      toast.error('Please enter a valid score between 0 and 100.');
      return;
    }
    setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...s, score: scoreValue, feedback: currentFeedback } : s));
    toast.success(`Grade for ${editingStudent.name} updated successfully.`);
    setEditingStudent(null);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold">Grade Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Select a Class</CardTitle>
          <CardDescription>Choose a class to view and manage student grades.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleClassChange}>
            <SelectTrigger className="w-full md:w-[280px]">
              <SelectValue placeholder="Select class..." />
            </SelectTrigger>
            <SelectContent>
              {mockClasses.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      {selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle>Students in {mockClasses.find(c => c.id === selectedClass)?.name}</CardTitle>
          </CardHeader>
          <CardContent>
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
                      <Dialog onOpenChange={(open) => !open && setEditingStudent(null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => handleEditClick(student)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        {editingStudent && editingStudent.id === student.id && (
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Grade for {editingStudent.name}</DialogTitle>
                              <DialogDescription>Update the score and provide feedback.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="score" className="text-right">Score</Label>
                                <Input id="score" type="number" value={currentScore} onChange={(e) => setCurrentScore(e.target.value)} className="col-span-3" placeholder="0-100" />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="feedback" className="text-right">Feedback</Label>
                                <Textarea id="feedback" value={currentFeedback} onChange={(e) => setCurrentFeedback(e.target.value)} className="col-span-3" placeholder="Enter feedback..." />
                              </div>
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button type="button" variant="secondary">Cancel</Button>
                              </DialogClose>
                              <Button type="submit" onClick={handleSaveChanges}>Save changes</Button>
                            </DialogFooter>
                          </DialogContent>
                        )}
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}