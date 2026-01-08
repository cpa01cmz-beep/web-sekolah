import type { SchoolData } from "@shared/types";

const now = new Date().toISOString();

export const seedData: SchoolData = {
  users: [
    {
      id: 'student-01',
      name: 'Budi Hartono',
      email: 'budi@example.com',
      role: 'student',
      avatarUrl: 'https://i.pravatar.cc/150?u=student01',
      classId: '11-A',
      studentIdNumber: '12345',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'student-02',
      name: 'Ani Suryani',
      email: 'ani@example.com',
      role: 'student',
      avatarUrl: 'https://i.pravatar.cc/150?u=student02',
      classId: '11-A',
      studentIdNumber: '12346',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'teacher-01',
      name: 'Ibu Siti',
      email: 'siti@example.com',
      role: 'teacher',
      avatarUrl: 'https://i.pravatar.cc/150?u=teacher01',
      classIds: ['11-A'],
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'teacher-02',
      name: 'Bapak Agus',
      email: 'agus@example.com',
      role: 'teacher',
      avatarUrl: 'https://i.pravatar.cc/150?u=teacher02',
      classIds: ['12-B'],
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'parent-01',
      name: 'Ayah Budi',
      email: 'ayah.budi@example.com',
      role: 'parent',
      avatarUrl: 'https://i.pravatar.cc/150?u=parent01',
      childId: 'student-01',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'admin-01',
      name: 'Admin Sekolah',
      email: 'admin@example.com',
      role: 'admin',
      avatarUrl: 'https://i.pravatar.cc/150?u=admin01',
      createdAt: now,
      updatedAt: now
    }
  ],

  classes: [
    {
      id: '11-A',
      name: 'Class 11-A',
      teacherId: 'teacher-01',
      createdAt: now,
      updatedAt: now
    },
    {
      id: '12-B',
      name: 'Class 12-B',
      teacherId: 'teacher-02',
      createdAt: now,
      updatedAt: now
    }
  ],

  courses: [
    {
      id: 'math-11',
      name: 'Mathematics',
      teacherId: 'teacher-01',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'phys-12',
      name: 'Physics',
      teacherId: 'teacher-02',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'hist-11',
      name: 'History',
      teacherId: 'teacher-01',
      createdAt: now,
      updatedAt: now
    }
  ],

  grades: [
    {
      id: 'g-01',
      studentId: 'student-01',
      courseId: 'math-11',
      score: 95,
      feedback: 'Excellent work!',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'g-02',
      studentId: 'student-01',
      courseId: 'hist-11',
      score: 88,
      feedback: 'Good understanding of material.',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'g-03',
      studentId: 'student-02',
      courseId: 'math-11',
      score: 82,
      feedback: 'Consistent effort.',
      createdAt: now,
      updatedAt: now
    }
  ],

  announcements: [
    {
      id: 'ann-01',
      title: 'Parent-Teacher Meeting',
      content: 'The meeting will be held next Saturday.',
      date: new Date().toISOString(),
      authorId: 'admin-01',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'ann-02',
      title: 'Math Project Deadline',
      content: 'The deadline for math project is this Friday.',
      date: new Date().toISOString(),
      authorId: 'teacher-01',
      createdAt: now,
      updatedAt: now
    }
  ],

  schedules: [
    {
      classId: '11-A',
      day: 'Senin',
      time: '08:00 - 09:30',
      courseId: 'math-11'
    },
    {
      classId: '11-A',
      day: 'Selasa',
      time: '10:00 - 11:30',
      courseId: 'hist-11'
    },
    {
      classId: '12-B',
      day: 'Senin',
      time: '08:00 - 09:30',
      courseId: 'phys-12'
    }
  ]

};
