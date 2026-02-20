import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { UserRole } from '@shared/types';
import { THEME_COLORS } from '@/theme/colors';

interface RoleButton {
  role: UserRole;
  label: string;
  variant?: 'primary' | 'secondary';
}

interface RoleButtonGridProps {
  loadingRole: UserRole | null;
  onRoleSelect: (role: UserRole) => void;
  buttonClassName?: string;
}

const DEFAULT_ROLES: RoleButton[] = [
  { role: 'student', label: 'Student', variant: 'primary' },
  { role: 'teacher', label: 'Teacher', variant: 'primary' },
  { role: 'parent', label: 'Parent', variant: 'secondary' },
  { role: 'admin', label: 'Admin', variant: 'secondary' },
];

export const RoleButtonGrid = memo(function RoleButtonGrid({ loadingRole, onRoleSelect, buttonClassName }: RoleButtonGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {DEFAULT_ROLES.map((button) => {
        const isPrimary = button.variant === 'primary';
        const style = {
          '--bg-color': isPrimary ? THEME_COLORS.PRIMARY : THEME_COLORS.SECONDARY,
          '--bg-hover-color': isPrimary ? THEME_COLORS.PRIMARY_HOVER : THEME_COLORS.SECONDARY_HOVER,
          '--bg-focus-color': isPrimary ? THEME_COLORS.PRIMARY_HOVER : THEME_COLORS.SECONDARY_HOVER,
        } as React.CSSProperties;

        return (
          <Button
            key={button.role}
            size="lg"
            variant={isPrimary ? 'default' : 'secondary'}
            onClick={() => onRoleSelect(button.role)}
            isLoading={loadingRole === button.role}
            aria-label={`Login as ${button.label.toLowerCase()}`}
            className={`${buttonClassName} min-h-[44px] bg-[--bg-color] hover:bg-[--bg-hover-color] focus-visible:bg-[--bg-focus-color]`}
            style={style}
          >
            {button.label}
          </Button>
        );
      })}
    </div>
  );
});
RoleButtonGrid.displayName = 'RoleButtonGrid';
