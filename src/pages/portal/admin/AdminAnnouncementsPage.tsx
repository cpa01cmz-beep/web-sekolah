import { useState, memo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PageHeader } from '@/components/PageHeader';
import { SlideUp } from '@/components/animations';
import { CardSkeleton } from '@/components/ui/loading-skeletons';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from 'sonner';
import { formatDateLong } from '@/utils/date';
import { Trash2, Edit, AlertTriangle, Inbox, Plus, RefreshCw } from 'lucide-react';
import { AnnouncementForm } from '@/components/forms/AnnouncementForm';
import { useAnnouncements, useCreateAnnouncement, useDeleteAnnouncement } from '@/hooks/useAdmin';
import type { Announcement } from '@shared/types';

const AnnouncementItem = memo(({ ann, index, total, onDelete, isDeleting }: { 
  ann: Announcement; 
  index: number; 
  total: number; 
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) => {
  const handleDelete = useCallback(() => {
    onDelete(ann.id);
  }, [onDelete, ann.id]);

  return (
    <div>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold">{ann.title}</h3>
          <p className="text-sm text-muted-foreground">
            {formatDateLong(ann.date)}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" className="h-8 w-8" aria-label={`Edit announcement: ${ann.title}`}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="destructive" 
            size="icon" 
            className="h-8 w-8" 
            onClick={handleDelete} 
            aria-label={`Delete announcement: ${ann.title}`}
            disabled={isDeleting}
          >
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const { data: announcements, isLoading, error, refetch } = useAnnouncements();
  const createMutation = useCreateAnnouncement({
    onSuccess: () => {
      toast.success('Announcement posted successfully!');
      setIsFormOpen(false);
    },
    onError: (err) => {
      toast.error(`Failed to post announcement: ${err.message}`);
    },
  });
  const deleteMutation = useDeleteAnnouncement({
    onSuccess: () => {
      toast.success('Announcement deleted.');
    },
    onError: (err) => {
      toast.error(`Failed to delete announcement: ${err.message}`);
    },
  });

  const handlePostAnnouncement = useCallback((data: { title: string; content: string }) => {
    createMutation.mutate({
      title: data.title,
      content: data.content,
      targetRole: 'all',
    });
  }, [createMutation]);

  const handleDelete = useCallback((id: string) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
  }, []);

  const handleOpenForm = useCallback(() => {
    setIsFormOpen(true);
  }, []);

  if (isLoading) {
    return (
      <SlideUp className="space-y-6">
        <PageHeader title="Manage Announcements" />
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <CardSkeleton lines={2} />
          </div>
          <div className="md:col-span-2">
            <CardSkeleton lines={5} />
          </div>
        </div>
      </SlideUp>
    );
  }

  if (error) {
    return (
      <SlideUp className="space-y-6">
        <PageHeader title="Manage Announcements" />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load announcements. Please try again later.</AlertDescription>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </Alert>
      </SlideUp>
    );
  }

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
                onClick={handleOpenForm}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
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
              {announcements && announcements.length > 0 ? (
                announcements.map((ann, index) => (
                  <AnnouncementItem
                    key={ann.id}
                    ann={ann}
                    index={index}
                    total={announcements.length}
                    onDelete={handleDelete}
                    isDeleting={deleteMutation.isPending}
                  />
                ))
              ) : (
                <EmptyState
                  icon={Inbox}
                  title="No announcements"
                  description="No announcements have been posted yet. Create your first announcement above."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <AnnouncementForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSave={handlePostAnnouncement}
        isLoading={createMutation.isPending}
      />
    </SlideUp>
  );
}
