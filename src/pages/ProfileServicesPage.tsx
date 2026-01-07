import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { SlideUp, SlideLeft, SlideRight } from '@/components/animations';

export function ProfileServicesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-grow">
        <div className="bg-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
            <SlideUp>
              <h1 className="text-4xl md:text-5xl font-bold text-primary">
                Layanan & Produk
              </h1>
            </SlideUp>
            <SlideUp delay={0.2}>
              <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                Berbagai layanan dan produk unggulan yang kami tawarkan untuk mendukung proses pendidikan.
              </p>
            </SlideUp>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12">
            <SlideLeft>
              <h2 className="text-3xl font-bold text-foreground mb-6">Layanan Pendidikan</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Sistem Pembelajaran Digital</h3>
                    <p className="mt-2 text-muted-foreground">
                      Platform e-learning terintegrasi yang memungkinkan siswa belajar kapan saja dan di mana saja dengan materi interaktif.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Konseling Karier</h3>
                    <p className="mt-2 text-muted-foreground">
                      Program konseling untuk membantu siswa mengenal potensi diri dan merencanakan karier masa depan.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Pelatihan Keterampilan</h3>
                    <p className="mt-2 text-muted-foreground">
                      Berbagai pelatihan keterampilan teknis dan soft skills untuk meningkatkan daya saing siswa di dunia kerja.
                    </p>
                  </div>
                </div>
              </div>
            </SlideLeft>

            <SlideRight delay={0.1}>
              <h2 className="text-3xl font-bold text-foreground mb-6">Produk Unggulan</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-600 font-bold">A</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Aplikasi Akademia Pro</h3>
                    <p className="mt-2 text-muted-foreground">
                      Aplikasi manajemen sekolah terintegrasi yang menghubungkan siswa, guru, orang tua, dan administrator.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 font-bold">B</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Buku Digital Interaktif</h3>
                    <p className="mt-2 text-muted-foreground">
                      Koleksi buku pelajaran digital dengan konten multimedia untuk meningkatkan pemahaman siswa.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-indigo-600 font-bold">C</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Sertifikasi Kompetensi</h3>
                    <p className="mt-2 text-muted-foreground">
                      Program sertifikasi yang diakui industri untuk membuktikan kompetensi siswa di bidang tertentu.
                    </p>
                  </div>
                </div>
              </div>
            </SlideRight>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
