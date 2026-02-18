export const MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: (role: string) => `Logged in as ${role}. Redirecting...`,
    LOGIN_FAILED: 'Login failed. Please check your credentials.',
    ROLE_REQUIRED: 'Please select your role to login.',
  },
  USER: {
    CREATED: 'User created successfully.',
    UPDATED: 'User updated successfully.',
    DELETED: 'User deleted successfully.',
    CREATE_FAILED: (error: string) => `Failed to create user: ${error}`,
    UPDATE_FAILED: (error: string) => `Failed to update user: ${error}`,
    DELETE_FAILED: (error: string) => `Failed to delete user: ${error}`,
  },
  SETTINGS: {
    SAVED: 'Settings saved successfully!',
  },
  ANNOUNCEMENT: {
    POSTED: 'Announcement posted successfully!',
    DELETED: 'Announcement deleted.',
    LOGIN_REQUIRED: 'You must be logged in to post announcements.',
  },
  GRADE: {
    UPDATED: (studentName: string) => `Grade for ${studentName} updated successfully.`,
    UPDATE_FAILED: (error: string) => `Failed to update grade: ${error}`,
    NO_RECORD: 'Cannot save changes. No grade record exists for this student yet.',
  },
  PRINT: {
    OPENING: 'Opening print dialog...',
    OPENED: 'Print dialog opened. Select "Save as PDF" to save as file.',
  },
} as const;
