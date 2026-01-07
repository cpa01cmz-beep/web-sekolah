import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { SlideUp, SlideLeft, SlideRight } from '@/components/animations';
import { ContentCard } from '@/components/ContentCard';

export function NewsUpdatePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-grow">
        <div className="bg-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
            <SlideUp>
              <h1 className="text-4xl md:text-5xl font-bold text-primary">
                Update Berita
              </h1>
            </SlideUp>
            <SlideUp delay={0.2}>
              <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                Temukan update terbaru seputar sekolah kami.
              </p>
            </SlideUp>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <SlideUp>
              <ContentCard
                gradient="bg-gradient-to-r from-blue-400 to-blue-600"
                category="25 November 2025"
                title="Update Terbaru Sistem Akademik"
                description="Kami telah merilis update terbaru untuk sistem akademik yang mencakup fitur-fitur baru untuk meningkatkan pengalaman belajar siswa."
              />
            </SlideUp>

            <SlideUp delay={0.1}>
              <ContentCard
                gradient="bg-gradient-to-r from-green-400 to-green-600"
                category="18 November 2025"
                title="Peningkatan Fasilitas Laboratorium"
                description="Laboratorium sains kami telah diperbarui dengan peralatan modern untuk mendukung pembelajaran praktik yang lebih baik."
              />
            </SlideUp>

            <SlideUp delay={0.2}>
              <ContentCard
                gradient="bg-gradient-to-r from-purple-400 to-purple-600"
                category="12 November 2025"
                title="Program Pertukaran Siswa Internasional"
                description="Kami membuka pendaftaran untuk program pertukaran siswa internasional dengan beberapa sekolah mitra di luar negeri."
              />
            </SlideUp>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
