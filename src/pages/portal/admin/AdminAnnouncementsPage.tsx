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
import { formatDateLong } from '@/utils/date';
import { Trash2, Edit, AlertCircle } from 'lucide-react';
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
            By {ann.author} on {formatDateLong(ann.date)}
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
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');

  const validateForm = () => {
    let isValid = true;
    setTitleError('');
    setContentError('');

    if (!newTitle.trim()) {
      setTitleError('Title is required');
      isValid = false;
    } else if (newTitle.trim().length < 5) {
      setTitleError('Title must be at least 5 characters');
      isValid = false;
    }

    if (!newContent.trim()) {
      setContentError('Content is required');
      isValid = false;
    } else if (newContent.trim().length < 10) {
      setContentError('Content must be at least 10 characters');
      isValid = false;
    }

    return isValid;
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to post announcements.');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting.');
      return;
    }

    const newAnnouncement: Announcement = {
      id: `ann-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      author: user.name,
      date: new Date().toISOString(),
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    setNewTitle('');
    setNewContent('');
    setTitleError('');
    setContentError('');
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
              <form onSubmit={handlePostAnnouncement} className="space-y-4" aria-label="Create new announcement form">
                <div className="space-y-2">
                  <Label htmlFor="announcement-title" className="flex items-center gap-2">
                    Title
                    <span className="text-destructive" aria-label="required">*</span>
                  </Label>
                  <Input
                    id="announcement-title"
                    value={newTitle}
                    onChange={(e) => {
                      setNewTitle(e.target.value);
                      if (titleError) setTitleError('');
                    }}
                    placeholder="Announcement Title"
                    aria-required="true"
                    aria-invalid={!!titleError}
                    aria-describedby={titleError ? 'title-error' : 'title-helper'}
                  />
                  <p id="title-helper" className="text-xs text-muted-foreground">Enter a descriptive title (minimum 5 characters)</p>
                  {titleError && (
                    <p id="title-error" className="text-xs text-destructive flex items-center gap-1" role="alert" aria-live="polite">
                      <AlertCircle className="h-3 w-3" aria-hidden="true" />
                      {titleError}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="announcement-content" className="flex items-center gap-2">
                    Content
                    <span className="text-destructive" aria-label="required">*</span>
                  </Label>
                  <Textarea
                    id="announcement-content"
                    value={newContent}
                    onChange={(e) => {
                      setNewContent(e.target.value);
                      if (contentError) setContentError('');
                    }}
                    placeholder="Write your announcement here..."
                    rows={5}
                    aria-required="true"
                    aria-invalid={!!contentError}
                    aria-describedby={contentError ? 'content-error' : 'content-helper'}
                  />
                  <p id="content-helper" className="text-xs text-muted-foreground">Provide detailed information (minimum 10 characters)</p>
                  {contentError && (
                    <p id="content-error" className="text-xs text-destructive flex items-center gap-1" role="alert" aria-live="polite">
                      <AlertCircle className="h-3 w-3" aria-hidden="true" />
                      {contentError}
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full" aria-label="Post new announcement">
                  Post Announcement
                </Button>
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