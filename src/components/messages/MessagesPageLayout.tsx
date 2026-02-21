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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from '@/utils/date';
import { logger } from '@/lib/logger';
import { PollingInterval } from '@/config/time';
import { MessageThread, ComposeDialog } from '@/components/messages';
import type { Message, SchoolUser } from '@shared/types';

interface MessagesPageConfig {
  userId: string;
  queryKeyPrefix: string;
  pageDescription: string;
  recipientLabel: string;
  recipientPlaceholder: string;
  recipientRoleLabel: string;
  getMessages: (userId: string, tab: 'inbox' | 'sent') => Promise<Message[]>;
  getUnreadCount: (userId: string) => Promise<number>;
  getRecipients: (userId: string) => Promise<SchoolUser[]>;
  getConversation: (userId: string, otherUserId: string) => Promise<Message[]>;
  sendMessage: (userId: string, data: { recipientId: string; subject: string; content: string }) => Promise<void>;
  markAsRead: (userId: string, messageId: string) => Promise<void>;
}

export function MessagesPageLayout(config: MessagesPageConfig) {
  const {
    userId,
    queryKeyPrefix,
    pageDescription,
    recipientLabel,
    recipientPlaceholder,
    recipientRoleLabel,
    getMessages,
    getUnreadCount,
    getRecipients,
    getConversation,
    sendMessage,
    markAsRead,
  } = config;

  const prefersReducedMotion = useReducedMotion();
  const queryClient = useQueryClient();
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');

  const { data: messages = [], isLoading: messagesLoading, error: messagesError } = useQuery({
    queryKey: [`${queryKeyPrefix}-messages`, userId, activeTab],
    queryFn: () => getMessages(userId, activeTab),
    enabled: !!userId,
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: [`${queryKeyPrefix}-unread-count`, userId],
    queryFn: () => getUnreadCount(userId),
    enabled: !!userId,
    refetchInterval: PollingInterval.THIRTY_SECONDS,
  });

  const { data: recipients = [] } = useQuery({
    queryKey: [`${queryKeyPrefix}-recipients`, userId],
    queryFn: () => getRecipients(userId),
    enabled: !!userId,
  });

  const { data: conversation = [], isLoading: conversationLoading } = useQuery({
    queryKey: [`${queryKeyPrefix}-conversation`, userId, selectedRecipientId],
    queryFn: () => getConversation(userId, selectedRecipientId!),
    enabled: !!userId && !!selectedRecipientId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data: { recipientId: string; subject: string; content: string }) =>
      sendMessage(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${queryKeyPrefix}-messages`] });
      queryClient.invalidateQueries({ queryKey: [`${queryKeyPrefix}-conversation`] });
      queryClient.invalidateQueries({ queryKey: [`${queryKeyPrefix}-unread-count`] });
      setSelectedRecipientId(null);
    },
    onError: (error) => {
      logger.error('Failed to send message', error);
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (messageId: string) => markAsRead(userId, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${queryKeyPrefix}-messages`] });
      queryClient.invalidateQueries({ queryKey: [`${queryKeyPrefix}-unread-count`] });
    },
  });

  const handleSendMessage = (recipientId: string, subject: string, content: string) => {
    sendMessageMutation.mutate({ recipientId, subject, content });
  };

  const getRecipientName = (id: string): string => {
    return recipients.find(r => r.id === id)?.name || recipientRoleLabel;
  };

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
        <PageHeader
          title="Messages"
          description={pageDescription}
        />
      </SlideUp>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            <Mail className="h-3 w-3 mr-1" />
            {unreadCount} unread
          </Badge>
        </div>
        <ComposeDialog
          recipients={recipients}
          recipientLabel={recipientLabel}
          recipientPlaceholder={recipientPlaceholder}
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
                  description={`Your inbox is empty. Messages from ${recipientRoleLabel.toLowerCase()}s will appear here.`}
                />
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {messages.map((message) => (
                      <button
                        key={message.id}
                        onClick={() => setSelectedRecipientId(message.senderId)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          !message.isRead && message.recipientId === userId
                            ? 'bg-primary/5 hover:bg-primary/10'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{getRecipientName(message.senderId)}</span>
                            {!message.isRead && message.recipientId === userId && (
                              <Badge variant="default" className="text-xs">New</Badge>
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
                        onClick={() => setSelectedRecipientId(message.recipientId)}
                        className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">To: {getRecipientName(message.recipientId)}</span>
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

      {selectedRecipientId && (
        <Dialog open={!!selectedRecipientId} onOpenChange={() => setSelectedRecipientId(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>
                Conversation with {getRecipientName(selectedRecipientId)}
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
                  currentUserId={userId}
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
