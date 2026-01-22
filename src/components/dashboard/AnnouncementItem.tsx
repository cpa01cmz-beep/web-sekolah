import { memo } from 'react';
import { Activity } from 'lucide-react';
import { formatDate } from '@/utils/date';
import type { AdminDashboardData } from '@shared/types';

interface AnnouncementItemProps {
  ann: AdminDashboardData['recentAnnouncements'][0];
}

export const AnnouncementItem = memo(({ ann }: AnnouncementItemProps) => (
  <li className="flex items-start">
    <Activity className="h-4 w-4 mt-1 mr-3 text-muted-foreground flex-shrink-0" />
    <div>
      <p className="text-sm font-medium">{ann.title}</p>
      <p className="text-xs text-muted-foreground">{formatDate(ann.date)}</p>
    </div>
  </li>
));

AnnouncementItem.displayName = 'AnnouncementItem';
