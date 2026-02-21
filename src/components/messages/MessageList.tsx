import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { formatDistanceToNow } from '@/utils/date';
import type { Message, SchoolUser } from '@shared/types';

interface MessageListProps {
  title: string;
  messages: Message[];
  isLoading: boolean;
  contacts: SchoolUser[];
  currentUserId: string;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  isSentFolder?: boolean;
  onSelectMessage: (contactId: string) => void;
}

export function MessageList({
  title,
  messages,
  isLoading,
  contacts,
  currentUserId,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  isSentFolder = false,
  onSelectMessage,
}: MessageListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle}
            description={emptyDescription}
          />
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {messages.map((message) => {
                const contactId = isSentFolder ? message.recipientId : message.senderId;
                const contactName = contacts.find(c => c.id === contactId)?.name || (isSentFolder ? 'Recipient' : 'Sender');
                const isUnread = !message.isRead && message.recipientId === currentUserId;
                
                return (
                  <button
                    key={message.id}
                    onClick={() => onSelectMessage(contactId)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      isUnread
                        ? 'bg-primary/5 hover:bg-primary/10'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {isSentFolder ? `To: ${contactName}` : contactName}
                        </span>
                        {isUnread && (
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
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
