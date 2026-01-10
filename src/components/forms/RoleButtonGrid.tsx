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

export function RoleButtonGrid({ loadingRole, onRoleSelect, buttonClassName }: RoleButtonGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {DEFAULT_ROLES.map((button) => {
        const isPrimary = button.variant === 'primary';
        const backgroundColor = isPrimary ? THEME_COLORS.PRIMARY : THEME_COLORS.SECONDARY;
        const hoverBackgroundColor = isPrimary ? THEME_COLORS.PRIMARY_HOVER : THEME_COLORS.SECONDARY_HOVER;

        return (
          <Button
            key={button.role}
            size="lg"
            onClick={() => onRoleSelect(button.role)}
            disabled={loadingRole === button.role}
            aria-busy={loadingRole === button.role}
            aria-label={`Login as ${button.label.toLowerCase()}`}
            className={`${buttonClassName} min-h-[44px]`}
            style={{
              backgroundColor,
            }}
            onMouseEnter={(e) => {
              if (!loadingRole) {
                e.currentTarget.style.backgroundColor = hoverBackgroundColor;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = backgroundColor;
            }}
          >
            {loadingRole === button.role ? 'Logging in...' : button.label}
          </Button>
        );
      })}
    </div>
  );
}
