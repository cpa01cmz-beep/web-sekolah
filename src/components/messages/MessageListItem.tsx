import { memo } from 'react'
import { Badge } from '@/components/ui/badge'
import { User } from 'lucide-react'
import { formatDistanceToNow } from '@/utils/date'
import type { Message } from '@shared/types'

export interface MessageListItemProps {
  message: Message
  currentUserId: string
  contactName: string
  contactLabel: string
  variant: 'inbox' | 'sent'
  onClick: () => void
}

function MessageListItemInner({
  message,
  currentUserId,
  contactName,
  contactLabel,
  variant,
  onClick,
}: MessageListItemProps) {
  const isInbox = variant === 'inbox'
  const isUnread = !message.isRead && message.recipientId === currentUserId

  const buttonClass = isInbox
    ? `w-full text-left p-3 rounded-lg transition-colors ${
        isUnread ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted'
      }`
    : 'w-full text-left p-3 rounded-lg hover:bg-muted transition-colors'

  return (
    <button onClick={onClick} className={buttonClass}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span className="font-medium">
            {isInbox ? contactName : `${contactLabel}${contactName}`}
          </span>
          {isInbox && isUnread && (
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
}

export const MessageListItem = memo(MessageListItemInner)
MessageListItem.displayName = 'MessageListItem'
