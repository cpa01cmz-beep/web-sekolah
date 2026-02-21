import { useState } from 'react';
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
import { parentService } from '@/services/parentService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from '@/utils/date';
import { logger } from '@/lib/logger';
import { PollingInterval } from '@/config/time';
import { MessageThread, ComposeDialog } from '@/components/messages';

export function ParentMessagesPage() {
  const prefersReducedMotion = useReducedMotion();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');

  const parentId = user?.id || '';

  const {
    data: messages = [],
    isLoading: messagesLoading,
    error: messagesError,
  } = useQuery({
    queryKey: ['parent-messages', parentId, activeTab],
    queryFn: () => parentService.getMessages(parentId, activeTab),
    enabled: !!parentId,
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['parent-unread-count', parentId],
    queryFn: () => parentService.getUnreadCount(parentId),
    enabled: !!parentId,
    refetchInterval: PollingInterval.THIRTY_SECONDS,
  });

  const { data: teachers = [], isLoading: teachersLoading } = useQuery({
    queryKey: ['parent-teachers', parentId],
    queryFn: () => parentService.getChildTeachers(parentId),
    enabled: !!parentId,
  });

  const { data: conversation = [], isLoading: conversationLoading } = useQuery({
    queryKey: ['parent-conversation', parentId, selectedTeacherId],
    queryFn: () => parentService.getConversation(parentId, selectedTeacherId!),
    enabled: !!parentId && !!selectedTeacherId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data: { recipientId: string; subject: string; content: string }) =>
      parentService.sendMessage(parentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-messages'] });
      queryClient.invalidateQueries({ queryKey: ['parent-conversation'] });
      queryClient.invalidateQueries({ queryKey: ['parent-unread-count'] });
      setSelectedTeacherId(null);
    },
    onError: (error) => {
      logger.error('Failed to send message', error);
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (messageId: string) => parentService.markAsRead(parentId, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-messages'] });
      queryClient.invalidateQueries({ queryKey: ['parent-unread-count'] });
    },
  });

  if (messagesError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load messages. Please try again later.</AlertDescription>
      </Alert>
    );
  }

  const handleSendMessage = (recipientId: string, subject: string, content: string) => {
    sendMessageMutation.mutate({ recipientId, subject, content });
  };

  return (
    <SlideUp delay={0} className="space-y-6" style={prefersReducedMotion ? { opacity: 1 } : {}}>
      <SlideUp delay={0.1} style={prefersReducedMotion ? { opacity: 1 } : {}}>
        <PageHeader title="Messages" description="Communicate with your child's teachers" />
      </SlideUp>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            <Mail className="h-3 w-3 mr-1" />
            {unreadCount} unread
          </Badge>
        </div>
        <ComposeDialog
          recipients={teachers}
          recipientLabel="To (Teacher)"
          recipientPlaceholder="Select a teacher"
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
                  description="Your inbox is empty. Messages from teachers will appear here."
                />
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {messages.map((message) => (
                      <button
                        key={message.id}
                        onClick={() => setSelectedTeacherId(message.senderId)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          !message.isRead && message.recipientId === parentId
                            ? 'bg-primary/5 hover:bg-primary/10'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {teachers.find((t) => t.id === message.senderId)?.name || 'Teacher'}
                            </span>
                            {!message.isRead && message.recipientId === parentId && (
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
                        onClick={() => setSelectedTeacherId(message.recipientId)}
                        className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              To:{' '}
                              {teachers.find((t) => t.id === message.recipientId)?.name ||
                                'Teacher'}
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

      {selectedTeacherId && (
        <Dialog open={!!selectedTeacherId} onOpenChange={() => setSelectedTeacherId(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>
                Conversation with{' '}
                {teachers.find((t) => t.id === selectedTeacherId)?.name || 'Teacher'}
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
                  currentUserId={parentId}
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

export default ParentMessagesPage;
