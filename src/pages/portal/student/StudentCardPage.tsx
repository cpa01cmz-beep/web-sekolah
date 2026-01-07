import { useRef, useState } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { useStudentCard } from '@/hooks/useStudent';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GraduationCap, QrCode, Download, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

function CardSkeleton() {
  return (
    <div className="w-[550px] h-[330px] bg-muted rounded-2xl p-6 flex flex-col justify-between">
      <Skeleton className="h-10 w-1/2" />
      <div className="flex items-center gap-6">
        <Skeleton className="h-32 w-32 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export function StudentCardPage() {
  const user = useAuthStore((state) => state.user);
  const { data: cardData, isLoading, error } = useStudentCard(user?.id || '');
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    toast.info('Generating PDF...');
    html2canvas(cardRef.current, {
      scale: 2,
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

  if (isLoading) return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 flex flex-col items-center"
    >
      <div className="text-center">
        <Skeleton className="h-9 w-1/3 mx-auto mb-2" />
        <Skeleton className="h-4 w-2/3 mx-auto" />
      </div>
      <CardSkeleton />
      <Skeleton className="h-12 w-48" />
    </motion.div>
  );

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load student card data. Please try again later.</AlertDescription>
      </Alert>
    );
  }

  if (!cardData) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>No Card Data</AlertTitle>
        <AlertDescription>Student card information is not available.</AlertDescription>
      </Alert>
    );
  }

  const studentData = cardData;

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
            <AvatarImage src={studentData.photoUrl || user.avatarUrl} alt={user.name} />
            <AvatarFallback className="text-4xl bg-white/20">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <div>
              <p className="text-sm opacity-80">Nama Lengkap</p>
              <p className="font-semibold text-2xl">{user.name}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Nomor Induk Siswa</p>
              <p className="font-semibold text-lg">{studentData.studentIdNumber}</p>
            </div>
             <div>
              <p className="text-sm opacity-80">Kelas</p>
              <p className="font-semibold text-lg">{studentData.className}</p>
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