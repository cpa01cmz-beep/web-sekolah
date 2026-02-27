import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { SkipLink } from '@/components/SkipLink'
import { SlideUp } from '@/components/animations'
import { ContentCard } from '@/components/ContentCard'

export function WorksPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SkipLink targetId="main-content" />
      <SiteHeader />
      <main id="main-content" className="flex-grow">
        <div className="bg-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
            <SlideUp>
              <h1 className="text-4xl md:text-5xl font-bold text-primary">Karya Siswa</h1>
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
              <ContentCard
                gradient="bg-gradient-to-r from-blue-400 to-blue-600"
                category="Seni Rupa"
                title="Lukisan Alam"
                description="Lukisan realistis pemandangan alam dengan teknik cat air yang indah."
                badge="Juara 1"
                badgeColor="bg-green-100 text-green-800"
                author="Ahmad Rifai"
              />
            </SlideUp>

            <SlideUp delay={0.1}>
              <ContentCard
                gradient="bg-gradient-to-r from-green-400 to-green-600"
                category="Karya Tulis"
                title="Teknologi dan Pendidikan"
                description="Esai tentang peran teknologi dalam meningkatkan kualitas pendidikan modern."
                badge="Juara 2"
                badgeColor="bg-blue-100 text-blue-800"
                author="Siti Nurhaliza"
              />
            </SlideUp>

            <SlideUp delay={0.2}>
              <ContentCard
                gradient="bg-gradient-to-r from-purple-400 to-purple-600"
                category="Inovasi"
                title="Alat Penghemat Air"
                description="Alat inovatif yang dapat menghemat penggunaan air hingga 40% di lingkungan sekolah."
                badge="Juara 1"
                badgeColor="bg-yellow-100 text-yellow-800"
                author="Budi Santoso"
              />
            </SlideUp>

            <SlideUp delay={0.3}>
              <ContentCard
                gradient="bg-gradient-to-r from-yellow-400 to-yellow-600"
                category="Seni Musik"
                title="Komposisi Orkestra"
                description="Komposisi orkestra orisinal yang menggabungkan musik tradisional dan modern."
                badge="Juara 3"
                badgeColor="bg-purple-100 text-purple-800"
                author="Dewi Lestari"
              />
            </SlideUp>

            <SlideUp delay={0.4}>
              <ContentCard
                gradient="bg-gradient-to-r from-red-400 to-red-600"
                category="Karya Ilmiah"
                title="Energi Terbarukan"
                description="Penelitian tentang pemanfaatan energi terbarukan untuk kebutuhan sekolah."
                badge="Juara 1"
                badgeColor="bg-indigo-100 text-indigo-800"
                author="Rina Puspita"
              />
            </SlideUp>

            <SlideUp delay={0.5}>
              <ContentCard
                gradient="bg-gradient-to-r from-indigo-400 to-indigo-600"
                category="Fotografi"
                title="Kehidupan Sekolah"
                description="Kumpulan foto dokumenter kehidupan sehari-hari di lingkungan sekolah."
                badge="Juara 2"
                badgeColor="bg-pink-100 text-pink-800"
                author="Joko Prasetyo"
              />
            </SlideUp>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
