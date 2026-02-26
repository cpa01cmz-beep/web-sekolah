import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { SkipLink } from '@/components/SkipLink'
import { SlideUp, SlideLeft, SlideRight } from '@/components/animations'

export function LinksRelatedPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SkipLink targetId="main-content" />
      <SiteHeader />
      <main id="main-content" className="flex-grow">
        <div className="bg-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
            <SlideUp>
              <h1 className="text-4xl md:text-5xl font-bold text-primary">Tautan Terkait</h1>
            </SlideUp>
            <SlideUp delay={0.2}>
              <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                Kumpulan tautan penting yang berkaitan dengan pendidikan dan informasi sekolah.
              </p>
            </SlideUp>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12">
            <SlideLeft>
              <h2 className="text-3xl font-bold text-foreground mb-6">Pemerintahan</h2>
              <div className="space-y-4">
                <a
                  href="#"
                  className="block p-4 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <h3 className="font-bold text-lg">Kementerian Pendidikan dan Kebudayaan</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Website resmi Kementerian Pendidikan dan Kebudayaan Republik Indonesia
                  </p>
                </a>

                <a
                  href="#"
                  className="block p-4 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <h3 className="font-bold text-lg">Dinas Pendidikan Provinsi</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Website Dinas Pendidikan tingkat provinsi
                  </p>
                </a>

                <a
                  href="#"
                  className="block p-4 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <h3 className="font-bold text-lg">Badan Standar Nasional Pendidikan</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Badan yang menetapkan standar nasional pendidikan
                  </p>
                </a>
              </div>
            </SlideLeft>

            <SlideRight delay={0.1}>
              <h2 className="text-3xl font-bold text-foreground mb-6">Pendidikan & Referensi</h2>
              <div className="space-y-4">
                <a
                  href="#"
                  className="block p-4 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <h3 className="font-bold text-lg">Perpustakaan Nasional</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Digital library dengan koleksi buku dan jurnal nasional
                  </p>
                </a>

                <a
                  href="#"
                  className="block p-4 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <h3 className="font-bold text-lg">Pusat Sumber Belajar</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Platform pembelajaran online untuk siswa dan guru
                  </p>
                </a>

                <a
                  href="#"
                  className="block p-4 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <h3 className="font-bold text-lg">Komunitas Guru Indonesia</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Forum komunitas untuk guru se-Indonesia
                  </p>
                </a>
              </div>
            </SlideRight>
          </div>

          <SlideUp>
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Organisasi Pendidikan Internasional
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <a
                  href="#"
                  className="block p-6 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-bold">UNESCO</span>
                  </div>
                  <h3 className="font-bold">UNESCO</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Organisasi PBB untuk pendidikan, sains dan budaya
                  </p>
                </a>

                <a
                  href="#"
                  className="block p-6 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600 font-bold">OECD</span>
                  </div>
                  <h3 className="font-bold">OECD Education</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Organisasi untuk kerjasama ekonomi dan pengembangan
                  </p>
                </a>

                <a
                  href="#"
                  className="block p-6 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
                >
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-purple-600 font-bold">WB</span>
                  </div>
                  <h3 className="font-bold">World Bank Education</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Program pendidikan dari Bank Dunia
                  </p>
                </a>
              </div>
            </div>
          </SlideUp>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
