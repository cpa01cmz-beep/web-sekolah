import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, PlusCircle, AlertTriangle, GraduationCap, Users, UserCog, Shield } from 'lucide-react';
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
import { ROLE_COLORS } from '@/theme/colors';
import { ResponsiveTable } from '@/components/ui/responsive-table';

const RoleIcon: Record<UserRole, React.ComponentType<{ className?: string }>> = {
  student: GraduationCap,
  teacher: Users,
  parent: UserCog,
  admin: Shield,
};

export function AdminUserManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SchoolUser | null>(null);
  const { data: users, isLoading, error } = useUsers();
  const createUserMutation = useCreateUser({
    onSuccess: () => {
      toast.success('User created successfully.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      setEditingUser(null);
    },
    onError: (err) => toast.error(`Failed to create user: ${err.message}`),
  });
  const updateUserMutation = useUpdateUser(editingUser?.id || '', {
    onSuccess: () => {
      toast.success('User updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      setEditingUser(null);
    },
    onError: (err) => toast.error(`Failed to update user: ${err.message}`),
  });
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);
  const deleteUserMutation = useDeleteUser(userIdToDelete || '', {
    onSuccess: () => {
      toast.success('User deleted successfully.');
      queryClient.setQueryData(['users'], (oldData: SchoolUser[] | undefined) => oldData?.filter(u => u.id !== userIdToDelete) || []);
      setUserIdToDelete(null);
    },
    onError: (err) => toast.error(`Failed to delete user: ${err.message}`),
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
  
  const handleEditUser = useCallback((user: SchoolUser) => {
    setEditingUser(user);
    setIsModalOpen(true);
  }, []);
  
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
        content: (
          <Badge className={`text-white ${ROLE_COLORS[user.role].color} flex items-center gap-1.5 px-2.5 py-1`}>
            <span aria-hidden="true">{React.createElement(RoleIcon[user.role], { className: "h-3 w-3" })}</span>
            <span>{ROLE_COLORS[user.role].label}</span>
          </Badge>
        ),
        className: 'text-center',
      },
      {
        key: 'actions',
        content: (
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="icon" onClick={() => handleEditUser(user)} aria-label={`Edit user ${user.name}`}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={() => handleDeleteUser(user.id)} aria-label={`Delete user ${user.name}`}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
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
