import { memo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'

interface GradeActionsProps {
  studentId: string
  studentName: string
  onEdit: (studentId: string) => void
}

export const GradeActions = memo(function GradeActions({
  studentId,
  studentName,
  onEdit,
}: GradeActionsProps) {
  const handleEdit = useCallback(() => {
    onEdit(studentId)
  }, [studentId, onEdit])

  return (
    <div className="flex gap-2 justify-end">
      <Button
        variant="outline"
        size="icon"
        onClick={handleEdit}
        aria-label={`Edit grade for ${studentName}`}
      >
        <Edit className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  )
})
