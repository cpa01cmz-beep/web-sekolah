import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { SlideUp, SlideLeft, SlideRight } from '@/components/animations';
import { DownloadCard } from '@/components/cards';

export function LinksDownloadPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-grow">
        <div className="bg-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
            <SlideUp>
              <h1 className="text-4xl md:text-5xl font-bold text-primary">
                Download
              </h1>
            </SlideUp>
            <SlideUp delay={0.2}>
              <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                Unduh berbagai dokumen dan materi penting dari sekolah kami.
              </p>
            </SlideUp>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12">
            <SlideLeft>
              <h2 className="text-3xl font-bold text-foreground mb-6">Dokumen Akademik</h2>
              <div className="space-y-4">
                <DownloadCard
                  title="Kalender Akademik 2025/2026"
                  fileFormat="PDF"
                  fileSize="2.4 MB"
                />
                <DownloadCard
                  title="Jadwal Pelajaran Semester Ganjil"
                  fileFormat="PDF"
                  fileSize="1.8 MB"
                />
                <DownloadCard
                  title="Kurikulum Sekolah"
                  fileFormat="PDF"
                  fileSize="3.2 MB"
                />
              </div>
            </SlideLeft>

            <SlideRight delay={0.1}>
              <h2 className="text-3xl font-bold text-foreground mb-6">Formulir & Pengumuman</h2>
              <div className="space-y-4">
                <DownloadCard
                  title="Formulir Pendaftaran Siswa Baru"
                  fileFormat="DOCX"
                  fileSize="512 KB"
                />
                <DownloadCard
                  title="Panduan PPDB"
                  fileFormat="PDF"
                  fileSize="1.2 MB"
                />
                <DownloadCard
                  title="Surat Izin Orang Tua"
                  fileFormat="DOCX"
                  fileSize="256 KB"
                />
              </div>
            </SlideRight>
          </div>

          <SlideUp>
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-foreground mb-6">Materi Pembelajaran</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-card rounded-lg shadow-sm p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-blue-600 font-bold">PDF</span>
                  </div>
                  <h3 className="font-bold mb-2">Modul Matematika Kelas X</h3>
                  <p className="text-sm text-muted-foreground mb-4">Materi lengkap semester ganjil</p>
                  <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors">
                    Download
                  </button>
                </div>

                <div className="bg-card rounded-lg shadow-sm p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-green-600 font-bold">PDF</span>
                  </div>
                  <h3 className="font-bold mb-2">Modul Bahasa Indonesia Kelas XI</h3>
                  <p className="text-sm text-muted-foreground mb-4">Materi lengkap semester ganjil</p>
                  <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors">
                    Download
                  </button>
                </div>

                <div className="bg-card rounded-lg shadow-sm p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-purple-600 font-bold">PDF</span>
                  </div>
                  <h3 className="font-bold mb-2">Modul IPA Kelas XII</h3>
                  <p className="text-sm text-muted-foreground mb-4">Materi lengkap semester ganjil</p>
                  <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors">
                    Download
                  </button>
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
