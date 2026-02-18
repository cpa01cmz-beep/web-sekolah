import { LayoutDashboard, Calendar, Award, User, BookCopy, Megaphone, Users, Settings } from 'lucide-react';
import type { ComponentType } from 'react';

export interface NavLink {
  to: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
}

const iconMap = {
  dashboard: LayoutDashboard,
  calendar: Calendar,
  award: Award,
  user: User,
  bookCopy: BookCopy,
  megaphone: Megaphone,
  users: Users,
  settings: Settings,
} as const;

type IconKey = keyof typeof iconMap;

const createLink = (to: string, iconKey: IconKey, label: string): NavLink => ({
  to,
  icon: iconMap[iconKey],
  label,
});

export const studentLinks: NavLink[] = [
  createLink('dashboard', 'dashboard', 'Dashboard'),
  createLink('schedule', 'calendar', 'Schedule'),
  createLink('grades', 'award', 'Grades'),
  createLink('card', 'user', 'Student Card'),
];

export const teacherLinks: NavLink[] = [
  createLink('dashboard', 'dashboard', 'Dashboard'),
  createLink('schedule', 'calendar', 'Schedule'),
  createLink('grades', 'bookCopy', 'Grade Management'),
  createLink('announcements', 'megaphone', 'Announcements'),
];

export const parentLinks: NavLink[] = [
  createLink('dashboard', 'dashboard', 'Dashboard'),
  createLink('schedule', 'calendar', 'Student Schedule'),
];

export const adminLinks: NavLink[] = [
  createLink('dashboard', 'dashboard', 'Dashboard'),
  createLink('users', 'users', 'User Management'),
  createLink('announcements', 'megaphone', 'Announcements'),
  createLink('settings', 'settings', 'Settings'),
];

export const navLinksMap = {
  student: studentLinks,
  teacher: teacherLinks,
  parent: parentLinks,
  admin: adminLinks,
} as const;
