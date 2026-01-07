# API Documentation

## Health Endpoint

### GET /api/health
Check the health status of the API.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2023-01-01T00:00:00.000Z"
  }
}
```

## Seed Endpoint

### POST /api/seed
Seed the database with initial data.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Database seeded successfully."
  }
}
```

## Client Error Reporting

### POST /api/client-errors
Report client-side errors to the server.

**Request Body:**
```json
{
  "message": "Error message",
  "url": "https://example.com/page",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "stack": "Error stack trace",
  "componentStack": "React component stack",
  "errorBoundary": true,
  "errorBoundaryProps": {},
  "source": "https://example.com/script.js",
  "lineno": 10,
  "colno": 5,
  "error": {}
}
```

**Response:**
```json
{
  "success": true
}
```

## Student Endpoints

### GET /api/students/:id/dashboard
Get a student's dashboard data including schedule, recent grades, and announcements.

**Response:**
```json
{
  "success": true,
  "data": {
    "schedule": [
      {
        "day": "Senin",
        "time": "07:30 - 09:00",
        "courseId": "course_id",
        "courseName": "Mathematics",
        "teacherName": "Teacher Name"
      }
    ],
    "recentGrades": [
      {
        "id": "grade_id",
        "studentId": "student_id",
        "courseId": "course_id",
        "score": 85,
        "feedback": "Good work",
        "courseName": "Mathematics"
      }
    ],
    "announcements": [
      {
        "id": "announcement_id",
        "title": "School Event",
        "content": "Details about the event",
        "date": "2023-01-01T00:00:00.000Z",
        "authorId": "author_id",
        "authorName": "Author Name"
      }
    ]
  }
}
```

## Teacher Endpoints

### GET /api/teachers/:id/classes
Get the classes assigned to a teacher.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "class_id",
      "name": "Class Name",
      "teacherId": "teacher_id"
    }
  ]
}
```

### GET /api/classes/:id/students
Get the students in a specific class along with their grades.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "student_id",
      "name": "Student Name",
      "score": 85,
      "feedback": "Good work",
      "gradeId": "grade_id"
    }
  ]
}
```

## Grade Endpoints

### POST /api/grades
Create a new grade entry.

**Request Body:**
```json
{
  "studentId": "student_id",
  "courseId": "course_id",
  "score": 85,
  "feedback": "Good work"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "grade_id",
    "studentId": "student_id",
    "courseId": "course_id",
    "score": 85,
    "feedback": "Good work"
  }
}
```

### PUT /api/grades/:id
Update an existing grade entry.

**Request Body:**
```json
{
  "score": 90,
  "feedback": "Excellent work"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "grade_id",
    "studentId": "student_id",
    "courseId": "course_id",
    "score": 90,
    "feedback": "Excellent work"
  }
}
```

## User Endpoints

### GET /api/users
Get all users (admin only).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "student",
      "avatarUrl": "https://example.com/avatar.jpg"
    }
  ]
}
```

### POST /api/users
Create a new user (admin only).

**Request Body:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "role": "student|teacher|parent|admin",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new_user_id",
    "name": "New User",
    "email": "newuser@example.com",
    "role": "student|teacher|parent|admin",
    "avatarUrl": "https://example.com/avatar.jpg"
  }
}
```

### PUT /api/users/:id
Update an existing user (admin only).

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "Updated Name",
    "email": "updated@example.com",
    "role": "student|teacher|parent|admin",
    "avatarUrl": "https://example.com/avatar.jpg"
  }
}
```

### DELETE /api/users/:id
Delete a user (admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "deleted": true
  }
}
```
