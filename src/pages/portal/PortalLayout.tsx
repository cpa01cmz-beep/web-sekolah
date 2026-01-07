import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { useAuthStore } from '@/lib/authStore';
import { PortalSidebar } from '@/components/portal/PortalSidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Bell, GraduationCap } from 'lucide-react';
import { Toaster } from 'sonner';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { SkipLink } from '@/components/SkipLink';
import { navLinksMap, NavLink as NavLinkType } from '@/config/navigation';
import React from 'react';
export function PortalLayout() {
  const user = useAuthStore((state) => state.user);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  const navLinks = navLinksMap[user.role as keyof typeof navLinksMap] || [];
  const basePortalPath = `/portal/${user.role}`;
  return (
    <div className="flex h-screen bg-[#F5F7FA]">
      <SkipLink targetId="main-content" />
      <PortalSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open navigation menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <div className="flex flex-col h-full">
                  <div className="flex items-center h-16 border-b px-4">
                    <GraduationCap className="h-7 w-7 text-[#0D47A1]" />
                    <span className="ml-2 text-lg font-bold">Akademia Pro</span>
                  </div>
                  <nav className="flex-grow p-4 space-y-2">
                    {navLinks.map((link: NavLinkType) => (
                      <NavLink
                        key={link.to}
                        to={`${basePortalPath}/${link.to}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          )
                        }
                      >
                        {React.createElement(link.icon, { className: 'h-5 w-5' })}
                        <span>{link.label}</span>
                      </NavLink>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-lg font-semibold">Welcome, {user.name}!</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="View notifications">
              <Bell className="h-5 w-5" />
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
}