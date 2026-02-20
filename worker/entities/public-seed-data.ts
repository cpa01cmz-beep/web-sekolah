import type { 
  SchoolProfile, 
  Service, 
  Achievement, 
  Facility, 
  NewsItem, 
  GalleryItem, 
  WorkItem, 
  LinkItem, 
  DownloadItem 
} from "@shared/types";

const now = new Date().toISOString();

export const publicSeedData = {
  schoolProfile: [
    {
      id: "default",
      name: "SMA Negeri 1 Jakarta",
      description: "SMA Negeri 1 Jakarta adalah sekolah menengah atas unggulan yang berkomitmen untuk menghasilkan lulusan berkualitas dengan karakter yang kuat dan kompetensi global.",
      vision: "Menjadi sekolah unggulan yang menghasilkan lulusan berkarakter, berprestasi, dan berwawasan global.",
      mission: "1. Membentuk karakter siswa yang beriman, berakhlak mulia, dan berbudaya\n2. Mengembangkan potensi akademik dan non-akademik siswa secara optimal\n3. Menciptakan lingkungan belajar yang kondusif dan inovatif\n4. Membekali siswa dengan keterampilan abad 21",
      address: "Jl. Budi Utomo No.7, Ps. Baru, Kecamatan Sawah Besar, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10710",
      phone: "(021) 3456789",
      email: "info@sman1jakarta.sch.id",
      principalName: "Dr. H. Ahmad Sudrajat, M.Pd."
    }
  ] as (SchoolProfile & { id: string })[],

  services: [
    {
      id: "svc-01",
      name: "Pendaftaran Siswa Baru",
      description: "Layanan pendaftaran siswa baru untuk tahun ajaran berikutnya dengan sistem online yang terintegrasi.",
      icon: "user-plus"
    },
    {
      id: "svc-02",
      name: "E-Learning",
      description: "Platform pembelajaran digital yang mendukung kegiatan belajar mengajar jarak jauh dan tatap muka.",
      icon: "monitor"
    },
    {
      id: "svc-03",
      name: "Perpustakaan Digital",
      description: "Akses ke ribuan buku digital, jurnal, dan sumber belajar online untuk seluruh warga sekolah.",
      icon: "book-open"
    },
    {
      id: "svc-04",
      name: "Konseling BK",
      description: "Layanan bimbingan konseling untuk membantu siswa dalam pengembangan akademik dan karir.",
      icon: "users"
    },
    {
      id: "svc-05",
      name: "UKS",
      description: "Unit Kesehatan Sekolah yang menyediakan layanan kesehatan dasar untuk warga sekolah.",
      icon: "heart"
    },
    {
      id: "svc-06",
      name: "Ekstrakurikuler",
      description: "Berbagai kegiatan ekstrakurikuler untuk mengembangkan minat dan bakat siswa.",
      icon: "star"
    }
  ] as Service[],

  achievements: [
    {
      id: "ach-01",
      title: "Juara 1 Olimpiade Matematika Tingkat Provinsi",
      description: "Tim Olimpiade Matematika SMA Negeri 1 Jakarta berhasil meraih juara pertama dalam Olimpiade Matematika Tingkat Provinsi DKI Jakarta tahun 2025.",
      date: "2025-01-15",
      category: "Akademik",
      image: "/images/achievements/olimpiade-matematika.jpg"
    },
    {
      id: "ach-02",
      title: "Juara 2 Lomba Debat Bahasa Inggris",
      description: "Tim Debat Bahasa Inggris meraih posisi runner-up dalam kompetisi debat bahasa Inggris tingkat nasional.",
      date: "2025-02-10",
      category: "Akademik",
      image: "/images/achievements/debat-inggris.jpg"
    },
    {
      id: "ach-03",
      title: "Medali Emas PON Atletik",
      description: "Atlet dari SMA Negeri 1 Jakarta berhasil meraih medali emas dalam cabang atletik pada PON XX Papua.",
      date: "2024-10-20",
      category: "Olahraga",
      image: "/images/achievements/atletik-pon.jpg"
    }
  ] as Achievement[],

  facilities: [
    {
      id: "fac-01",
      name: "Laboratorium Komputer",
      description: "Laboratorium komputer dengan 60 unit PC terbaru dan koneksi internet berkecepatan tinggi.",
      image: "/images/facilities/lab-komputer.jpg",
      capacity: 60
    },
    {
      id: "fac-02",
      name: "Laboratorium IPA",
      description: "Laboratorium IPA lengkap untuk praktikum Fisika, Kimia, dan Biologi dengan peralatan modern.",
      image: "/images/facilities/lab-ipa.jpg",
      capacity: 40
    },
    {
      id: "fac-03",
      name: "Perpustakaan",
      description: "Perpustakaan dengan koleksi lebih dari 10.000 buku dan area baca yang nyaman.",
      image: "/images/facilities/perpustakaan.jpg",
      capacity: 100
    },
    {
      id: "fac-04",
      name: "Lapangan Olahraga",
      description: "Lapangan olahraga serbaguna untuk sepak bola, basket, dan voli.",
      image: "/images/facilities/lapangan.jpg",
      capacity: 500
    },
    {
      id: "fac-05",
      name: "Aula Serbaguna",
      description: "Aula serbaguna berkapasitas 1000 orang untuk berbagai kegiatan sekolah.",
      image: "/images/facilities/aula.jpg",
      capacity: 1000
    }
  ] as Facility[],

  news: [
    {
      id: "news-01",
      title: "Pembukaan Pendaftaran Siswa Baru Tahun Ajaran 2025/2026",
      content: "SMA Negeri 1 Jakarta membuka pendaftaran siswa baru untuk tahun ajaran 2025/2026. Pendaftaran dapat dilakukan secara online melalui website resmi sekolah. Persyaratan dan jadwal lengkap dapat dilihat di halaman PPDB.\n\nPendaftaran dibuka mulai tanggal 1 Maret 2025 hingga 30 April 2025. Seleksi akan dilakukan dalam dua tahap, yaitu seleksi berkas dan seleksi wawancara.\n\nUntuk informasi lebih lanjut, silakan hubungi panitia PPDB di nomor (021) 3456789 atau email ppdb@sman1jakarta.sch.id.",
      excerpt: "Pendaftaran siswa baru tahun ajaran 2025/2026 dibuka mulai 1 Maret hingga 30 April 2025.",
      date: now,
      author: "Admin Sekolah",
      category: "Pengumuman",
      image: "/images/news/ppdb-2025.jpg"
    },
    {
      id: "news-02",
      title: "Siswa SMAN 1 Jakarta Raih Juara Olimpiade Sains Nasional",
      content: "Siswa SMA Negeri 1 Jakarta berhasil meraih medali emas dalam Olimpiade Sains Nasional (OSN) bidang Matematika. Prestasi ini merupakan bukti kerja keras dan dedikasi siswa serta pembinaan yang intensif dari para guru pembimbing.\n\nMedali emas diraih oleh Ahmad Rizki dari kelas XII IPA 1. Selain itu, dua siswa lainnya meraih medali perak dan perunggu dalam bidang Fisika dan Kimia.\n\nKepala Sekolah menyampaikan apresiasi atas prestasi yang diraih dan berharap dapat memotivasi siswa lain untuk terus berprestasi.",
      excerpt: "Ahmad Rizki dari kelas XII IPA 1 meraih medali emas OSN Matematika tingkat nasional.",
      date: now,
      author: "Humas SMAN 1",
      category: "Prestasi",
      image: "/images/news/osn-2025.jpg"
    },
    {
      id: "news-03",
      title: "Workshop Kewirausahaan Digital",
      content: "SMA Negeri 1 Jakarta menyelenggarakan workshop kewirausahaan digital yang diikuti oleh seluruh siswa kelas XI. Workshop ini bertujuan untuk memperkenalkan konsep kewirausahaan di era digital kepada siswa.\n\nNarasumber workshop adalah praktisi bisnis digital yang telah sukses mengembangkan startup teknologi. Siswa diajarkan tentang cara memulai bisnis online, digital marketing, dan pengelolaan keuangan usaha.\n\nKegiatan ini merupakan bagian dari program pengembangan life skills siswa SMA Negeri 1 Jakarta.",
      excerpt: "Workshop kewirausahaan digital untuk siswa kelas XI dengan praktisi bisnis digital.",
      date: now,
      author: "Tim BK",
      category: "Kegiatan",
      image: "/images/news/workshop.jpg"
    }
  ] as NewsItem[],

  gallery: [
    {
      id: "gal-01",
      title: "Upacara Hari Kemerdekaan",
      description: "Kegiatan upacara peringatan Hari Kemerdekaan Indonesia ke-79",
      imageUrl: "/images/gallery/upacara-17an.jpg",
      date: "2024-08-17",
      category: "Kegiatan"
    },
    {
      id: "gal-02",
      title: "Pentas Seni Sekolah",
      description: "Pertunjukan seni dan budaya oleh siswa dalam rangka hari jadi sekolah",
      imageUrl: "/images/gallery/pentas-seni.jpg",
      date: "2024-09-15",
      category: "Kegiatan"
    },
    {
      id: "gal-03",
      title: "Wisuda Angkatan 2024",
      description: "Prosesi wisuda angkatan 2024 di Aula Serbaguna sekolah",
      imageUrl: "/images/gallery/wisuda-2024.jpg",
      date: "2024-06-20",
      category: "Wisuda"
    },
    {
      id: "gal-04",
      title: "Study Tour Kelas XII",
      description: "Kegiatan study tour kelas XII ke Yogyakarta",
      imageUrl: "/images/gallery/study-tour.jpg",
      date: "2024-05-10",
      category: "Study Tour"
    }
  ] as GalleryItem[],

  works: [
    {
      id: "work-01",
      title: "Aplikasi Inventaris Laboratorium",
      description: "Aplikasi berbasis web untuk mengelola inventaris laboratorium komputer sekolah. Dibuat oleh tim siswa kelas XII RPL.",
      imageUrl: "/images/works/inventaris-lab.jpg",
      date: now,
      author: "Tim RPL XII"
    },
    {
      id: "work-02",
      title: "Website Ekstrakurikuler",
      description: "Website profil ekstrakurikuler sekolah dengan fitur pendaftaran online dan jadwal kegiatan.",
      imageUrl: "/images/works/website-ekskul.jpg",
      date: now,
      author: "Tim Web Dev"
    },
    {
      id: "work-03",
      title: "Sistem Presensi Digital",
      description: "Sistem presensi berbasis QR Code untuk kegiatan ekstrakurikuler dan organisasi siswa.",
      imageUrl: "/images/works/presensi-digital.jpg",
      date: now,
      author: "Ahmad Rizki"
    }
  ] as WorkItem[],

  links: [
    {
      id: "link-01",
      title: "Kemendikbud",
      url: "https://www.kemdikbud.go.id",
      description: "Kementerian Pendidikan dan Kebudayaan Republik Indonesia",
      category: "Pemerintah"
    },
    {
      id: "link-02",
      title: "Dinas Pendidikan DKI Jakarta",
      url: "https://disdik.jakarta.go.id",
      description: "Dinas Pendidikan Provinsi DKI Jakarta",
      category: "Pemerintah"
    },
    {
      id: "link-03",
      title: "Rumah Belajar",
      url: "https://belajar.kemdikbud.go.id",
      description: "Portal pembelajaran digital Kemendikbud",
      category: "E-Learning"
    },
    {
      id: "link-04",
      title: "Quipper",
      url: "https://www.quipper.com/id",
      description: "Platform pembelajaran online dengan video dan latihan soal",
      category: "E-Learning"
    },
    {
      id: "link-05",
      title: "Ruangguru",
      url: "https://ruangguru.com",
      description: "Aplikasi bimbel online dengan video belajar dan bank soal",
      category: "E-Learning"
    }
  ] as LinkItem[],

  downloads: [
    {
      id: "dl-01",
      title: "Buku Panduan PPDB 2025",
      description: "Panduan lengkap pendaftaran peserta didik baru tahun ajaran 2025/2026",
      fileUrl: "/files/panduan-ppdb-2025.pdf",
      fileSize: "2.5 MB",
      fileType: "PDF",
      date: now
    },
    {
      id: "dl-02",
      title: "Kalender Akademik 2025/2026",
      description: "Kalender akademik tahun ajaran 2025/2026",
      fileUrl: "/files/kalender-akademik.pdf",
      fileSize: "500 KB",
      fileType: "PDF",
      date: now
    },
    {
      id: "dl-03",
      title: "Formulir Pendaftaran Ekstrakurikuler",
      description: "Formulir pendaftaran kegiatan ekstrakurikuler",
      fileUrl: "/files/form-ekskul.docx",
      fileSize: "100 KB",
      fileType: "DOCX",
      date: now
    },
    {
      id: "dl-04",
      title: "Jadwal Ujian Semester",
      description: "Jadwal ujian semester genap tahun ajaran 2025/2026",
      fileUrl: "/files/jadwal-ujian.pdf",
      fileSize: "200 KB",
      fileType: "PDF",
      date: now
    }
  ] as DownloadItem[]
};
