import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { motion } from 'framer-motion';

export function NewsUpdatePage() {
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
              Update Berita
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground"
            >
              Temukan update terbaru seputar sekolah kami.
            </motion.p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Sample news cards - these would be populated dynamically in a real implementation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gradient-to-r from-blue-400 to-blue-600"></div>
              <div className="p-6">
                <span className="text-sm text-primary">25 November 2025</span>
                <h3 className="text-xl font-bold mt-2">Update Terbaru Sistem Akademik</h3>
                <p className="mt-3 text-muted-foreground">
                  Kami telah merilis update terbaru untuk sistem akademik yang mencakup fitur-fitur baru untuk meningkatkan pengalaman belajar siswa.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gradient-to-r from-green-400 to-green-600"></div>
              <div className="p-6">
                <span className="text-sm text-primary">18 November 2025</span>
                <h3 className="text-xl font-bold mt-2">Peningkatan Fasilitas Laboratorium</h3>
                <p className="mt-3 text-muted-foreground">
                  Laboratorium sains kami telah diperbarui dengan peralatan modern untuk mendukung pembelajaran praktik yang lebih baik.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gradient-to-r from-purple-400 to-purple-600"></div>
              <div className="p-6">
                <span className="text-sm text-primary">12 November 2025</span>
                <h3 className="text-xl font-bold mt-2">Program Pertukaran Siswa Internasional</h3>
                <p className="mt-3 text-muted-foreground">
                  Kami membuka pendaftaran untuk program pertukaran siswa internasional dengan beberapa sekolah mitra di luar negeri.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}