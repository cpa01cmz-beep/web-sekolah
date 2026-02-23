import { memo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'

interface UserActionsProps {
  userId: string
  userName: string
  onEdit: (userId: string, userName: string) => void
  onDelete: (userId: string) => void
}

export const UserActions = memo(({ userId, userName, onEdit, onDelete }: UserActionsProps) => {
  const handleEdit = useCallback(() => onEdit(userId, userName), [userId, userName, onEdit])
  const handleDelete = useCallback(() => onDelete(userId), [userId, onDelete])

  return (
    <div className="flex gap-2 justify-end">
      <Button
        variant="outline"
        size="icon"
        onClick={handleEdit}
        aria-label={`Edit user ${userName}`}
      >
        <Edit className="h-4 w-4" aria-hidden="true" />
      </Button>
      <Button
        variant="destructive"
        size="icon"
        onClick={handleDelete}
        aria-label={`Delete user ${userName}`}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  )
})
UserActions.displayName = 'UserActions'
