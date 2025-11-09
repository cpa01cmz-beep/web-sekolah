import { useRef, useState } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GraduationCap, QrCode, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
export function StudentCardPage() {
  const user = useAuthStore((state) => state.user);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const handleDownload = () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    toast.info('Generating PDF...');
    html2canvas(cardRef.current, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      backgroundColor: null,
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`student-card-${user?.id || 'user'}.pdf`);
      setIsDownloading(false);
      toast.success('PDF downloaded successfully!');
    }).catch(err => {
      console.error("Error generating PDF:", err);
      toast.error('Failed to generate PDF.');
      setIsDownloading(false);
    });
  };
  if (!user) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 flex flex-col items-center"
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold">Kartu Pelajar Digital</h1>
        <p className="text-muted-foreground">Ini adalah kartu pelajar digital Anda. Anda dapat mengunduhnya sebagai PDF.</p>
      </div>
      <div
        ref={cardRef}
        className="w-[550px] h-[330px] bg-gradient-to-br from-[#0D47A1] to-[#00ACC1] rounded-2xl p-6 text-white shadow-2xl flex flex-col justify-between relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/10 rounded-full"></div>
        <header className="flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-10 w-10" />
            <div>
              <h2 className="font-bold text-xl">AKADEMIA PRO</h2>
              <p className="text-xs opacity-80">KARTU TANDA PELAJAR</p>
            </div>
          </div>
          <p className="font-mono text-xs">2023/2024</p>
        </header>
        <main className="flex items-center gap-6 z-10">
          <Avatar className="h-32 w-32 border-4 border-white/50">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="text-4xl bg-white/20">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <div>
              <p className="text-sm opacity-80">Nama Lengkap</p>
              <p className="font-semibold text-2xl">{user.name}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Nomor Induk Siswa</p>
              <p className="font-semibold text-lg">1234567890</p>
            </div>
             <div>
              <p className="text-sm opacity-80">Kelas</p>
              <p className="font-semibold text-lg">11-A</p>
            </div>
          </div>
        </main>
        <footer className="flex justify-between items-end z-10">
            <p className="text-xs opacity-70">Jl. Pendidikan No. 123, Jakarta</p>
            <div className="bg-white p-2 rounded-lg">
                <QrCode className="h-16 w-16 text-black" />
            </div>
        </footer>
      </div>
      <Button onClick={handleDownload} disabled={isDownloading} size="lg" className="mt-8">
        <Download className="mr-2 h-5 w-5" />
        {isDownloading ? 'Downloading...' : 'Download as PDF'}
      </Button>
    </motion.div>
  );
}