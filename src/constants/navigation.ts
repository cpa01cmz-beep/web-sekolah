import { NavLink } from 'react-router-dom'

export interface NavLinkItem {
  name: string
  href: string
  submenu?: NavSubmenuItem[]
}

export interface NavSubmenuItem {
  name: string
  href: string
}

export const navLinks: NavLinkItem[] = [
  { name: 'Beranda', href: '/' },
  {
    name: 'Berita',
    href: '#',
    submenu: [
      { name: 'Update', href: '/news/update' },
      { name: 'Pengumuman', href: '/news/announcements' },
      { name: 'Indeks', href: '/news/index' },
    ],
  },
  {
    name: 'Profil',
    href: '#',
    submenu: [
      { name: 'Profil Sekolah', href: '/profile/school' },
      { name: 'Layanan & Produk', href: '/profile/services' },
      { name: 'Prestasi & Penghargaan', href: '/profile/achievements' },
      { name: 'Ekstrakurikuler', href: '/profile/extracurricular' },
      { name: 'Fasilitas Sarana dan Prasarana', href: '/profile/facilities' },
    ],
  },
  { name: 'Karya', href: '/works' },
  { name: 'Galeri', href: '/gallery' },
  {
    name: 'Tautan',
    href: '#',
    submenu: [
      { name: 'Tautan Terkait', href: '/links/related' },
      { name: 'Download', href: '/links/download' },
    ],
  },
  { name: 'Kontak', href: '/contact' },
  { name: 'PPDB', href: '/ppdb' },
]
