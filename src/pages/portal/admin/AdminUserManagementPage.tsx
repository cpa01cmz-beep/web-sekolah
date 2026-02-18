import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SlideUp } from '@/components/animations';
import { toast } from 'sonner';
import { UserRole, SchoolUser } from '@shared/types';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useAdmin';
import { queryClient } from '@/lib/api-client';
import { getAvatarUrl } from '@/constants/avatars';
import { TableSkeleton } from '@/components/ui/loading-skeletons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserForm } from '@/components/forms/UserForm';
import { ResponsiveTable } from '@/components/ui/responsive-table';
import { UserActions } from '@/components/tables/UserActions';
import { UserRoleBadge } from '@/components/tables/UserRoleBadge';
import { MESSAGES } from '@/constants/messages';

export function AdminUserManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SchoolUser | null>(null);
  const { data: users, isLoading, error } = useUsers();
  const createUserMutation = useCreateUser({
    onSuccess: () => {
      toast.success(MESSAGES.USER.CREATED);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      setEditingUser(null);
    },
    onError: (err) => toast.error(MESSAGES.USER.CREATE_FAILED(err.message)),
  });
  const updateUserMutation = useUpdateUser(editingUser?.id || '', {
    onSuccess: () => {
      toast.success(MESSAGES.USER.UPDATED);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      setEditingUser(null);
    },
    onError: (err) => toast.error(MESSAGES.USER.UPDATE_FAILED(err.message)),
  });
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);
  const deleteUserMutation = useDeleteUser(userIdToDelete || '', {
    onSuccess: () => {
      toast.success(MESSAGES.USER.DELETED);
      queryClient.setQueryData(['users'], (oldData: SchoolUser[] | undefined) => oldData?.filter(u => u.id !== userIdToDelete) || []);
      setUserIdToDelete(null);
    },
    onError: (err) => toast.error(MESSAGES.USER.DELETE_FAILED(err.message)),
  });
  const handleSaveUser = useCallback((data: { name: string; email: string; role: UserRole }) => {
    const userData = {
      ...data,
      avatarUrl: getAvatarUrl(data.email),
    };
    if (editingUser) {
      updateUserMutation.mutate(userData);
    } else {
      createUserMutation.mutate(userData);
    }
  }, [editingUser, updateUserMutation, createUserMutation]);
  
  const handleDeleteUser = useCallback((userId: string) => {
    setUserIdToDelete(userId);
    deleteUserMutation.mutate();
  }, [deleteUserMutation]);
  
  const handleEditUser = useCallback((userId: string, userName: string) => {
    const user = users?.find(u => u.id === userId && u.name === userName);
    if (user) {
      setEditingUser(user);
      setIsModalOpen(true);
    }
  }, [users]);
  
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingUser(null);
  }, []);

  const handleAddUser = useCallback(() => {
    setEditingUser(null);
    setIsModalOpen(true);
  }, []);

  const tableHeaders = useMemo(() => [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', className: 'text-center' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ], []);

  const tableRows = useMemo(() => (users || []).map(user => ({
    id: user.id,
    cells: [
      { key: 'name', content: user.name, className: 'font-medium' },
      { key: 'email', content: user.email },
      {
        key: 'role',
        content: <UserRoleBadge role={user.role} />,
        className: 'text-center',
      },
      {
        key: 'actions',
        content: <UserActions userId={user.id} userName={user.name} onEdit={handleEditUser} onDelete={handleDeleteUser} />,
        className: 'text-right',
      },
    ],
  })), [users, handleEditUser, handleDeleteUser]);

  return (
    <SlideUp className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage all user accounts in the system."
      >
        <DialogTrigger asChild>
          <Button onClick={handleAddUser}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add User
          </Button>
        </DialogTrigger>
      </PageHeader>
      <UserForm
        open={isModalOpen}
        onClose={handleCloseModal}
        editingUser={editingUser}
        onSave={handleSaveUser}
        isLoading={createUserMutation.isPending || updateUserMutation.isPending}
      />
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <TableSkeleton columns={4} rows={5} />
          ) : error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Failed to load users.</AlertDescription>
            </Alert>
          ) : users && users.length > 0 ? (
            <ResponsiveTable headers={tableHeaders} rows={tableRows} />
          ) : (
            <p className="text-muted-foreground text-center py-8">No users found.</p>
          )}
        </CardContent>
      </Card>
    </SlideUp>
  );
}
