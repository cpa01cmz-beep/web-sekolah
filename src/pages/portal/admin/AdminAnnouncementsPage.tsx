import { useState, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/PageHeader';
import { SlideUp } from '@/components/animations';
import { toast } from 'sonner';
import { formatDateLong } from '@/utils/date';
import { Trash2, Edit } from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';
import { AnnouncementForm } from '@/components/forms/AnnouncementForm';
import { initialAnnouncements } from '@/mock-data/announcements';
import type { Announcement } from '@/mock-data/announcements';

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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const handlePostAnnouncement = (data: { title: string; content: string }) => {
    if (!user) {
      toast.error('You must be logged in to post announcements.');
      return;
    }

    setIsPosting(true);
    const newAnnouncement: Announcement = {
      id: `ann-${Date.now()}`,
      title: data.title,
      content: data.content,
      author: user.name,
      date: new Date().toISOString(),
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    setIsFormOpen(false);
    setIsPosting(false);
    toast.success('Announcement posted successfully!');
  };

  const handleDelete = (id: string) => {
    setAnnouncements(announcements.filter(ann => ann.id !== id));
    toast.success('Announcement deleted.');
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
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
              <Button
                onClick={() => setIsFormOpen(true)}
                className="w-full"
              >
                Create New Announcement
              </Button>
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
      <AnnouncementForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSave={handlePostAnnouncement}
        isLoading={isPosting}
      />
    </SlideUp>
  );
}
