export const APP_CONFIG = {
  NAME: 'Akademia Pro',
  TAGLINE: 'Modern school management for a brighter future.',
  DESCRIPTION: 'The all-in-one school management system designed for modern educational era.',
  CONTACT: {
    ADDRESS: 'Jl. Raya No. 123, Jakarta, Indonesia',
    PHONE: '(021) 123-4567',
    EMAIL: 'info@akademiapro.sch.id',
    FOOTER_ADDRESS: 'Jl. Pendidikan No. 123, Jakarta',
    FOOTER_EMAIL: 'info@akademia.pro',
  },
  EXTERNAL_URLS: {
    PATTERN_CUBES: 'https://www.transparenttextures.com/patterns/cubes.png',
  },
  HERO_IMAGE:
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop',
  FEATURES: [
    {
      title: 'Unified Portal',
      description: 'One platform for students, teachers, parents, and admins.',
    },
    {
      title: 'RDM Integration',
      description: 'Seamlessly connect with Rapor Digital Madrasah for grade reporting.',
    },
    {
      title: 'Digital Student Cards',
      description: 'Generate and manage official digital student identification cards.',
    },
  ],
  VALUES: [
    {
      title: 'Excellence',
      description: 'Striving for the highest standards in education and technology.',
    },
    {
      title: 'Collaboration',
      description: 'Fostering a connected community between all school stakeholders.',
    },
    {
      title: 'Innovation',
      description: 'Continuously improving the educational experience with modern tools.',
    },
  ],
} as const;
