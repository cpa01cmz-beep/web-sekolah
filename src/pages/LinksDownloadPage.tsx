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
                <DownloadCard
                  title="Modul Matematika Kelas X"
                  fileFormat="PDF"
                  fileSize="2.4 MB"
                  description="Materi lengkap semester ganjil"
                  variant="vertical"
                  iconColor="blue"
                />
                <DownloadCard
                  title="Modul Bahasa Indonesia Kelas XI"
                  fileFormat="PDF"
                  fileSize="1.8 MB"
                  description="Materi lengkap semester ganjil"
                  variant="vertical"
                  iconColor="green"
                />
                <DownloadCard
                  title="Modul IPA Kelas XII"
                  fileFormat="PDF"
                  fileSize="3.2 MB"
                  description="Materi lengkap semester ganjil"
                  variant="vertical"
                  iconColor="purple"
                />
              </div>
            </div>
          </SlideUp>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
