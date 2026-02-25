export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    VERIFY: '/api/auth/verify',
    LOGOUT: '/api/auth/logout',
  },
  STUDENTS: {
    DASHBOARD: (studentId: string) => `/api/students/${studentId}/dashboard`,
    GRADES: (studentId: string) => `/api/students/${studentId}/grades`,
    SCHEDULE: (studentId: string) => `/api/students/${studentId}/schedule`,
    CARD: (studentId: string) => `/api/students/${studentId}/card`,
  },
  TEACHERS: {
    DASHBOARD: (teacherId: string) => `/api/teachers/${teacherId}/dashboard`,
    CLASSES: (teacherId: string) => `/api/teachers/${teacherId}/classes`,
    SCHEDULE: (teacherId: string) => `/api/teachers/${teacherId}/schedule`,
    GRADES: '/api/teachers/grades',
    ANNOUNCEMENTS: (teacherId: string) => `/api/teachers/${teacherId}/announcements`,
    CREATE_ANNOUNCEMENT: '/api/teachers/announcements',
    MESSAGES: (teacherId: string) => `/api/teachers/${teacherId}/messages`,
    MESSAGE_READ: (teacherId: string, messageId: string) =>
      `/api/teachers/${teacherId}/messages/${messageId}/read`,
    MESSAGE_CONVERSATION: (teacherId: string, otherUserId: string) =>
      `/api/teachers/${teacherId}/messages/${otherUserId}/conversation`,
    UNREAD_COUNT: (teacherId: string) => `/api/teachers/${teacherId}/messages/unread-count`,
  },
  CLASSES: {
    STUDENTS: (classId: string) => `/api/classes/${classId}/students`,
  },
  PARENTS: {
    DASHBOARD: (parentId: string) => `/api/parents/${parentId}/dashboard`,
    SCHEDULE: (parentId: string) => `/api/parents/${parentId}/schedule`,
    MESSAGES: (parentId: string) => `/api/parents/${parentId}/messages`,
    MESSAGE_READ: (parentId: string, messageId: string) =>
      `/api/parents/${parentId}/messages/${messageId}/read`,
    MESSAGE_CONVERSATION: (parentId: string, otherUserId: string) =>
      `/api/parents/${parentId}/messages/${otherUserId}/conversation`,
    UNREAD_COUNT: (parentId: string) => `/api/parents/${parentId}/messages/unread-count`,
    TEACHERS: (parentId: string) => `/api/parents/${parentId}/teachers`,
  },
  ADMIN: {
    DASHBOARD: '/api/admin/dashboard',
    USERS: '/api/admin/users',
    USER: (userId: string) => `/api/admin/users/${userId}`,
    ANNOUNCEMENTS: '/api/admin/announcements',
    ANNOUNCEMENT: (announcementId: string) => `/api/admin/announcements/${announcementId}`,
    UPDATE_ANNOUNCEMENT: (announcementId: string) => `/api/admin/announcements/${announcementId}`,
    SETTINGS: '/api/admin/settings',
  },
  PUBLIC: {
    PROFILE: '/api/public/profile',
    SERVICES: '/api/public/services',
    ACHIEVEMENTS: '/api/public/achievements',
    FACILITIES: '/api/public/facilities',
    NEWS: '/api/public/news',
    NEWS_DETAIL: (id: string) => `/api/public/news/${id}`,
    GALLERY: '/api/public/gallery',
    WORKS: '/api/public/work',
    LINKS: '/api/public/links',
    DOWNLOADS: '/api/public/downloads',
  },
} as const
