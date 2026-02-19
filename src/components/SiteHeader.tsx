import { Link, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState, useCallback, memo } from 'react';
import { THEME_COLORS } from '@/theme/colors';
import { navLinks } from '@/constants/navigation';

export const SiteHeader = memo(function SiteHeader() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileNavClose = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleMobileLoginClick = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8" style={{ color: THEME_COLORS.PRIMARY }} aria-hidden="true" />
            <span className="text-xl font-bold text-foreground">Akademia Pro</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6" aria-label="Main navigation" role="navigation">
              {navLinks.map((link) => (
                link.submenu ? (
                <DropdownMenu key={link.name}>
                  <DropdownMenuTrigger
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  >
                    {link.name}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {link.submenu.map((sublink) => (
                      <DropdownMenuItem key={sublink.name} asChild>
                        <Link to={sublink.href} className="w-full">
                          {sublink.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <NavLink
                  key={link.name}
                  to={link.href}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors hover:text-primary ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              )
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Button asChild className="hidden md:inline-flex transition-all duration-200" style={{ backgroundColor: THEME_COLORS.PRIMARY }}>
              <Link to="/login">Login</Link>
            </Button>
            <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="icon" aria-label="Open navigation menu">
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </Button>
              </SheetTrigger>
                  <SheetContent side="left" role="dialog" aria-modal="true" aria-label="Mobile navigation menu">
                  <nav aria-label="Mobile navigation">
                  <div className="flex flex-col space-y-6 p-4">
                    <Link
                      to="/"
                      className="flex items-center gap-2 mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md p-2 -m-2"
                      onClick={handleMobileNavClose}
                      aria-label="Akademia Pro Home"
                    >
                      <GraduationCap className="h-8 w-8" style={{ color: THEME_COLORS.PRIMARY }} aria-hidden="true" />
                      <span className="text-xl font-bold text-foreground">Akademia Pro</span>
                    </Link>
                    {navLinks.map((link) => (
                      link.submenu ? (
                        <div key={link.name} className="flex flex-col space-y-2" role="group" aria-label={`${link.name} submenu`}>
                          <span className="text-lg font-medium text-foreground" role="heading" aria-level={3}>{link.name}</span>
                          {link.submenu.map((sublink) => (
                            <NavLink
                              key={sublink.name}
                              to={sublink.href}
                              onClick={handleMobileNavClose}
                              className={({ isActive }) =>
                                `ml-4 text-base font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-2 py-1 -mx-2 ${
                                    isActive ? 'text-primary' : 'text-muted-foreground'
                                  }`
                              }
                            >
                              {sublink.name}
                            </NavLink>
                          ))}
                        </div>
                      ) : (
                        <NavLink
                          key={link.name}
                          to={link.href}
                          onClick={handleMobileNavClose}
                          className={({ isActive }) =>
                            `text-lg font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-2 py-1 -mx-2 ${
                              isActive ? 'text-primary' : 'text-muted-foreground'
                            }`
                          }
                        >
                          {link.name}
                        </NavLink>
                      )
                    ))}
                    <Button asChild className="w-full transition-all duration-200" style={{ backgroundColor: THEME_COLORS.PRIMARY }} onClick={handleMobileLoginClick}>
                      <Link to="/login" className="focus-visible:ring-offset-2">Login</Link>
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
});
SiteHeader.displayName = 'SiteHeader';