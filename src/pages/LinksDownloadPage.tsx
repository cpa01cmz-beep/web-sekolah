import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { motion } from 'framer-motion';

export function LinksDownloadPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-grow">
        <div className="bg-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold text-primary"
            >
              Download
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground"
            >
              Unduh berbagai dokumen dan materi penting dari sekolah kami.
            </motion.p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">Dokumen Akademik</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-card rounded-lg shadow-sm">
                  <div>
                    <h3 className="font-bold">Kalender Akademik 2025/2026</h3>
                    <p className="text-sm text-muted-foreground mt-1">PDF, 2.4 MB</p>
                  </div>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors">
                    Download
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-card rounded-lg shadow-sm">
                  <div>
                    <h3 className="font-bold">Jadwal Pelajaran Semester Ganjil</h3>
                    <p className="text-sm text-muted-foreground mt-1">PDF, 1.8 MB</p>
                  </div>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors">
                    Download
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-card rounded-lg shadow-sm">
                  <div>
                    <h3 className="font-bold">Kurikulum Sekolah</h3>
                    <p className="text-sm text-muted-foreground mt-1">PDF, 3.2 MB</p>
                  </div>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors">
                    Download
                  </button>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">Formulir & Pengumuman</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-card rounded-lg shadow-sm">
                  <div>
                    <h3 className="font-bold">Formulir Pendaftaran Siswa Baru</h3>
                    <p className="text-sm text-muted-foreground mt-1">DOCX, 512 KB</p>
                  </div>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors">
                    Download
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-card rounded-lg shadow-sm">
                  <div>
                    <h3 className="font-bold">Panduan PPDB</h3>
                    <p className="text-sm text-muted-foreground mt-1">PDF, 1.2 MB</p>
                  </div>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors">
                    Download
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-card rounded-lg shadow-sm">
                  <div>
                    <h3 className="font-bold">Surat Izin Orang Tua</h3>
                    <p className="text-sm text-muted-foreground mt-1">DOCX, 256 KB</p>
                  </div>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors">
                    Download
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-16"
          >
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
          </motion.div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}