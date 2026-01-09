import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { SlideUp, SlideLeft, SlideRight } from '@/components/animations';
import { PPDBForm } from '@/components/forms/PPDBForm';
import { PPDBInfo, PPDBGuide } from '@/components/PPDBInfo';

export function PPDBPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-grow">
        <div className="bg-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
            <SlideUp>
              <h1 className="text-4xl md:text-5xl font-bold text-primary">
                Pendaftaran PPDB
              </h1>
            </SlideUp>
            <SlideUp delay={0.2}>
              <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                Pendaftaran Peserta Didik Baru Tahun Ajaran 2025/2026
              </p>
            </SlideUp>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-16">
            <SlideLeft>
              <PPDBInfo />
            </SlideLeft>

            <SlideRight>
              <PPDBForm />
              <PPDBGuide />
            </SlideRight>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
