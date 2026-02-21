import React, { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@shared/types';
import { ROLE_COLORS } from '@/theme/colors';
import { GraduationCap, Users, UserCog, Shield } from 'lucide-react';

const RoleIcon: Record<UserRole, React.ComponentType<{ className?: string }>> = {
  student: GraduationCap,
  teacher: Users,
  parent: UserCog,
  admin: Shield,
};

interface UserRoleBadgeProps {
  role: UserRole;
}

export const UserRoleBadge = memo(({ role }: UserRoleBadgeProps) => {
  const Icon = RoleIcon[role];

  return (
    <Badge
      className={`text-white ${ROLE_COLORS[role].color} flex items-center gap-1.5 px-2.5 py-1`}
    >
      <span aria-hidden="true">{React.createElement(Icon, { className: 'h-3 w-3' })}</span>
      <span>{ROLE_COLORS[role].label}</span>
    </Badge>
  );
});
UserRoleBadge.displayName = 'UserRoleBadge';
