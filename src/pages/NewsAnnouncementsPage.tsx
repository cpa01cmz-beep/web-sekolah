import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { SlideUp } from '@/components/animations';

export function NewsAnnouncementsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-grow">
        <div className="bg-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
            <SlideUp>
              <h1 className="text-4xl md:text-5xl font-bold text-primary">
                Pengumuman
              </h1>
            </SlideUp>
            <SlideUp delay={0.2}>
              <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                Pengumuman penting dari sekolah kami.
              </p>
            </SlideUp>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="space-y-8">
            {/* Sample announcement - these would be populated dynamically in a real implementation */}
            <SlideUp>
              <div className="bg-card rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <span className="text-sm text-primary">10 November 2025</span>
                    <h3 className="text-2xl font-bold mt-2">Libur Hari Pahlawan</h3>
                    <p className="mt-3 text-muted-foreground">
                      Diberitahukan kepada seluruh warga sekolah bahwa pada hari Rabu, 12 November2025, sekolah akan libur dalam rangka memperingati Hari Pahlawan.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Pengumuman</span>
                </div>
              </div>
            </SlideUp>

            <SlideUp delay={0.1}>
              <div className="bg-card rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <span className="text-sm text-primary">5 November 2025</span>
                    <h3 className="text-2xl font-bold mt-2">Jadwal Ujian Akhir Semester</h3>
                    <p className="mt-3 text-muted-foreground">
                      Jadwal ujian akhir semester ganjil tahun ajaran 2025/2026 akan dilaksanakan mulai tanggal 20 November2025 hingga 5 Desember2025.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Jadwal</span>
                </div>
              </div>
            </SlideUp>

            <SlideUp delay={0.2}>
              <div className="bg-card rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <span className="text-sm text-primary">1 November 2025</span>
                    <h3 className="text-2xl font-bold mt-2">Pelatihan Guru Teknologi Informasi</h3>
                    <p className="mt-3 text-muted-foreground">
                      Kami mengundang seluruh guru untuk mengikuti pelatihan teknologi informasi yang akan diadakan pada hari Sabtu, 15 November2025.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Pelatihan</span>
                </div>
              </div>
            </SlideUp>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}