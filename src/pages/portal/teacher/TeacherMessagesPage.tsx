import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/PageHeader';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, Send, Inbox, User, AlertTriangle, Loader2 } from 'lucide-react';
import { SlideUp } from '@/components/animations';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useAuthStore } from '@/lib/authStore';
import { teacherService } from '@/services/teacherService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from '@/utils/date';
import { logger } from '@/lib/logger';
import { PollingInterval } from '@/config/time';
import { MessageThread, ComposeDialog } from '@/components/messages';
import type { SchoolUser } from '@shared/types';

export function TeacherMessagesPage() {
  const prefersReducedMotion = useReducedMotion();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');

  const teacherId = user?.id || '';

  const {
    data: messages = [],
    isLoading: messagesLoading,
    error: messagesError,
  } = useQuery({
    queryKey: ['teacher-messages', teacherId, activeTab],
    queryFn: () => teacherService.getMessages(teacherId, activeTab),
    enabled: !!teacherId,
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['teacher-unread-count', teacherId],
    queryFn: () => teacherService.getUnreadCount(teacherId),
    enabled: !!teacherId,
    refetchInterval: PollingInterval.THIRTY_SECONDS,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['teacher-classes', teacherId],
    queryFn: () => teacherService.getClasses(teacherId),
    enabled: !!teacherId,
  });

  const classIds = useMemo(() => classes.map((c) => c.id), [classes]);

  const { data: conversation = [], isLoading: conversationLoading } = useQuery({
    queryKey: ['teacher-conversation', teacherId, selectedParentId],
    queryFn: () => teacherService.getConversation(teacherId, selectedParentId!),
    enabled: !!teacherId && !!selectedParentId,
  });

  const { data: parents = [] } = useQuery({
    queryKey: ['class-parents', classIds],
    queryFn: async () => {
      const allParents: SchoolUser[] = [];
      for (const cls of classes) {
        const students = await teacherService.getClassStudentsWithGrades(cls.id);
        for (const student of students) {
          if (student.parentId) {
            const parent = await fetch(`/api/users/${student.parentId}`).then((r) => r.json());
            if (parent && !allParents.find((p) => p.id === parent.id)) {
              allParents.push(parent);
            }
          }
        }
      }
      return allParents;
    },
    enabled: classes.length > 0,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data: { recipientId: string; subject: string; content: string }) =>
      teacherService.sendMessage(teacherId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-messages'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-conversation'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-unread-count'] });
      setSelectedParentId(null);
    },
    onError: (error) => {
      logger.error('Failed to send message', error);
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (messageId: string) => teacherService.markAsRead(teacherId, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-messages'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-unread-count'] });
    },
  });

  const handleSendMessage = (recipientId: string, subject: string, content: string) => {
    sendMessageMutation.mutate({ recipientId, subject, content });
  };

  const uniqueParents = useMemo(
    () =>
      parents.filter((parent, index, self) => index === self.findIndex((p) => p.id === parent.id)),
    [parents]
  );

  if (messagesError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load messages. Please try again later.</AlertDescription>
      </Alert>
    );
  }

  return (
    <SlideUp delay={0} className="space-y-6" style={prefersReducedMotion ? { opacity: 1 } : {}}>
      <SlideUp delay={0.1} style={prefersReducedMotion ? { opacity: 1 } : {}}>
        <PageHeader title="Messages" description="Communicate with parents" />
      </SlideUp>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            <Mail className="h-3 w-3 mr-1" />
            {unreadCount} unread
          </Badge>
        </div>
        <ComposeDialog
          recipients={uniqueParents}
          recipientLabel="To (Parent)"
          recipientPlaceholder="Select a parent"
          onSend={handleSendMessage}
          isLoading={sendMessageMutation.isPending}
        />
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'inbox' | 'sent')}>
        <TabsList>
          <TabsTrigger value="inbox">
            <Inbox className="h-4 w-4 mr-2" />
            Inbox
          </TabsTrigger>
          <TabsTrigger value="sent">
            <Send className="h-4 w-4 mr-2" />
            Sent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Inbox</CardTitle>
            </CardHeader>
            <CardContent>
              {messagesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title="No messages"
                  description="Your inbox is empty. Messages from parents will appear here."
                />
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {messages.map((message) => (
                      <button
                        key={message.id}
                        onClick={() => setSelectedParentId(message.senderId)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          !message.isRead && message.recipientId === teacherId
                            ? 'bg-primary/5 hover:bg-primary/10'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {uniqueParents.find((p) => p.id === message.senderId)?.name ||
                                'Parent'}
                            </span>
                            {!message.isRead && message.recipientId === teacherId && (
                              <Badge variant="default" className="text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(message.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm font-medium mt-1 truncate">{message.subject}</p>
                        <p className="text-sm text-muted-foreground truncate">{message.content}</p>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sent Messages</CardTitle>
            </CardHeader>
            <CardContent>
              {messagesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <EmptyState
                  icon={Send}
                  title="No sent messages"
                  description="Messages you send will appear here."
                />
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {messages.map((message) => (
                      <button
                        key={message.id}
                        onClick={() => setSelectedParentId(message.recipientId)}
                        className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              To:{' '}
                              {uniqueParents.find((p) => p.id === message.recipientId)?.name ||
                                'Parent'}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(message.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm font-medium mt-1 truncate">{message.subject}</p>
                        <p className="text-sm text-muted-foreground truncate">{message.content}</p>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedParentId && (
        <Dialog open={!!selectedParentId} onOpenChange={() => setSelectedParentId(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>
                Conversation with{' '}
                {uniqueParents.find((p) => p.id === selectedParentId)?.name || 'Parent'}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              {conversationLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <MessageThread
                  messages={conversation}
                  currentUserId={teacherId}
                  onMarkAsRead={(messageId) => markAsReadMutation.mutate(messageId)}
                />
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </SlideUp>
  );
}

export default TeacherMessagesPage;
