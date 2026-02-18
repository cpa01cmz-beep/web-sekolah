import { memo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { formatDate } from '@/utils/date';

export interface AnnouncementItemProps {
  title: string;
  date: string;
  icon?: LucideIcon;
  showIcon?: boolean;
}

export const AnnouncementItem = memo(({ title, date, icon: Icon, showIcon = false }: AnnouncementItemProps) => (
  <li className={showIcon ? 'flex items-start' : 'text-sm'}>
    {showIcon && Icon && <Icon className="h-4 w-4 mt-1 mr-3 text-muted-foreground flex-shrink-0" />}
    <div className={showIcon ? '' : undefined}>
      <p className={`font-medium ${showIcon ? 'text-sm' : 'truncate'}`}>{title}</p>
      <p className="text-xs text-muted-foreground">{formatDate(date)}</p>
    </div>
  </li>
));

AnnouncementItem.displayName = 'AnnouncementItem';
