import { ReactNode, memo } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { SkipLink } from '@/components/SkipLink';

interface PublicLayoutProps {
  children: ReactNode;
}

export const PublicLayout = memo(function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SkipLink targetId="main-content" />
      <SiteHeader />
      <main id="main-content" className="flex-grow">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
});
PublicLayout.displayName = 'PublicLayout';
