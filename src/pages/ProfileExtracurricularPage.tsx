import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { SlideUp } from '@/components/animations';

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
              <div className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold">Pramuka</h3>
                  <p className="mt-3 text-muted-foreground">
                    Membentuk karakter, kemandirian, dan jiwa kepemimpinan siswa melalui kegiatan kepramukaan.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Karakter</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Kepemimpinan</span>
                  </div>
                </div>
              </div>
            </SlideUp>

            <SlideUp delay={0.1}>
              <div className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-r from-green-400 to-green-600"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold">Olahraga</h3>
                  <p className="mt-3 text-muted-foreground">
                    Berbagai cabang olahraga untuk menjaga kebugaran fisik dan mengembangkan semangat sportivitas.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Basket</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Sepak Bola</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Bulu Tangkis</span>
                  </div>
                </div>
              </div>
            </SlideUp>

            <SlideUp delay={0.2}>
              <div className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-r from-purple-400 to-purple-600"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold">Seni Musik</h3>
                  <p className="mt-3 text-muted-foreground">
                    Wadah untuk mengembangkan bakat musik siswa melalui berbagai instrumen dan vokal.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Gitar</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Vokal</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Piano</span>
                  </div>
                </div>
              </div>
            </SlideUp>

            <SlideUp delay={0.3}>
              <div className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold">Robotika</h3>
                  <p className="mt-3 text-muted-foreground">
                    Mengembangkan kemampuan teknologi dan pemrograman melalui pembuatan robot dan kompetisi.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">STEM</span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Pemrograman</span>
                  </div>
                </div>
              </div>
            </SlideUp>

            <SlideUp delay={0.4}>
              <div className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-r from-red-400 to-red-600"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold">Debat</h3>
                  <p className="mt-3 text-muted-foreground">
                    Melatih kemampuan berbicara di depan umum dan kemampuan berpikir kritis siswa.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Public Speaking</span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Argumentasi</span>
                  </div>
                </div>
              </div>
            </SlideUp>

            <SlideUp delay={0.5}>
              <div className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-r from-indigo-400 to-indigo-600"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold">Jurnalistik</h3>
                  <p className="mt-3 text-muted-foreground">
                    Mengembangkan kemampuan menulis dan jurnalisme siswa melalui kegiatan penerbitan majalah sekolah.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">Menulis</span>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">Fotografi</span>
                  </div>
                </div>
              </div>
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
