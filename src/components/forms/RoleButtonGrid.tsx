import { memo, useCallback } from 'react';
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

const PRIMARY_STYLE: React.CSSProperties = {
  '--bg-color': THEME_COLORS.PRIMARY,
  '--bg-hover-color': THEME_COLORS.PRIMARY_HOVER,
  '--bg-focus-color': THEME_COLORS.PRIMARY_HOVER,
} as React.CSSProperties;

const SECONDARY_STYLE: React.CSSProperties = {
  '--bg-color': THEME_COLORS.SECONDARY,
  '--bg-hover-color': THEME_COLORS.SECONDARY_HOVER,
  '--bg-focus-color': THEME_COLORS.SECONDARY_HOVER,
} as React.CSSProperties;

export const RoleButtonGrid = memo(function RoleButtonGrid({
  loadingRole,
  onRoleSelect,
  buttonClassName,
}: RoleButtonGridProps) {
  const handleButtonClick = useCallback(
    (role: UserRole) => {
      onRoleSelect(role);
    },
    [onRoleSelect]
  );

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {DEFAULT_ROLES.map((button) => {
        const isPrimary = button.variant === 'primary';
        const style = isPrimary ? PRIMARY_STYLE : SECONDARY_STYLE;

        return (
          <Button
            key={button.role}
            size="lg"
            variant={isPrimary ? 'default' : 'secondary'}
            onClick={() => handleButtonClick(button.role)}
            disabled={loadingRole === button.role}
            aria-busy={loadingRole === button.role}
            aria-label={`Login as ${button.label.toLowerCase()}`}
            className={`${buttonClassName} min-h-[44px] bg-[--bg-color] hover:bg-[--bg-hover-color] focus-visible:bg-[--bg-focus-color]`}
            style={style}
          >
            {loadingRole === button.role ? 'Logging in...' : button.label}
          </Button>
        );
      })}
    </div>
  );
});
RoleButtonGrid.displayName = 'RoleButtonGrid';
