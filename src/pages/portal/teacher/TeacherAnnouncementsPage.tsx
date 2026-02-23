import { useCallback, memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/PageHeader'
import { useAuthStore } from '@/lib/authStore'
import { SlideUp } from '@/components/animations'
import { EmptyState } from '@/components/ui/empty-state'
import { AnnouncementLayout } from '@/components/dashboard/AnnouncementLayout'
import { toast } from 'sonner'
import { formatDateLong } from '@/utils/date'
import { InlineAnnouncementForm } from '@/components/forms/InlineAnnouncementForm'
import { useTeacherAnnouncements, useCreateAnnouncement } from '@/hooks/useTeacher'
import type { Announcement } from '@shared/types'
import { Inbox } from 'lucide-react'

const AnnouncementItem = memo(({ ann, isLast }: { ann: Announcement; isLast: boolean }) => (
  <div>
    <div>
      <h3 className="font-semibold">{ann.title}</h3>
      <p className="text-sm text-muted-foreground">{formatDateLong(ann.date)}</p>
      <p className="mt-2 text-sm">{ann.content}</p>
    </div>
    {!isLast && <Separator className="mt-6" />}
  </div>
))
AnnouncementItem.displayName = 'AnnouncementItem'

export function TeacherAnnouncementsPage() {
  const user = useAuthStore(state => state.user)
  const teacherId = user?.id ?? ''

  const { data: announcements, isLoading, error, refetch } = useTeacherAnnouncements(teacherId)
  const createMutation = useCreateAnnouncement({
    onSuccess: () => {
      toast.success('Announcement posted successfully!')
    },
    onError: err => {
      toast.error(`Failed to post announcement: ${err.message}`)
    },
  })

  const handlePostAnnouncement = useCallback(
    (data: { title: string; content: string }) => {
      if (!user) {
        toast.error('You must be logged in to post announcements.')
        return
      }

      createMutation.mutate({
        title: data.title,
        content: data.content,
        targetRole: 'all',
      })
    },
    [user, createMutation]
  )

  return (
    <AnnouncementLayout isLoading={isLoading} error={error} onRetry={() => refetch()}>
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
                <InlineAnnouncementForm
                  onSave={handlePostAnnouncement}
                  isLoading={createMutation.isPending}
                />
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
                      isLast={index === announcements.length - 1}
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
      </SlideUp>
    </AnnouncementLayout>
  )
}
