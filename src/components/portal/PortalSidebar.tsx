import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/authStore';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Calendar,
  Award,
  User,
  LogOut,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  BookCopy,
  Megaphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
const studentLinks = [
  { to: 'dashboard', icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard' },
  { to: 'schedule', icon: <Calendar className="h-5 w-5" />, label: 'Schedule' },
  { to: 'grades', icon: <Award className="h-5 w-5" />, label: 'Grades' },
  { to: 'card', icon: <User className="h-5 w-5" />, label: 'Student Card' },
];
const teacherLinks = [
  { to: 'dashboard', icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard' },
  { to: 'grades', icon: <BookCopy className="h-5 w-5" />, label: 'Grade Management' },
  { to: 'announcements', icon: <Megaphone className="h-5 w-5" />, label: 'Announcements' },
];
const navLinksMap = {
  student: studentLinks,
  teacher: teacherLinks,
  parent: [],  // Placeholder
  admin: [],   // Placeholder
};
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
  const navLinks = navLinksMap[user.role] || [];
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
          <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="ml-auto">
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>
        <div className="flex-grow p-2 space-y-2">
          {navLinks.map((link) => (
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
                  {link.icon}
                  {!isCollapsed && <span>{link.label}</span>}
                </NavLink>
              </TooltipTrigger>
              {isCollapsed && <TooltipContent side="right">{link.label}</TooltipContent>}
            </Tooltip>
          ))}
        </div>
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