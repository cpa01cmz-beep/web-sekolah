import { memo, useEffect } from 'react';
import { EmptyState } from '@/components/ui/empty-state';
import { MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from '@/utils/date';
import type { Message } from '@shared/types';

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
  onMarkAsRead: (messageId: string) => void;
}

function MessageThreadInner({ messages, currentUserId, onMarkAsRead }: MessageThreadProps) {
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

export const MessageThread = memo(MessageThreadInner);
MessageThread.displayName = 'MessageThread';
