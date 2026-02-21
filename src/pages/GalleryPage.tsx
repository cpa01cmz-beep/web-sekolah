import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { SlideUp } from '@/components/animations';
import { InfoCard } from '@/components/InfoCard';

export function GalleryPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-grow">
        <div className="bg-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
            <SlideUp>
              <h1 className="text-4xl md:text-5xl font-bold text-primary">Galeri</h1>
            </SlideUp>
            <SlideUp delay={0.2}>
              <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                Dokumentasi kegiatan dan momen berharga di sekolah kami.
              </p>
            </SlideUp>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, index) => (
              <SlideUp key={index} delay={index * 0.05}>
                <div className="aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <div
                    className={`w-full h-full ${
                      index % 4 === 0
                        ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                        : index % 4 === 1
                          ? 'bg-gradient-to-r from-green-400 to-green-600'
                          : index % 4 === 2
                            ? 'bg-gradient-to-r from-purple-400 to-purple-600'
                            : 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                    }`}
                    role="img"
                    aria-label={`Galeri foto ${index + 1}`}
                  ></div>
                </div>
              </SlideUp>
            ))}
          </div>

          <div className="mt-16">
            <SlideUp>
              <h2 className="text-3xl font-bold text-foreground text-center mb-12">
                Kategori Galeri
              </h2>
            </SlideUp>
            <div className="grid md:grid-cols-3 gap-8">
              <SlideUp>
                <InfoCard
                  title="Kegiatan Akademik"
                  description="Dokumentasi kegiatan belajar mengajar, ujian, dan presentasi siswa."
                  iconElement={
                    <span className="text-2xl text-blue-600" aria-hidden="true">
                      🎓
                    </span>
                  }
                  iconClassName="bg-blue-100"
                />
              </SlideUp>

              <SlideUp delay={0.1}>
                <InfoCard
                  title="Ekstrakurikuler"
                  description="Kegiatan ekstrakurikuler siswa seperti olahraga, seni, dan klub."
                  iconElement={
                    <span className="text-2xl text-green-600" aria-hidden="true">
                      ⚽
                    </span>
                  }
                  iconClassName="bg-green-100"
                />
              </SlideUp>

              <SlideUp delay={0.2}>
                <InfoCard
                  title="Prestasi & Penghargaan"
                  description="Momen perayaan prestasi siswa dan penghargaan yang diraih sekolah."
                  iconElement={
                    <span className="text-2xl text-purple-600" aria-hidden="true">
                      🏆
                    </span>
                  }
                  iconClassName="bg-purple-100"
                />
              </SlideUp>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
