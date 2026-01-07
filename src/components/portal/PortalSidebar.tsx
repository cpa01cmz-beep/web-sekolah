import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/authStore';
import { Button } from '@/components/ui/button';
import { LogOut, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { navLinksMap, NavLink as NavLinkType } from '@/config/navigation';
import React from 'react';
export function PortalSidebar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
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
              <GraduationCap className="h-7 w-7 text-[#0D47A1]" />
              <span className="text-lg font-bold">Akademia Pro</span>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="ml-auto" aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>
        <nav className="flex-grow p-2 space-y-2" aria-label={`${user.role} portal navigation`} role="navigation">
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
                  <span aria-hidden="true">{React.createElement(link.icon, { className: 'h-5 w-5' })}</span>
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
              <Button variant="ghost" className={cn('w-full justify-start gap-3', isCollapsed && 'justify-center')} onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                {!isCollapsed && <span>Logout</span>}
              </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">Logout</TooltipContent>}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}