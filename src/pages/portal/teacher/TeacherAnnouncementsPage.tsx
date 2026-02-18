import { useState, useCallback, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/PageHeader';
import { useAuthStore } from '@/lib/authStore';
import { SlideUp } from '@/components/animations';
import { toast } from 'sonner';
import { formatDateLong } from '@/utils/date';
import { initialAnnouncements } from '@/mock-data/announcements';
import type { Announcement } from '@/mock-data/announcements';
import { InlineAnnouncementForm } from '@/components/forms/InlineAnnouncementForm';
import { MESSAGES } from '@/constants/messages';

const AnnouncementItem = memo(({ ann, isLast }: { ann: Announcement; isLast: boolean }) => (
  <div>
    <div>
      <h3 className="font-semibold">{ann.title}</h3>
      <p className="text-sm text-muted-foreground">
        By {ann.author} on {formatDateLong(ann.date)}
      </p>
      <p className="mt-2 text-sm">{ann.content}</p>
    </div>
    {!isLast && <Separator className="mt-6" />}
  </div>
));
AnnouncementItem.displayName = 'AnnouncementItem';

export function TeacherAnnouncementsPage() {
  const user = useAuthStore((state) => state.user);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [isPosting, setIsPosting] = useState(false);

  const handlePostAnnouncement = useCallback((data: { title: string; content: string }) => {
    if (!user) {
      toast.error(MESSAGES.ANNOUNCEMENT.LOGIN_REQUIRED);
      return;
    }

    setIsPosting(true);
    const newAnnouncement: Announcement = {
      id: `ann${announcements.length + 1}`,
      title: data.title,
      content: data.content,
      author: user.name,
      date: new Date().toISOString(),
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    setIsPosting(false);
    toast.success(MESSAGES.ANNOUNCEMENT.POSTED);
  }, [user, announcements]);

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
              <InlineAnnouncementForm onSave={handlePostAnnouncement} isLoading={isPosting} />
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
                    isLast={index === announcements.length - 1}
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
