import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { memo } from 'react';

interface InfoCardProps {
  icon?: LucideIcon;
  iconElement?: React.ReactNode;
  title: string;
  description: string;
  iconClassName?: string;
  className?: string;
}

export const InfoCard = memo(function InfoCard({ icon: Icon, iconElement, title, description, iconClassName, className }: InfoCardProps) {
  return (
    <Card className={cn('text-center hover:shadow-lg transition-shadow', className)}>
      <CardContent className="p-6">
        {Icon && (
          <div className={cn('w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4', iconClassName)}>
            <Icon className="h-8 w-8" aria-hidden="true" />
          </div>
        )}
        {iconElement && (
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            {iconElement}
          </div>
        )}
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
});
InfoCard.displayName = 'InfoCard';
