import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/PageHeader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, Send, Inbox, MessageSquare, User, AlertTriangle, Loader2 } from 'lucide-react';
import { SlideUp } from '@/components/animations';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useAuthStore } from '@/lib/authStore';
import { teacherService } from '@/services/teacherService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from '@/utils/date';
import type { Message, SchoolUser, Parent } from '@shared/types';
import { logger } from '@/lib/logger';

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
  onMarkAsRead: (messageId: string) => void;
}

function MessageThread({ messages, currentUserId, onMarkAsRead }: MessageThreadProps) {
  useEffect(() => {
    messages.forEach(msg => {
      if (!msg.isRead && msg.recipientId === currentUserId) {
        onMarkAsRead(msg.id);
      }
    });
  }, [messages, currentUserId, onMarkAsRead]);

  if (messages.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No messages"
        description="Start a conversation by sending a message."
      />
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isSent = message.senderId === currentUserId;
        return (
          <div
            key={message.id}
            className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                isSent
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm font-medium mb-1">{message.subject}</p>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-2 ${isSent ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                {formatDistanceToNow(message.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const MemoizedMessageThread = memo(MessageThread);

interface ComposeDialogProps {
  parents: SchoolUser[];
  onSend: (recipientId: string, subject: string, content: string) => void;
  isLoading: boolean;
}

function ComposeDialog({ parents, onSend, isLoading }: ComposeDialogProps) {
  const [open, setOpen] = useState(false);
  const [recipientId, setRecipientId] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  const handleSend = useCallback(() => {
    if (!recipientId || !subject.trim() || !content.trim()) return;
    onSend(recipientId, subject.trim(), content.trim());
    setOpen(false);
    setRecipientId('');
    setSubject('');
    setContent('');
  }, [recipientId, subject, content, onSend]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Send className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Compose Message</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">To (Parent)</label>
            <Select value={recipientId} onValueChange={setRecipientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a parent" />
              </SelectTrigger>
              <SelectContent>
                {parents.map((parent) => (
                  <SelectItem key={parent.id} value={parent.id}>
                    {parent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <Input
              placeholder="Enter subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea
              placeholder="Type your message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!recipientId || !subject.trim() || !content.trim()}
            isLoading={isLoading}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const MemoizedComposeDialog = memo(ComposeDialog);

export function TeacherMessagesPage() {
  const prefersReducedMotion = useReducedMotion();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');

  const teacherId = user?.id || '';

  const { data: messages = [], isLoading: messagesLoading, error: messagesError } = useQuery({
    queryKey: ['teacher-messages', teacherId, activeTab],
    queryFn: () => teacherService.getMessages(teacherId, activeTab),
    enabled: !!teacherId,
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['teacher-unread-count', teacherId],
    queryFn: () => teacherService.getUnreadCount(teacherId),
    enabled: !!teacherId,
    refetchInterval: 30000,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['teacher-classes', teacherId],
    queryFn: () => teacherService.getClasses(teacherId),
    enabled: !!teacherId,
  });

  const { data: conversation = [], isLoading: conversationLoading } = useQuery({
    queryKey: ['teacher-conversation', teacherId, selectedParentId],
    queryFn: () => teacherService.getConversation(teacherId, selectedParentId!),
    enabled: !!teacherId && !!selectedParentId,
  });

  const { data: parents = [] } = useQuery({
    queryKey: ['class-parents', classes.map(c => c.id)],
    queryFn: async () => {
      const allParents: SchoolUser[] = [];
      for (const cls of classes) {
        const students = await teacherService.getClassStudentsWithGrades(cls.id);
        for (const student of students) {
          if (student.parentId) {
            // Fetch parent details
            const parent = await fetch(`/api/users/${student.parentId}`).then(r => r.json());
            if (parent && !allParents.find(p => p.id === parent.id)) {
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

  const handleSendMessage = useCallback((recipientId: string, subject: string, content: string) => {
    sendMessageMutation.mutate({ recipientId, subject, content });
  }, [sendMessageMutation]);

  const uniqueParents = useMemo(() => 
    parents.filter((parent, index, self) =>
      index === self.findIndex((p) => p.id === parent.id)
    ), [parents]
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
        <PageHeader
          title="Messages"
          description="Communicate with parents"
        />
      </SlideUp>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            <Mail className="h-3 w-3 mr-1" />
            {unreadCount} unread
          </Badge>
        </div>
        <MemoizedComposeDialog
          parents={uniqueParents}
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
                              {uniqueParents.find(p => p.id === message.senderId)?.name || 'Parent'}
                            </span>
                            {!message.isRead && message.recipientId === teacherId && (
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
                        onClick={() => setSelectedParentId(message.recipientId)}
                        className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              To: {uniqueParents.find(p => p.id === message.recipientId)?.name || 'Parent'}
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
                Conversation with {uniqueParents.find(p => p.id === selectedParentId)?.name || 'Parent'}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              {conversationLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <MemoizedMessageThread
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
