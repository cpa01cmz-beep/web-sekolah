import { useState, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/PageHeader';
import { SlideUp } from '@/components/animations';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Trash2, Edit } from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';
type Announcement = {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
};
const initialAnnouncements: Announcement[] = [
  { id: 'ann1', title: 'Mid-term Exam Schedule', content: 'The mid-term exam schedule has been posted. Please check main notice board.', author: 'Admin Sekolah', date: new Date('2024-07-18').toISOString() },
  { id: 'ann2', title: 'Class 11-A Project Deadline', content: 'Reminder: The mathematics project is due this Friday.', author: 'Ibu Siti', date: new Date('2024-07-22').toISOString() },
  { id: 'ann3', title: 'Parent-Teacher Meeting Schedule', content: 'The parent-teacher meeting will be held next Saturday.', author: 'Admin Sekolah', date: new Date('2024-07-19').toISOString() },
];

const AnnouncementItem = memo(({ ann, index, total, onDelete }: { ann: Announcement; index: number; total: number; onDelete: (id: string) => void }) => {
  return (
    <div>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{ann.title}</h3>
          <p className="text-sm text-muted-foreground">
            By {ann.author} on {format(new Date(ann.date), 'PPP')}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" className="h-8 w-8" aria-label={`Edit announcement: ${ann.title}`}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => onDelete(ann.id)} aria-label={`Delete announcement: ${ann.title}`}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="mt-2 text-sm">{ann.content}</p>
      {index < total - 1 && <Separator className="mt-6" />}
    </div>
  );
});
AnnouncementItem.displayName = 'AnnouncementItem';
export function AdminAnnouncementsPage() {
  const user = useAuthStore((state) => state.user);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !user) {
      toast.error('Title and content cannot be empty.');
      return;
    }
    const newAnnouncement: Announcement = {
      id: `ann-${Date.now()}`,
      title: newTitle,
      content: newContent,
      author: user.name,
      date: new Date().toISOString(),
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    setNewTitle('');
    setNewContent('');
    toast.success('Announcement posted successfully!');
  };
  const handleDelete = (id: string) => {
    setAnnouncements(announcements.filter(ann => ann.id !== id));
    toast.success('Announcement deleted.');
  };
  return (
    <SlideUp className="space-y-6">
      <PageHeader title="Manage Announcements" />
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Create Announcement</CardTitle>
              <CardDescription>Post a new school-wide announcement.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePostAnnouncement} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Announcement Title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea id="content" value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Write your announcement here..." rows={5} />
                </div>
                <Button type="submit" className="w-full">Post Announcement</Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Posted Announcements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {announcements.length > 0 ? (
                announcements.map((ann, index) => (
                  <AnnouncementItem
                    key={ann.id}
                    ann={ann}
                    index={index}
                    total={announcements.length}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No announcements posted yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SlideUp>
  );
}