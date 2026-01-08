import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { SlideUp, SlideLeft } from '@/components/animations';

export function NewsIndexPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-grow">
        <div className="bg-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
            <SlideUp>
              <h1 className="text-4xl md:text-5xl font-bold text-primary">
                Indeks Berita
              </h1>
            </SlideUp>
            <SlideUp delay={0.2}>
              <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                Arsip berita dan informasi dari sekolah kami.
              </p>
            </SlideUp>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid gap-8">
            <div className="grid md:grid-cols-3 gap-6">
              <SlideUp>
                <div className="bg-card rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold mb-4">2025</h3>
                  <ul className="space-y-2">
                    <li><a href="#" className="text-primary hover:underline">November (15)</a></li>
                    <li><a href="#" className="text-primary hover:underline">Oktober (12)</a></li>
                    <li><a href="#" className="text-primary hover:underline">September (18)</a></li>
                    <li><a href="#" className="text-primary hover:underline">Agustus (9)</a></li>
                  </ul>
                </div>
              </SlideUp>

              <SlideUp delay={0.1}>
                <div className="bg-card rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold mb-4">2024</h3>
                  <ul className="space-y-2">
                    <li><a href="#" className="text-primary hover:underline">Desember (11)</a></li>
                    <li><a href="#" className="text-primary hover:underline">November (14)</a></li>
                    <li><a href="#" className="text-primary hover:underline">Oktober (16)</a></li>
                    <li><a href="#" className="text-primary hover:underline">September (13)</a></li>
                  </ul>
                </div>
              </SlideUp>

              <SlideUp delay={0.2}>
                <div className="bg-card rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold mb-4">2023</h3>
                  <ul className="space-y-2">
                    <li><a href="#" className="text-primary hover:underline">Arsip Penuh</a></li>
                  </ul>
                </div>
              </SlideUp>
            </div>

            <div className="mt-12">
              <SlideUp>
                <h2 className="text-2xl font-bold mb-6">Berita Populer</h2>
              </SlideUp>
              <div className="space-y-4">
                <SlideLeft>
                  <div className="flex items-start gap-4 p-4 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div
                      className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-md"
                      role="img"
                      aria-label="Foto prestasi siswa olimpiade sains nasional"
                    ></div>
                    <div>
                      <h3 className="font-bold">Prestasi Siswa di Olimpiade Sains Nasional</h3>
                      <p className="text-sm text-muted-foreground mt-1">Tim sains kami berhasil meraih medali emas di ajang bergengsi tingkat nasional.</p>
                      <span className="text-xs text-primary mt-2">15 Oktober 2025</span>
                    </div>
                  </div>
                </SlideLeft>

                <SlideLeft delay={0.1}>
                  <div className="flex items-start gap-4 p-4 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div
                      className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-md"
                      role="img"
                      aria-label="Foto pembangunan gedung baru sekolah"
                    ></div>
                    <div>
                      <h3 className="font-bold">Pembangunan Gedung Baru Dimulai</h3>
                      <p className="text-sm text-muted-foreground mt-1">Proyek pembangunan gedung serba guna baru telah dimulai dengan target selesai akhir tahun.</p>
                      <span className="text-xs text-primary mt-2">3 September 2025</span>
                    </div>
                  </div>
                </SlideLeft>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
