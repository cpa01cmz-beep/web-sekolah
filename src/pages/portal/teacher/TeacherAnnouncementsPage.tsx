import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form-field';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/PageHeader';
import { useAuthStore } from '@/lib/authStore';
import { SlideUp } from '@/components/animations';
import { toast } from 'sonner';
import { formatDateLong } from '@/utils/date';
import { validateTitle, validateContent } from '@/utils/validation';
import { initialAnnouncements } from '@/mock-data/announcements';
import type { Announcement } from '@/mock-data/announcements';

export function TeacherAnnouncementsPage() {
  const user = useAuthStore((state) => state.user);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const titleError = useMemo(() => validateTitle(newTitle, showValidationErrors, 5), [newTitle, showValidationErrors]);
  const contentError = useMemo(() => validateContent(newContent, showValidationErrors, 10), [newContent, showValidationErrors]);

  const handlePostAnnouncement = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidationErrors(true);

    if (!user || titleError || contentError) {
      return;
    }

    setIsPosting(true);
    const newAnnouncement: Announcement = {
      id: `ann${announcements.length + 1}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      author: user.name,
      date: new Date().toISOString(),
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    setNewTitle('');
    setNewContent('');
    setShowValidationErrors(false);
    setIsPosting(false);
    toast.success('Announcement posted successfully!');
  }, [user, announcements, newTitle, newContent, titleError, contentError]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(e.target.value);
  }, []);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewContent(e.target.value);
  }, []);

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
                <FormField
                  id="title"
                  label="Title"
                  error={titleError}
                  helperText="Enter a descriptive title (minimum 5 characters)"
                  required
                >
                  <Input
                    id="title"
                    value={newTitle}
                    onChange={handleTitleChange}
                    placeholder="Announcement Title"
                    disabled={isPosting}
                    aria-required="true"
                    aria-invalid={!!titleError}
                    aria-describedby={titleError ? 'title-error' : 'title-helper'}
                    aria-busy={isPosting}
                  />
                </FormField>
                <FormField
                  id="content"
                  label="Content"
                  error={contentError}
                  helperText="Provide detailed information (minimum 10 characters)"
                  required
                >
                  <Textarea
                    id="content"
                    value={newContent}
                    onChange={handleContentChange}
                    placeholder="Write your announcement here..."
                    rows={5}
                    disabled={isPosting}
                    aria-required="true"
                    aria-invalid={!!contentError}
                    aria-describedby={contentError ? 'content-error' : 'content-helper'}
                    aria-busy={isPosting}
                  />
                </FormField>
                <Button type="submit" className="w-full" disabled={isPosting} aria-busy={isPosting}>
                  {isPosting ? 'Posting...' : 'Post Announcement'}
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