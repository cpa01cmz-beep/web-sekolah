export interface ExtracurricularActivity {
  id: string
  title: string
  description: string
  tags: readonly string[]
  gradient: string
  badgeColor: string
}

export const EXTRACURRICULAR_ACTIVITIES: readonly ExtracurricularActivity[] = [
  {
    id: 'pramuka',
    title: 'Pramuka',
    description:
      'Membentuk karakter, kemandirian, dan jiwa kepemimpinan siswa melalui kegiatan kepramukaan.',
    tags: ['Karakter', 'Kepemimpinan'] as const,
    gradient: 'bg-gradient-to-r from-blue-400 to-blue-600',
    badgeColor: 'bg-blue-100 text-blue-800',
  },
  {
    id: 'olahraga',
    title: 'Olahraga',
    description:
      'Berbagai cabang olahraga untuk menjaga kebugaran fisik dan mengembangkan semangat sportivitas.',
    tags: ['Basket', 'Sepak Bola', 'Bulu Tangkis'] as const,
    gradient: 'bg-gradient-to-r from-green-400 to-green-600',
    badgeColor: 'bg-green-100 text-green-800',
  },
  {
    id: 'musik',
    title: 'Seni Musik',
    description:
      'Wadah untuk mengembangkan bakat musik siswa melalui berbagai instrumen dan vokal.',
    tags: ['Gitar', 'Vokal', 'Piano'] as const,
    gradient: 'bg-gradient-to-r from-purple-400 to-purple-600',
    badgeColor: 'bg-purple-100 text-purple-800',
  },
  {
    id: 'robotika',
    title: 'Robotika',
    description:
      'Mengembangkan kemampuan teknologi dan pemrograman melalui pembuatan robot dan kompetisi.',
    tags: ['STEM', 'Pemrograman'] as const,
    gradient: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
    badgeColor: 'bg-yellow-100 text-yellow-800',
  },
  {
    id: 'debat',
    title: 'Debat',
    description: 'Melatih kemampuan berbicara di depan umum dan kemampuan berpikir kritis siswa.',
    tags: ['Public Speaking', 'Argumentasi'] as const,
    gradient: 'bg-gradient-to-r from-red-400 to-red-600',
    badgeColor: 'bg-red-100 text-red-800',
  },
  {
    id: 'jurnalistik',
    title: 'Jurnalistik',
    description:
      'Mengembangkan kemampuan menulis dan jurnalisme siswa melalui kegiatan penerbitan majalah sekolah.',
    tags: ['Menulis', 'Fotografi'] as const,
    gradient: 'bg-gradient-to-r from-indigo-400 to-indigo-600',
    badgeColor: 'bg-indigo-100 text-indigo-800',
  },
] as const

export const EXTRACURRICULAR_PAGE_CONTENT = {
  title: 'Ekstrakurikuler',
  subtitle:
    'Berbagai kegiatan ekstrakurikuler yang kami tawarkan untuk mengembangkan bakat dan minat siswa.',
  joiningSection: {
    title: 'Bergabung dengan Kami',
    description:
      'Setiap siswa berhak mengikuti minimal satu kegiatan ekstrakurikuler. Pendaftaran dibuka setiap awal semester.',
    ctaText: 'Daftar Sekarang',
  },
} as const
