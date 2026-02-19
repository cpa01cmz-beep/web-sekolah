import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/authStore';
import { Button } from '@/components/ui/button';
import { LogOut, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useCallback, memo } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { navLinksMap, NavLink as NavLinkType } from '@/config/navigation';
import { THEME_COLORS } from '@/theme/colors';

export const PortalSidebar = memo(function PortalSidebar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  if (!user) return null;
  const navLinks = navLinksMap[user.role as keyof typeof navLinksMap] || [];
  const basePortalPath = `/portal/${user.role}`;
  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'hidden md:flex flex-col h-screen bg-card border-r transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="flex items-center justify-between h-16 border-b px-4">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <GraduationCap className="h-7 w-7" style={{ color: THEME_COLORS.PRIMARY }} aria-hidden="true" />
              <span className="text-lg font-bold">Akademia Pro</span>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={handleToggleCollapse} className="ml-auto" aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {isCollapsed ? <ChevronRight className="h-5 w-5" aria-hidden="true" /> : <ChevronLeft className="h-5 w-5" aria-hidden="true" />}
          </Button>
        </div>
        <nav className="flex-grow p-2 space-y-2" role="navigation" aria-label={`${user.role} portal navigation`}>
          <h2 className="sr-only">Navigation Menu</h2>
          {navLinks.map((link: NavLinkType) => (
            <Tooltip key={link.to}>
              <TooltipTrigger asChild>
                <NavLink
                  to={`${basePortalPath}/${link.to}`}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                      isCollapsed && 'justify-center'
                    )
                  }
                >
                  <span aria-hidden="true"><link.icon className="h-5 w-5" /></span>
                  {!isCollapsed && <span>{link.label}</span>}
                </NavLink>
              </TooltipTrigger>
              {isCollapsed && <TooltipContent side="right">{link.label}</TooltipContent>}
            </Tooltip>
          ))}
        </nav>
        <div className="p-2 border-t">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" className={cn('w-full justify-start gap-3', isCollapsed && 'justify-center')} onClick={handleLogout} aria-label={isCollapsed ? 'Logout' : undefined}>
                <LogOut className="h-5 w-5" aria-hidden="true" />
                {!isCollapsed && <span>Logout</span>}
              </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">Logout</TooltipContent>}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
});
PortalSidebar.displayName = 'PortalSidebar';