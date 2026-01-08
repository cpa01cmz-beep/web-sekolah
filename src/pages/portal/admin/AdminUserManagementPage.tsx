import React, { useState, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { TableSkeleton } from '@/components/ui/loading-skeletons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserForm } from '@/components/forms/UserForm';

const RoleIcon: Record<UserRole, React.ComponentType<{ className?: string }>> = {
  student: GraduationCap,
  teacher: Users,
  parent: UserCog,
  admin: Shield,
};

const roleConfig: Record<UserRole, { color: string; label: string }> = {
  student: { color: 'bg-blue-500', label: 'Student' },
  teacher: { color: 'bg-green-500', label: 'Teacher' },
  parent: { color: 'bg-purple-500', label: 'Parent' },
  admin: { color: 'bg-red-500', label: 'Admin' },
};

const UserRow = memo(({ user, onEdit, onDelete }: { user: SchoolUser; onEdit: (user: SchoolUser) => void; onDelete: (userId: string) => void }) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{user.name}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell className="text-center">
        <Badge className={`text-white ${roleConfig[user.role].color} flex items-center gap-1.5 px-2.5 py-1`}>
          <span aria-hidden="true">{React.createElement(RoleIcon[user.role], { className: "h-3 w-3" })}</span>
          <span>{roleConfig[user.role].label}</span>
        </Badge>
      </TableCell>
      <TableCell className="text-right space-x-2">
        <Button variant="outline" size="icon" onClick={() => onEdit(user)} aria-label={`Edit user ${user.name}`}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="icon" onClick={() => onDelete(user.id)} aria-label={`Delete user ${user.name}`}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
});
UserRow.displayName = 'UserRow';

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
  const handleSaveUser = (data: Omit<SchoolUser, 'id'>) => {
    if (editingUser) {
      updateUserMutation.mutate(data);
    } else {
      createUserMutation.mutate(data);
    }
  };
  const handleDeleteUser = (userId: string) => {
    setUserIdToDelete(userId);
    deleteUserMutation.mutate();
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };
  return (
    <SlideUp className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage all user accounts in the system."
      >
        <DialogTrigger asChild>
          <Button onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}>
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
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map(user => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onEdit={(user) => {
                        setEditingUser(user);
                        setIsModalOpen(true);
                      }}
                      onDelete={handleDeleteUser}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </SlideUp>
  );
}