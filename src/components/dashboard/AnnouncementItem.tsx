import { memo } from 'react';
import { Activity, Megaphone } from 'lucide-react';
import { formatDate } from '@/utils/date';

interface BaseAnnouncement {
  id: string;
  title: string;
  date: string;
}

interface AnnouncementItemProps<T extends BaseAnnouncement> {
  announcement: T;
  variant?: 'default' | 'simple' | 'card';
  showIcon?: boolean;
  icon?: React.ReactNode;
}

function AnnouncementItemInner<T extends BaseAnnouncement>({
  announcement,
  variant = 'default',
  showIcon = true,
  icon,
}: AnnouncementItemProps<T>) {
  const displayIcon = icon ?? <Activity className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />;

  if (variant === 'simple') {
    return (
      <li className="text-sm">
        <p className="font-medium truncate">{announcement.title}</p>
        <p className="text-xs text-muted-foreground">{formatDate(announcement.date)}</p>
      </li>
    );
  }

  if (variant === 'card') {
    return (
      <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
        <Megaphone className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{announcement.title}</p>
          <p className="text-xs text-muted-foreground">{formatDate(announcement.date)}</p>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-start">
      {showIcon && displayIcon}
      <div className={showIcon ? 'ml-3' : ''}>
        <p className="text-sm font-medium">{announcement.title}</p>
        <p className="text-xs text-muted-foreground">{formatDate(announcement.date)}</p>
      </div>
    </li>
  );
}

export const AnnouncementItem = memo(AnnouncementItemInner) as <T extends BaseAnnouncement>(
  props: AnnouncementItemProps<T>
) => React.ReactElement;

AnnouncementItem.displayName = 'AnnouncementItem';
