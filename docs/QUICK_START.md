# Quick Start Guide

This guide helps you get started with Akademia Pro for common use cases. For complete API documentation, see [API Blueprint](./blueprint.md).

## Table of Contents

- [Setting Up for the First Time](#setting-up-for-the-first-time)
- [Student Portal](#student-portal)
- [Teacher Portal](#teacher-portal)
- [Parent Portal](#parent-portal)
- [Admin Portal](#admin-portal)
- [Common Workflows](#common-workflows)

---

## Setting Up for the First Time

### Prerequisites

- Bun installed (runtime and package manager)
- Wrangler CLI (for Cloudflare Workers)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/cpa01cmz-beep/web-sekolah.git
   cd web-sekolah
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

   For local development, the defaults in `.env.example` work fine.

4. **Seed the database:**
   ```bash
   bun dev
   ```
   Then visit `http://localhost:3000/api/seed` to create sample data.

### Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | `student@example.com` | `password123` |
| Teacher | `teacher@example.com` | `password123` |
| Parent | `parent@example.com` | `password123` |
| Admin | `admin@example.com` | `password123` |

---

## Student Portal

Access your personal dashboard to view schedule, grades, and announcements.

### Viewing Your Schedule

1. **Log in** as a student
2. Navigate to **Schedule** in the sidebar
3. View your weekly class schedule with:
   - Day of the week
   - Time slots
   - Course names
   - Teacher names

### Checking Your Grades

1. **Log in** as a student
2. Navigate to **Grades** in the sidebar
3. View your grades for all courses with:
   - Course name
   - Score
   - Teacher feedback
   - Date graded

### Accessing Your Digital Student Card

1. **Log in** as a student
2. Navigate to **Student Card** in the sidebar
3. View your digital card with:
   - Your name and photo
   - Student ID number
   - Class information
4. Click **Download PDF** to save a copy

### Viewing Announcements

1. **Log in** as a student
2. Navigate to **Announcements** in the sidebar
3. View latest school announcements from:
   - Teachers
   - Administration
   - School staff

---

## Teacher Portal

Manage your classes, submit grades, and communicate with students.

### Managing Your Classes

1. **Log in** as a teacher
2. Navigate to **Classes** in the sidebar
3. View all classes you're teaching
4. Click on a class to see enrolled students

### Submitting Grades

1. **Log in** as a teacher
2. Navigate to **Grades** in the sidebar
3. Select a class
4. For each student:
   - Enter the score (0-100)
   - Add feedback (optional)
   - Click **Submit**
5. View submitted grades with history

### Posting Announcements

1. **Log in** as a teacher
2. Navigate to **Announcements** in the sidebar
3. Click **New Announcement**
4. Enter:
   - Title
   - Content/message
5. Click **Publish**
6. Announcement will be visible to students and parents

---

## Parent Portal

Monitor your child's academic progress and school activities.

### Viewing Child's Schedule

1. **Log in** as a parent
2. Navigate to **Schedule** in the sidebar
3. View your child's weekly class schedule

### Checking Child's Grades

1. **Log in** as a parent
2. Navigate to **Grades** in the sidebar
3. View all grades with:
   - Course name
   - Score
   - Teacher feedback
   - Date graded

### Viewing School Announcements

1. **Log in** as a parent
2. Navigate to **Announcements** in the sidebar
3. Stay updated on:
   - School events
   - Parent-teacher meetings
   - Important notices

---

## Admin Portal

Manage users and oversee school-wide data.

### Creating New Users

1. **Log in** as admin
2. Navigate to **User Management** in the sidebar
3. Click **Add User**
4. Select role (Student, Teacher, Parent, Admin)
5. Fill in required fields:
   - Name
   - Email
   - Password (optional, defaults to `password123`)
   - Role-specific fields (class, student ID, etc.)
6. Click **Save**

### Managing Existing Users

1. Navigate to **User Management**
2. View list of all users with filters by role
3. Click on a user to:
   - Edit information
   - View details
   - Delete user (with referential integrity checks)

### Viewing System Announcements

1. Navigate to **Announcements**
2. View all school announcements
3. Post new announcements as needed

### System Settings

1. Navigate to **Settings**
2. Configure:
   - Application settings
   - Security preferences
   - Notification preferences

---

## Common Workflows

### Creating a New Student

**Admin creates student account:**
1. Login as Admin
2. Go to User Management → Add User
3. Select "Student" role
4. Enter: Name, Email, Class, Student ID
5. Save

**Student logs in:**
1. Visit login page
2. Select "Student" role
3. Enter email and password
4. Access student portal

### Teacher Submits Grades

1. Login as Teacher
2. Go to Grades → Select Class
3. Enter scores and feedback for each student
4. Submit grades
5. Students can view grades immediately

### Parent Monitors Progress

1. Login as Parent
2. Go to Dashboard
3. View:
   - Child's latest grades
   - Recent announcements
   - Upcoming schedule

### Admin Onboards New Teacher

1. Create teacher account (User Management)
2. Assign classes to teacher (or create new classes)
3. Teacher logs in and can manage assigned classes
4. Teacher can post announcements and submit grades

---

## Getting Help

### Documentation

- [API Blueprint](./blueprint.md) - Complete API reference
- [README](../README.md) - Project overview and setup
- [GitHub Wiki](https://github.com/cpa01cmz-beep/web-sekolah/wiki) - Additional guides

### Troubleshooting

Common issues and solutions:

**Can't log in?**
- Verify email and password are correct
- Ensure you selected the correct role
- Check that user account exists in system

**Data not appearing?**
- Ensure database has been seeded: `POST /api/seed`
- Check browser console for errors
- Verify backend worker is running

**Permission denied?**
- Verify you have the correct role for the action
- Contact administrator if you believe this is an error

For more troubleshooting, see [Troubleshooting](../README.md#troubleshooting) in the README.

---

## Next Steps

- Explore the [API Blueprint](./blueprint.md) for technical details
- Set up webhooks for integrations
- Customize the application for your school's needs
- Deploy to Cloudflare Workers for production
