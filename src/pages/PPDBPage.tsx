import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

export function PPDBPage() {
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
              Pendaftaran PPDB
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground"
            >
              Pendaftaran Peserta Didik Baru Tahun Ajaran 2025/2026
            </motion.p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">Informasi PPDB</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-primary">Jadwal Penting</h3>
                  <ul className="mt-4 space-y-3">
                    <li className="flex">
                      <span className="font-medium w-40">Pendaftaran Online:</span>
                      <span>1 Desember 2025 - 31 Januari 2026</span>
                    </li>
                    <li className="flex">
                      <span className="font-medium w-40">Tes Seleksi:</span>
                      <span>15 Februari 2026</span>
                    </li>
                    <li className="flex">
                      <span className="font-medium w-40">Pengumuman Hasil:</span>
                      <span>1 Maret 2026</span>
                    </li>
                    <li className="flex">
                      <span className="font-medium w-40">Daftar Ulang:</span>
                      <span>5-10 Maret 2026</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-primary">Persyaratan</h3>
                  <ul className="mt-4 space-y-2 list-disc list-inside text-muted-foreground">
                    <li>Fotokopi akta kelahiran (2 lembar)</li>
                    <li>Fotokopi kartu keluarga (2 lembar)</li>
                    <li>Pas foto 3x4 (4 lembar)</li>
                    <li>Surat keterangan lulus dari sekolah sebelumnya</li>
                    <li>Nilai rapor semester 1-5 (fotokopi dilegalisir)</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-primary">Kontak Informasi</h3>
                  <p className="mt-4 text-muted-foreground">
                    Jika Anda memiliki pertanyaan tentang proses PPDB, silakan hubungi kami:
                  </p>
                  <div className="mt-4 space-y-2">
                    <p><span className="font-medium">Telepon:</span> (021) 123-4567</p>
                    <p><span className="font-medium">Email:</span> ppdb@akademia.pro</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-card rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">Formulir Pendaftaran</h2>
                <form className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input id="name" placeholder="Masukkan nama lengkap" required />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="placeOfBirth">Tempat Lahir</Label>
                      <Input id="placeOfBirth" placeholder="Tempat lahir" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Tanggal Lahir</Label>
                      <Input id="dateOfBirth" type="date" required />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nisn">NISN</Label>
                    <Input id="nisn" placeholder="Nomor Induk Siswa Nasional" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="school">Asal Sekolah</Label>
                    <Input id="school" placeholder="Nama sekolah sebelumnya" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="level">Jenjang yang Dituju</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenjang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="smp">SMP (Kelas 7)</SelectItem>
                        <SelectItem value="sma">SMA (Kelas 10)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Orang Tua</Label>
                    <Input id="email" type="email" placeholder="email@contoh.com" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <Input id="phone" type="tel" placeholder="081234567890" required />
                  </div>
                  
                  <Button type="submit" className="w-full">Daftar Sekarang</Button>
                </form>
              </div>
              
              <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-blue-800 mb-2">Panduan Pendaftaran</h3>
                <p className="text-blue-700">
                  Pastikan semua data yang Anda masukkan sudah benar dan lengkap. Setelah mendaftar, Anda akan menerima email konfirmasi dengan instruksi selanjutnya.
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