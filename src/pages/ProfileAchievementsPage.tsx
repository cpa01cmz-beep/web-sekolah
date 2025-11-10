import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { motion } from 'framer-motion';

export function ProfileAchievementsPage() {
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
              Prestasi & Penghargaan
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground"
            >
              Prestasi gemilang yang telah diraih oleh sekolah dan siswa kami.
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
              <h2 className="text-3xl font-bold text-foreground mb-6">Prestasi Sekolah</h2>
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4 py-1">
                  <h3 className="text-xl font-bold">Sekolah Terbaik Tingkat Provinsi 2025</h3>
                  <p className="text-muted-foreground mt-2">
                    Penghargaan diterima dari Dinas Pendidikan Provinsi atas kualitas pembelajaran dan manajemen sekolah yang unggul.
                  </p>
                  <span className="text-sm text-primary mt-2">November 2025</span>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4 py-1">
                  <h3 className="text-xl font-bold">Juara 1 Lomba Inovasi Pendidikan</h3>
                  <p className="text-muted-foreground mt-2">
                    Meraih juara pertama dalam ajang inovasi pendidikan tingkat nasional dengan konsep pembelajaran berbasis teknologi.
                  </p>
                  <span className="text-sm text-primary mt-2">September 2025</span>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4 py-1">
                  <h3 className="text-xl font-bold">Sertifikasi Sekolah Ramah Anak</h3>
                  <p className="text-muted-foreground mt-2">
                    Mendapatkan sertifikasi sebagai sekolah ramah anak dari Komnas Perlindungan Anak.
                  </p>
                  <span className="text-sm text-primary mt-2">Juli 2025</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">Prestasi Siswa</h2>
              <div className="space-y-6">
                <div className="border-l-4 border-yellow-500 pl-4 py-1">
                  <h3 className="text-xl font-bold">Medali Emas Olimpiade Sains Nasional</h3>
                  <p className="text-muted-foreground mt-2">
                    Tim sains kami berhasil meraih medali emas di ajang Olimpiade Sains Nasional tingkat SMA.
                  </p>
                  <span className="text-sm text-primary mt-2">Oktober 2025</span>
                </div>
                
                <div className="border-l-4 border-red-500 pl-4 py-1">
                  <h3 className="text-xl font-bold">Juara 1 Lomba Debat Bahasa Inggris</h3>
                  <p className="text-muted-foreground mt-2">
                    Siswa kami meraih juara pertama dalam lomba debat bahasa Inggris tingkat regional.
                  </p>
                  <span className="text-sm text-primary mt-2">Agustus 2025</span>
                </div>
                
                <div className="border-l-4 border-indigo-500 pl-4 py-1">
                  <h3 className="text-xl font-bold">Beasiswa Luar Negeri</h3>
                  <p className="text-muted-foreground mt-2">
                    Lima siswa kami berhasil meraih beasiswa penuh untuk kuliah di universitas ternama di luar negeri.
                  </p>
                  <span className="text-sm text-primary mt-2">Juni 2025</span>
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-24 text-center"
          >
            <h2 className="text-3xl font-bold text-foreground mb-6">Galeri Prestasi</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg h-40 flex items-center justify-center">
                <span className="text-white font-bold">Piala Sekolah</span>
              </div>
              <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg h-40 flex items-center justify-center">
                <span className="text-white font-bold">Medali Siswa</span>
              </div>
              <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg h-40 flex items-center justify-center">
                <span className="text-white font-bold">Sertifikat</span>
              </div>
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg h-40 flex items-center justify-center">
                <span className="text-white font-bold">Dokumentasi</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}