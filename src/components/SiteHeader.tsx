import { Link, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];
export function SiteHeader() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-[#0D47A1]" />
            <span className="text-xl font-bold text-foreground">Akademia Pro</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
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
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Button asChild className="hidden md:inline-flex bg-[#0D47A1] hover:bg-[#0b3a8a] transition-all duration-200">
              <Link to="/login">Login</Link>
            </Button>
            <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex flex-col space-y-6 p-4">
                  <Link to="/" className="flex items-center gap-2 mb-4" onClick={() => setMobileMenuOpen(false)}>
                    <GraduationCap className="h-8 w-8 text-[#0D47A1]" />
                    <span className="text-xl font-bold text-foreground">Akademia Pro</span>
                  </Link>
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.name}
                      to={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `text-lg font-medium transition-colors hover:text-primary ${
                          isActive ? 'text-primary' : 'text-muted-foreground'
                        }`
                      }
                    >
                      {link.name}
                    </NavLink>
                  ))}
                  <Button asChild className="w-full bg-[#0D47A1] hover:bg-[#0b3a8a] transition-all duration-200" onClick={() => setMobileMenuOpen(false)}>
                    <Link to="/login">Login</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}