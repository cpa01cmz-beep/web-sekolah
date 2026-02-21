import { useAuthStore } from '@/lib/authStore';
import { teacherService } from '@/services/teacherService';
import { MessagesPageLayout } from '@/components/messages';
import type { SchoolUser } from '@shared/types';

export function TeacherMessagesPage() {
  const user = useAuthStore((state) => state.user);
  const teacherId = user?.id || '';

  const getParents = async (userId: string): Promise<SchoolUser[]> => {
    const classes = await teacherService.getClasses(userId);
    const allParents: SchoolUser[] = [];
    for (const cls of classes) {
      const students = await teacherService.getClassStudentsWithGrades(cls.id);
      for (const student of students) {
        if (student.parentId) {
          const response = await fetch(`/api/users/${student.parentId}`);
          const parent = await response.json();
          if (parent && !allParents.find(p => p.id === parent.id)) {
            allParents.push(parent);
          }
        }
      }
    }
    return allParents;
  };

  return (
    <MessagesPageLayout
      userId={teacherId}
      queryKeyPrefix="teacher"
      pageDescription="Communicate with parents"
      recipientLabel="To (Parent)"
      recipientPlaceholder="Select a parent"
      recipientRoleLabel="Parent"
      getMessages={(id, tab) => teacherService.getMessages(id, tab)}
      getUnreadCount={(id) => teacherService.getUnreadCount(id)}
      getRecipients={getParents}
      getConversation={(id, otherId) => teacherService.getConversation(id, otherId)}
      sendMessage={(id, data) => teacherService.sendMessage(id, data)}
      markAsRead={(id, msgId) => teacherService.markAsRead(id, msgId)}
    />
  );
}

export default TeacherMessagesPage;
