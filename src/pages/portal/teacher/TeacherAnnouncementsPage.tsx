import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/PageHeader';
import { useAuthStore } from '@/lib/authStore';
import { SlideUp } from '@/components/animations';
import { toast } from 'sonner';
import { formatDateLong } from '@/utils/date';
import { initialAnnouncements } from '@/mock-data/announcements';
import type { Announcement } from '@/mock-data/announcements';
export function TeacherAnnouncementsPage() {
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
      id: `ann${announcements.length + 1}`,
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
  return (
    <SlideUp className="space-y-6">
      <PageHeader title="Announcements" />
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Create Announcement</CardTitle>
              <CardDescription>Post a new announcement for students and parents.</CardDescription>
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
                  <div key={ann.id}>
                    <div>
                      <h3 className="font-semibold">{ann.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        By {ann.author} on {formatDateLong(ann.date)}
                      </p>
                      <p className="mt-2 text-sm">{ann.content}</p>
                    </div>
                    {index < announcements.length - 1 && <Separator className="mt-6" />}
                  </div>
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