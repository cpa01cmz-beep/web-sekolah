import { GraduationCap, Twitter, Facebook, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { THEME_COLORS } from '@/theme/colors';
import { memo } from 'react';
export const SiteFooter = memo(function SiteFooter() {
  return (
    <footer className="bg-muted text-muted-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2" aria-label="Akademia Pro Home">
              <GraduationCap className="h-8 w-8 text-[var(--color-primary)]" style={{ color: THEME_COLORS.PRIMARY }} aria-hidden="true" />
              <span className="text-xl font-bold text-foreground">Akademia Pro</span>
            </Link>
            <p className="text-sm">
              Modern school management for a brighter future.
            </p>
          </div>
          <nav aria-label="Footer quick links">
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
            </ul>
          </nav>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact Us</h3>
            <address className="not-italic space-y-2 text-sm">
              <p>Jl. Pendidikan No. 123, Jakarta</p>
              <p>info@akademia.pro</p>
              <p>(021) 123-4567</p>
            </address>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Follow Us</h3>
            <nav aria-label="Social media links" className="flex space-x-4">
              <a href="#" className="hover:text-primary" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
            </nav>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Akademia Pro. All rights reserved.</p>
          <p className="mt-1">Built with ❤️ at Cloudflare</p>
        </div>
      </div>
    </footer>
  );
});
SiteFooter.displayName = 'SiteFooter';