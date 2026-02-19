import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useAdminDashboard } from '@/hooks/useAdmin';
import { AdminDashboardContent } from './AdminDashboardContent';
import type { AdminDashboardData } from '@shared/types';

export function AdminDashboardPage() {
  const prefersReducedMotion = useReducedMotion();
  const { data, isLoading, error } = useAdminDashboard();

  return (
    <DashboardLayout<AdminDashboardData> isLoading={isLoading} error={error} data={data}>
      {(data) => <AdminDashboardContent data={data} prefersReducedMotion={prefersReducedMotion} />}
    </DashboardLayout>
  );
}
