export function PPDBInfo() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-foreground mb-6">Informasi PPDB</h2>

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
  );
}

export function PPDBGuide() {
  return (
    <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
      <h3 className="text-lg font-bold text-blue-800 mb-2">Panduan Pendaftaran</h3>
      <p className="text-blue-700">
        Pastikan semua data yang Anda masukkan sudah benar dan lengkap. Setelah mendaftar, Anda akan menerima email konfirmasi dengan instruksi selanjutnya.
      </p>
    </div>
  );
}
