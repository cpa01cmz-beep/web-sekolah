import { useAuthStore } from '@/lib/authStore';
import { useStudentCard } from '@/hooks/useStudent';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageHeader } from '@/components/PageHeader';
import { GraduationCap, QrCode, Printer, AlertTriangle } from 'lucide-react';
import { SlideUp } from '@/components/animations';
import { toast } from 'sonner';
import { THEME_COLORS } from '@/theme/colors';
import { useCallback } from 'react';

function CardSkeleton() {
  return (
    <div className="w-full max-w-[550px] h-auto min-h-[330px] bg-muted rounded-2xl p-4 sm:p-6 flex flex-col justify-between">
      <Skeleton className="h-10 w-1/2" />
      <div className="flex items-center gap-4 sm:gap-6">
        <Skeleton className="h-24 w-24 sm:h-32 sm:w-32 rounded-full flex-shrink-0" />
        <div className="space-y-2 flex-1 min-w-0">
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

  const handlePrint = useCallback(() => {
    toast.info('Opening print dialog...');
    window.print();
    toast.success('Print dialog opened. Select "Save as PDF" to save as file.');
  }, []);

  if (!user) return null;

  if (isLoading) return (
    <SlideUp className="space-y-6 flex flex-col items-center px-4 sm:px-0 w-full">
      <div className="text-center w-full max-w-2xl">
        <Skeleton className="h-8 sm:h-9 w-1/3 mx-auto mb-2" />
        <Skeleton className="h-4 w-2/3 mx-auto" />
      </div>
      <CardSkeleton />
      <Skeleton className="h-12 w-48" />
    </SlideUp>
  );

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load student card data. Please try again later.</AlertDescription>
      </Alert>
    );
  }

  const studentData = cardData || {
    studentIdNumber: user.id,
    className: 'N/A',
    validUntil: new Date().toISOString().split('T')[0],
    photoUrl: user.avatarUrl || ''
  };

  return (
    <SlideUp className="space-y-6 flex flex-col items-center px-4 sm:px-0 w-full">
      <div className="text-center w-full max-w-2xl">
        <PageHeader
          title="Kartu Pelajar Digital"
          description="Ini adalah kartu pelajar digital Anda. Anda dapat mengunduhnya sebagai PDF."
        />
      </div>
      <div
        className="w-full max-w-[550px] min-h-[330px] rounded-2xl p-4 sm:p-6 text-white shadow-2xl flex flex-col justify-between relative overflow-hidden" style={{ background: `linear-gradient(to bottom right, ${THEME_COLORS.PRIMARY}, ${THEME_COLORS.SECONDARY})` }}
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 sm:w-40 sm:h-40 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 sm:w-40 sm:h-40 bg-white/10 rounded-full"></div>
        <header className="flex items-center justify-between z-10 gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <GraduationCap className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0" />
            <div>
              <h2 className="font-bold text-lg sm:text-xl">AKADEMIA PRO</h2>
              <p className="text-xs opacity-80">KARTU TANDA PELAJAR</p>
            </div>
          </div>
          <p className="font-mono text-xs flex-shrink-0">2023/2024</p>
        </header>
        <main className="flex items-center gap-4 sm:gap-6 z-10">
          <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white/50 flex-shrink-0">
            <AvatarImage src={studentData.photoUrl || user.avatarUrl} alt={user.name} />
            <AvatarFallback className="text-3xl sm:text-4xl bg-white/20">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1.5 sm:space-y-2 min-w-0 flex-1">
            <div>
              <p className="text-xs sm:text-sm opacity-80">Nama Lengkap</p>
              <p className="font-semibold text-lg sm:text-2xl truncate">{user.name}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm opacity-80">Nomor Induk Siswa</p>
              <p className="font-semibold text-base sm:text-lg truncate">{studentData.studentIdNumber}</p>
            </div>
             <div>
              <p className="text-xs sm:text-sm opacity-80">Kelas</p>
              <p className="font-semibold text-base sm:text-lg truncate">{studentData.className}</p>
            </div>
          </div>
        </main>
        <footer className="flex justify-between items-end z-10 gap-2">
            <p className="text-xs opacity-70 truncate">Jl. Pendidikan No. 123, Jakarta</p>
            <div className="bg-white p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                <QrCode className="h-12 w-12 sm:h-16 sm:w-16 text-black" />
            </div>
        </footer>
      </div>
      <Button onClick={handlePrint} size="lg" className="mt-6 sm:mt-8 w-full sm:w-auto">
        <Printer className="mr-2 h-5 w-5" />
        Print / Save as PDF
      </Button>
    </SlideUp>
  );
}
