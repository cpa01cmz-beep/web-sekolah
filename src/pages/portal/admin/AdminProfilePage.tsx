import { useAuthStore } from '@/lib/authStore';
import { motion } from 'framer-motion';
import { ProfilePage } from '@/components/ProfilePage';

export function AdminProfilePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <ProfilePage 
        userRole="admin"
        initialName={user?.name || ''}
        initialEmail={user?.email || ''}
      />
    </motion.div>
  );
}