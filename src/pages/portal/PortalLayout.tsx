import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { useAuthStore } from '@/lib/authStore';
import { PortalSidebar } from '@/components/portal/PortalSidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Bell, GraduationCap } from 'lucide-react';
import { Toaster } from 'sonner';
import { cn } from '@/lib/utils';
import { useState, useCallback, memo } from 'react';
import { SkipLink } from '@/components/SkipLink';
import { navLinksMap, NavLink as NavLinkType } from '@/config/navigation';
import { THEME_COLORS } from '@/theme/colors';
export const PortalLayout = memo(function PortalLayout() {
  const user = useAuthStore((state) => state.user);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileNavClose = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  const navLinks = navLinksMap[user.role as keyof typeof navLinksMap] || [];
  const basePortalPath = `/portal/${user.role}`;
  return (
    <div className="flex h-screen" style={{ backgroundColor: THEME_COLORS.BACKGROUND }}>
      <SkipLink targetId="main-content" />
      <PortalSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open navigation menu">
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64" role="dialog" aria-label="Mobile navigation menu">
                <div className="flex flex-col h-full">
                  <div className="flex items-center h-16 border-b px-4">
                    <GraduationCap className="h-7 w-7" style={{ color: THEME_COLORS.PRIMARY }} aria-hidden="true" />
                    <span className="ml-2 text-lg font-bold">Akademia Pro</span>
                  </div>
                  <nav className="flex-grow p-4 space-y-2" role="navigation" aria-label={`${user.role} portal navigation`}>
                    <h3 className="sr-only">Navigation Menu</h3>
                    {navLinks.map((link: NavLinkType) => (
                      <NavLink
                        key={link.to}
                        to={`${basePortalPath}/${link.to}`}
                        onClick={handleMobileNavClose}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          )
                        }
                      >
                        <span aria-hidden="true"><link.icon className="h-5 w-5" /></span>
                        <span>{link.label}</span>
                      </NavLink>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-lg font-semibold">Welcome, {user.name}!</h2>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="View notifications">
              <Bell className="h-5 w-5" aria-hidden="true" />
            </Button>
            <Avatar>
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <Toaster richColors />
    </div>
  );
});
PortalLayout.displayName = 'PortalLayout';