import { memo } from 'react'
import { Badge } from '@/components/ui/badge'
import { getGradeColorClass, getGradeLetter } from '@/utils/grades'

interface GradeListItemProps {
  courseName: string
  score: number
}

export const GradeListItem = memo(function GradeListItem({
  courseName,
  score,
}: GradeListItemProps) {
  const isPassing = score >= 70

  return (
    <li className="flex items-center justify-between">
      <p className="text-sm font-medium">{courseName}</p>
      <Badge className={`text-white ${getGradeColorClass(score)}`}>
        <span className="sr-only">{isPassing ? 'Passing grade: ' : 'Failing grade: '}</span>
        {getGradeLetter(score)} ({score})
      </Badge>
    </li>
  )
})
