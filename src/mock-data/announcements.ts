export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
}

export const initialAnnouncements: Announcement[] = [
  {
    id: 'ann1',
    title: 'Mid-term Exam Schedule',
    content: 'The mid-term exam schedule has been posted. Please check main notice board.',
    author: 'Admin Sekolah',
    date: new Date('2024-07-18').toISOString(),
  },
  {
    id: 'ann2',
    title: 'Class 11-A Project Deadline',
    content: 'Reminder: The mathematics project is due this Friday.',
    author: 'Ibu Siti',
    date: new Date('2024-07-22').toISOString(),
  },
  {
    id: 'ann3',
    title: 'Parent-Teacher Meeting Schedule',
    content: 'The parent-teacher meeting will be held next Saturday.',
    author: 'Admin Sekolah',
    date: new Date('2024-07-19').toISOString(),
  },
];
