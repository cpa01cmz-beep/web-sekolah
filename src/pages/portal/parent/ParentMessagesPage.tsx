import { useAuthStore } from '@/lib/authStore';
import { parentService } from '@/services/parentService';
import { MessagesPageLayout } from '@/components/messages';

export function ParentMessagesPage() {
  const user = useAuthStore((state) => state.user);
  const parentId = user?.id || '';

  return (
    <MessagesPageLayout
      userId={parentId}
      queryKeyPrefix="parent"
      pageDescription="Communicate with your child's teachers"
      recipientLabel="To (Teacher)"
      recipientPlaceholder="Select a teacher"
      recipientRoleLabel="Teacher"
      getMessages={(id, tab) => parentService.getMessages(id, tab)}
      getUnreadCount={(id) => parentService.getUnreadCount(id)}
      getRecipients={(id) => parentService.getChildTeachers(id)}
      getConversation={(id, otherId) => parentService.getConversation(id, otherId)}
      sendMessage={(id, data) => parentService.sendMessage(id, data)}
      markAsRead={(id, msgId) => parentService.markAsRead(id, msgId)}
    />
  );
}

export default ParentMessagesPage;
