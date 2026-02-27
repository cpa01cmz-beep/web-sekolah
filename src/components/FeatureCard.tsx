import { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { THEME_COLORS } from '@/theme/colors'
import { cn } from '@/lib/utils'
import { memo } from 'react'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  className?: string
}

export const FeatureCard = memo(function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
}: FeatureCardProps) {
  return (
    <Card
      className={cn(
        'text-center h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-200',
        className
      )}
    >
      <CardHeader>
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: THEME_COLORS.SECONDARY }}
        >
          <Icon className="h-8 w-8 text-white" aria-hidden="true" />
        </div>
        <CardTitle className="mt-4">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
})
FeatureCard.displayName = 'FeatureCard'
