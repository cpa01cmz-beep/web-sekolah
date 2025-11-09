import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/authStore';
import { PortalSidebar } from '@/components/portal/PortalSidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Bell, GraduationCap } from 'lucide-react';
import { Toaster } from 'sonner';
export function PortalLayout() {
  const user = useAuthStore((state) => state.user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="flex h-screen bg-[#F5F7FA]">
      <PortalSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                {/* Mobile Sidebar Content can be a simplified version or the same component */}
                <div className="flex flex-col h-full">
                  <div className="flex items-center h-16 border-b px-4">
                    <GraduationCap className="h-7 w-7 text-[#0D47A1]" />
                    <span className="ml-2 text-lg font-bold">Akademia Pro</span>
                  </div>
                  {/* Add mobile nav links here */}
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-lg font-semibold">Welcome, {user.name}!</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <Toaster richColors />
    </div>
  );
}