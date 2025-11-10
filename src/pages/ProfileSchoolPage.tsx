import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { motion } from 'framer-motion';

export function ProfileSchoolPage() {
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
              Profil Sekolah
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground"
            >
              Mengenal lebih dekat tentang sejarah, visi, dan misi sekolah kami.
            </motion.p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-foreground">Sejarah Sekolah</h2>
              <p className="mt-4 text-muted-foreground">
                Berdiri sejak tahun 2005, sekolah kami telah berkomitmen untuk memberikan pendidikan berkualitas tinggi dengan mengedepankan nilai-nilai karakter dan inovasi teknologi dalam proses belajar mengajar.
              </p>
              <p className="mt-4 text-muted-foreground">
                Dengan visi menjadi pusat unggulan pendidikan berbasis teknologi, kami terus mengembangkan kurikulum yang relevan dengan perkembangan zaman dan kebutuhan industri.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg h-80 flex items-center justify-center">
                <span className="text-white text-xl font-bold">Foto Gedung Sekolah</span>
              </div>
            </motion.div>
          </div>
          
          <div className="mt-24 grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-card rounded-lg shadow-md p-6 text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1000+</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Siswa Aktif</h3>
              <p className="text-muted-foreground">Komunitas siswa yang aktif dan berprestasi</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card rounded-lg shadow-md p-6 text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">50+</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Tenaga Pendidik</h3>
              <p className="text-muted-foreground">Guru profesional dan berpengalaman</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card rounded-lg shadow-md p-6 text-center"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">20+</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Program Unggulan</h3>
              <p className="text-muted-foreground">Berbagai program khusus untuk pengembangan siswa</p>
            </motion.div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}