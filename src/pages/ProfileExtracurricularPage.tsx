import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { SlideUp } from '@/components/animations';
import { ContentCard } from '@/components/ContentCard';

export function ProfileExtracurricularPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-grow">
        <div className="bg-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
            <SlideUp>
              <h1 className="text-4xl md:text-5xl font-bold text-primary">
                Ekstrakurikuler
              </h1>
            </SlideUp>
            <SlideUp delay={0.2}>
              <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                Berbagai kegiatan ekstrakurikuler yang kami tawarkan untuk mengembangkan bakat dan minat siswa.
              </p>
            </SlideUp>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <SlideUp>
              <ContentCard
                gradient="bg-gradient-to-r from-blue-400 to-blue-600"
                title="Pramuka"
                description="Membentuk karakter, kemandirian, dan jiwa kepemimpinan siswa melalui kegiatan kepramukaan."
                tags={['Karakter', 'Kepemimpinan']}
                badgeColor="bg-blue-100 text-blue-800"
              />
            </SlideUp>

            <SlideUp delay={0.1}>
              <ContentCard
                gradient="bg-gradient-to-r from-green-400 to-green-600"
                title="Olahraga"
                description="Berbagai cabang olahraga untuk menjaga kebugaran fisik dan mengembangkan semangat sportivitas."
                tags={['Basket', 'Sepak Bola', 'Bulu Tangkis']}
                badgeColor="bg-green-100 text-green-800"
              />
            </SlideUp>

            <SlideUp delay={0.2}>
              <ContentCard
                gradient="bg-gradient-to-r from-purple-400 to-purple-600"
                title="Seni Musik"
                description="Wadah untuk mengembangkan bakat musik siswa melalui berbagai instrumen dan vokal."
                tags={['Gitar', 'Vokal', 'Piano']}
                badgeColor="bg-purple-100 text-purple-800"
              />
            </SlideUp>

            <SlideUp delay={0.3}>
              <ContentCard
                gradient="bg-gradient-to-r from-yellow-400 to-yellow-600"
                title="Robotika"
                description="Mengembangkan kemampuan teknologi dan pemrograman melalui pembuatan robot dan kompetisi."
                tags={['STEM', 'Pemrograman']}
                badgeColor="bg-yellow-100 text-yellow-800"
              />
            </SlideUp>

            <SlideUp delay={0.4}>
              <ContentCard
                gradient="bg-gradient-to-r from-red-400 to-red-600"
                title="Debat"
                description="Melatih kemampuan berbicara di depan umum dan kemampuan berpikir kritis siswa."
                tags={['Public Speaking', 'Argumentasi']}
                badgeColor="bg-red-100 text-red-800"
              />
            </SlideUp>

            <SlideUp delay={0.5}>
              <ContentCard
                gradient="bg-gradient-to-r from-indigo-400 to-indigo-600"
                title="Jurnalistik"
                description="Mengembangkan kemampuan menulis dan jurnalisme siswa melalui kegiatan penerbitan majalah sekolah."
                tags={['Menulis', 'Fotografi']}
                badgeColor="bg-indigo-100 text-indigo-800"
              />
            </SlideUp>
          </div>

          <SlideUp>
            <div className="mt-24 text-center">
              <h2 className="text-3xl font-bold text-foreground mb-6">Bergabung dengan Kami</h2>
              <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
                Setiap siswa berhak mengikuti minimal satu kegiatan ekstrakurikuler. Pendaftaran dibuka setiap awal semester.
              </p>
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Daftar Sekarang
              </button>
            </div>
          </SlideUp>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
