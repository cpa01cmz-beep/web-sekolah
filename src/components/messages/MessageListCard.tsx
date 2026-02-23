import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { ScrollArea } from '@/components/ui/scroll-area'
import { User, Loader2, Inbox, Send } from 'lucide-react'
import { formatDistanceToNow } from '@/utils/date'
import type { Message, SchoolUser } from '@shared/types'

export type MessageViewType = 'inbox' | 'sent'

interface MessageListCardProps {
  title: string
  messages: Message[]
  usersMap: Map<string, SchoolUser>
  currentUserId: string
  viewType: MessageViewType
  isLoading: boolean
  emptyIcon?: typeof Inbox | typeof Send
  emptyTitle: string
  emptyDescription: string
  onSelectMessage: (userId: string) => void
}

function MessageListCardInner({
  title,
  messages,
  usersMap,
  currentUserId,
  viewType,
  isLoading,
  emptyIcon = Inbox,
  emptyTitle,
  emptyDescription,
  onSelectMessage,
}: MessageListCardProps) {
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
          <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {messages.map(message => {
                const isUnread = !message.isRead && message.recipientId === currentUserId
                const targetId = viewType === 'inbox' ? message.senderId : message.recipientId
                const targetUser = usersMap.get(targetId)

                return (
                  <button
                    key={message.id}
                    onClick={() => onSelectMessage(targetId)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      viewType === 'inbox' && isUnread
                        ? 'bg-primary/5 hover:bg-primary/10'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {viewType === 'sent' ? 'To: ' : ''}
                          {targetUser?.name || (viewType === 'inbox' ? 'Sender' : 'Recipient')}
                        </span>
                        {viewType === 'inbox' && isUnread && (
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
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

export const MessageListCard = memo(MessageListCardInner)
MessageListCard.displayName = 'MessageListCard'
