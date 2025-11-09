# API Documentation

## Authentication Endpoints

### POST /api/auth/login
Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "student|teacher|parent|admin"
  }
}
```

### POST /api/auth/logout
Logout the current user.

**Response:**
```json
{
  "message": "Successfully logged out"
}
```

### POST /api/auth/register
Register a new user (admin only).

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "newuserpassword",
  "name": "New User",
  "role": "student|teacher|parent|admin"
}
```

**Response:**
```json
{
  "user": {
    "id": "new_user_id",
    "email": "newuser@example.com",
    "name": "New User",
    "role": "student|teacher|parent|admin"
  }
}
```

## User Endpoints

### GET /api/users/profile
Get the current user's profile.

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "User Name",
  "role": "student|teacher|parent|admin",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "lastLogin": "2023-01-01T00:00:00.000Z"
}
```

### PUT /api/users/profile
Update the current user's profile.

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
  "id": "user_id",
  "email": "updated@example.com",
  "name": "Updated Name",
  "role": "student|teacher|parent|admin",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "lastLogin": "2023-01-01T00:00:00.000Z"
}
```

### GET /api/users/:id
Get a specific user (admin only).

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "User Name",
  "role": "student|teacher|parent|admin",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "lastLogin": "2023-01-01T00:00:00.000Z"
}
```

## Student-Specific Endpoints

### GET /api/student/schedule
Get the student's class schedule.

**Response:**
```json
{
  "schedule": [
    {
      "classId": "class_id",
      "subject": "Mathematics",
      "teacher": "Teacher Name",
      "startTime": "08:00",
      "endTime": "09:00",
      "days": ["Monday", "Wednesday", "Friday"]
    }
  ]
}
```

### GET /api/student/grades
Get the student's grades.

**Response:**
```json
{
  "grades": [
    {
      "subject": "Mathematics",
      "grade": "A",
      "term": "Semester 1"
    }
  ]
}
```

### GET /api/student/card
Get the student's digital card.

**Response:**
```json
{
  "studentId": "student_id",
  "name": "Student Name",
  "gradeLevel": 10,
  "photo": "base64_encoded_image",
  "validUntil": "2024-06-30"
}
```

## Teacher-Specific Endpoints

### GET /api/teacher/classes
Get the teacher's assigned classes.

**Response:**
```json
{
  "classes": [
    {
      "classId": "class_id",
      "name": "Class Name",
      "subject": "Mathematics",
      "studentCount": 25
    }
  ]
}
```

### POST /api/teacher/grades
Submit grades for students.

**Request Body:**
```json
{
  "classId": "class_id",
  "grades": [
    {
      "studentId": "student_id",
      "grade": "A",
      "term": "Semester 1"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Grades submitted successfully"
}
```

### POST /api/teacher/announce
Post an announcement.

**Request Body:**
```json
{
  "title": "Class Announcement",
  "content": "Announcement content",
  "classId": "class_id"
}
```

**Response:**
```json
{
  "message": "Announcement posted successfully"
}
```