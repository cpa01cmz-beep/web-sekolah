import type {
  TimestampedEntity,
  UserRole,
  AnnouncementTargetRole,
  ScheduleDay,
} from './common-types'

export interface BaseUser extends TimestampedEntity {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl: string
  passwordHash?: string | null
}

export interface Student extends BaseUser {
  role: 'student'
  classId: string
  studentIdNumber: string
}

export interface Teacher extends BaseUser {
  role: 'teacher'
  classIds: string[]
}

export interface Parent extends BaseUser {
  role: 'parent'
  childId: string
}

export interface Admin extends BaseUser {
  role: 'admin'
}

export type SchoolUser = Student | Teacher | Parent | Admin

export interface SchoolClass extends TimestampedEntity {
  id: string
  name: string
  teacherId: string
}

export interface Course extends TimestampedEntity {
  id: string
  name: string
  teacherId: string
}

export interface Grade extends TimestampedEntity {
  id: string
  studentId: string
  courseId: string
  score: number
  feedback: string
}

export interface Announcement extends TimestampedEntity {
  id: string
  title: string
  content: string
  date: string
  authorId: string
  targetRole: AnnouncementTargetRole
}

export interface ScheduleItem {
  day: ScheduleDay
  time: string
  courseId: string
}

export interface Message extends TimestampedEntity {
  id: string
  senderId: string
  senderRole: UserRole
  recipientId: string
  recipientRole: UserRole
  subject: string
  content: string
  isRead: boolean
  parentMessageId?: string | null
}

export interface MessageThread {
  message: Message
  replies: Message[]
  sender: SchoolUser
  recipient: SchoolUser
}
