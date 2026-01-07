import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { SlideUp } from '@/components/animations';

export function WorksPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-grow">
        <div className="bg-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
            <SlideUp>
              <h1 className="text-4xl md:text-5xl font-bold text-primary">
                Karya Siswa
              </h1>
            </SlideUp>
            <SlideUp delay={0.2}>
              <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                Kumpulan karya terbaik dari siswa-siswi kami.
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
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm text-primary">Seni Rupa</span>
                      <h3 className="text-xl font-bold mt-1">Lukisan Alam</h3>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Juara 1</span>
                  </div>
                  <p className="mt-3 text-muted-foreground">
                    Lukisan realistis pemandangan alam dengan teknik cat air yang indah.
                  </p>
                  <div className="mt-4 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                    <span className="ml-2 text-sm">Ahmad Rifai</span>
                  </div>
                </div>
              </div>
            </SlideUp>

            <SlideUp delay={0.1}>
              <div className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-r from-green-400 to-green-600"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm text-primary">Karya Tulis</span>
                      <h3 className="text-xl font-bold mt-1">Teknologi dan Pendidikan</h3>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Juara 2</span>
                  </div>
                  <p className="mt-3 text-muted-foreground">
                    Esai tentang peran teknologi dalam meningkatkan kualitas pendidikan modern.
                  </p>
                  <div className="mt-4 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                    <span className="ml-2 text-sm">Siti Nurhaliza</span>
                  </div>
                </div>
              </div>
            </SlideUp>

            <SlideUp delay={0.2}>
              <div className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-r from-purple-400 to-purple-600"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm text-primary">Inovasi</span>
                      <h3 className="text-xl font-bold mt-1">Alat Penghemat Air</h3>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Juara 1</span>
                  </div>
                  <p className="mt-3 text-muted-foreground">
                    Alat inovatif yang dapat menghemat penggunaan air hingga 40% di lingkungan sekolah.
                  </p>
                  <div className="mt-4 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                    <span className="ml-2 text-sm">Budi Santoso</span>
                  </div>
                </div>
              </div>
            </SlideUp>

            <SlideUp delay={0.3}>
              <div className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm text-primary">Seni Musik</span>
                      <h3 className="text-xl font-bold mt-1">Komposisi Orkestra</h3>
                    </div>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Juara 3</span>
                  </div>
                  <p className="mt-3 text-muted-foreground">
                    Komposisi orkestra orisinal yang menggabungkan musik tradisional dan modern.
                  </p>
                  <div className="mt-4 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                    <span className="ml-2 text-sm">Dewi Lestari</span>
                  </div>
                </div>
              </div>
            </SlideUp>

            <SlideUp delay={0.4}>
              <div className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-r from-red-400 to-red-600"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm text-primary">Karya Ilmiah</span>
                      <h3 className="text-xl font-bold mt-1">Energi Terbarukan</h3>
                    </div>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">Juara 1</span>
                  </div>
                  <p className="mt-3 text-muted-foreground">
                    Penelitian tentang pemanfaatan energi terbarukan untuk kebutuhan sekolah.
                  </p>
                  <div className="mt-4 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                    <span className="ml-2 text-sm">Rina Puspita</span>
                  </div>
                </div>
              </div>
            </SlideUp>

            <SlideUp delay={0.5}>
              <div className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-r from-indigo-400 to-indigo-600"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm text-primary">Fotografi</span>
                      <h3 className="text-xl font-bold mt-1">Kehidupan Sekolah</h3>
                    </div>
                    <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded text-xs">Juara 2</span>
                  </div>
                  <p className="mt-3 text-muted-foreground">
                    Kumpulan foto dokumenter kehidupan sehari-hari di lingkungan sekolah.
                  </p>
                  <div className="mt-4 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                    <span className="ml-2 text-sm">Joko Prasetyo</span>
                  </div>
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
