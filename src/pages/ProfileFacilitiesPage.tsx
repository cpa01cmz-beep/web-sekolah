import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { SlideUp, SlideLeft, SlideRight } from '@/components/animations';

export function ProfileFacilitiesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-grow">
        <div className="bg-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
            <SlideUp>
              <h1 className="text-4xl md:text-5xl font-bold text-primary">
                Fasilitas Sarana dan Prasarana
              </h1>
            </SlideUp>
            <SlideUp delay={0.2}>
              <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                Fasilitas lengkap yang kami sediakan untuk mendukung proses belajar mengajar yang
                optimal.
              </p>
            </SlideUp>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12">
            <SlideLeft>
              <h2 className="text-3xl font-bold text-foreground mb-6">Fasilitas Akademik</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Laboratorium Sains</h3>
                    <p className="mt-2 text-muted-foreground">
                      Laboratorium kimia, fisika, dan biologi yang dilengkapi dengan peralatan
                      modern untuk praktikum siswa.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Perpustakaan Digital</h3>
                    <p className="mt-2 text-muted-foreground">
                      Perpustakaan dengan koleksi buku fisik dan digital yang lengkap, dilengkapi
                      dengan area baca yang nyaman.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Ruang Kelas Canggih</h3>
                    <p className="mt-2 text-muted-foreground">
                      Ruang kelas yang dilengkapi dengan proyektor, sound system, dan perangkat
                      pembelajaran interaktif.
                    </p>
                  </div>
                </div>
              </div>
            </SlideLeft>

            <SlideRight delay={0.1}>
              <h2 className="text-3xl font-bold text-foreground mb-6">Fasilitas Pendukung</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-600 font-bold">A</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Area Olahraga</h3>
                    <p className="mt-2 text-muted-foreground">
                      Lapangan sepak bola, basket, dan voli yang luas dengan standar internasional.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 font-bold">B</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Kantin Sehat</h3>
                    <p className="mt-2 text-muted-foreground">
                      Kantin yang menyediakan makanan bergizi seimbang dengan pengawasan giziwan
                      secara rutin.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-indigo-600 font-bold">C</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Asrama Siswa</h3>
                    <p className="mt-2 text-muted-foreground">
                      Asrama yang nyaman dan aman dengan pengawasan ketat, dilengkapi dengan
                      fasilitas laundry dan ruang belajar.
                    </p>
                  </div>
                </div>
              </div>
            </SlideRight>
          </div>

          <SlideUp>
            <div className="mt-24">
              <h2 className="text-3xl font-bold text-foreground text-center mb-12">
                Galeri Fasilitas
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="rounded-lg overflow-hidden shadow-md">
                  <div className="h-48 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                  <div className="p-4">
                    <h3 className="font-bold">Laboratorium Komputer</h3>
                  </div>
                </div>
                <div className="rounded-lg overflow-hidden shadow-md">
                  <div className="h-48 bg-gradient-to-r from-green-400 to-green-600"></div>
                  <div className="p-4">
                    <h3 className="font-bold">Perpustakaan</h3>
                  </div>
                </div>
                <div className="rounded-lg overflow-hidden shadow-md">
                  <div className="h-48 bg-gradient-to-r from-purple-400 to-purple-600"></div>
                  <div className="p-4">
                    <h3 className="font-bold">Gedung Sekolah</h3>
                  </div>
                </div>
              </div>
            </div>
          </SlideUp>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
