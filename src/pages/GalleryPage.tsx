import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { motion } from 'framer-motion';

export function GalleryPage() {
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
              Galeri
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground"
            >
              Dokumentasi kegiatan dan momen berharga di sekolah kami.
            </motion.p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className={`w-full h-full ${
                  index % 4 === 0 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                  index % 4 === 1 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                  index % 4 === 2 ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
                  'bg-gradient-to-r from-yellow-400 to-yellow-600'
                }`}></div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">Kategori Galeri</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="bg-card rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-blue-600">🎓</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Kegiatan Akademik</h3>
                <p className="text-muted-foreground">
                  Dokumentasi kegiatan belajar mengajar, ujian, dan presentasi siswa.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-card rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-green-600">⚽</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Ekstrakurikuler</h3>
                <p className="text-muted-foreground">
                  Kegiatan ekstrakurikuler siswa seperti olahraga, seni, dan klub.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-card rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-purple-600">🏆</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Prestasi & Penghargaan</h3>
                <p className="text-muted-foreground">
                  Momen perayaan prestasi siswa dan penghargaan yang diraih sekolah.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}