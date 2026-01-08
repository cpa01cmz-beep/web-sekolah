import { useState } from 'react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { getAvatarUrl } from '@/constants/avatars';

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

export function AdminUserManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SchoolUser | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('student');
  const { data: users, isLoading, error } = useUsers();
  const createUserMutation = useCreateUser({
    onSuccess: () => {
      toast.success('User created successfully.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
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
    onSuccess: (_, userId) => {
      toast.success('User deleted successfully.');
      queryClient.setQueryData(['users'], (oldData: SchoolUser[] | undefined) => oldData?.filter(u => u.id !== userId) || []);
      setUserIdToDelete(null);
    },
    onError: (err) => toast.error(`Failed to delete user: ${err.message}`),
  });
  const handleSaveUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userData = {
      name: userName,
      email: userEmail,
      role: userRole,
      avatarUrl: getAvatarUrl(userEmail),
    };
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, ...userData });
    } else {
      createUserMutation.mutate(userData as Omit<SchoolUser, 'id'>);
    }
  };
  const handleDeleteUser = (userId: string) => {
    setUserIdToDelete(userId);
    deleteUserMutation.mutate();
  };
  return (
    <SlideUp className="space-y-6">
      <PageHeader 
        title="User Management" 
        description="Manage all user accounts in the system."
      >
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setEditingUser(null);
            setUserName('');
            setUserEmail('');
            setUserRole('student');
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingUser(null);
              setUserName('');
              setUserEmail('');
              setUserRole('student');
            }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
              <DialogDescription>
                {editingUser ? 'Update the details for this user.' : 'Fill in the details to create a new user.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveUser}>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="name" className="text-right pt-2">
                    Name <span className="text-destructive" aria-label="required">*</span>
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <Input id="name" name="name" value={userName} onChange={(e) => setUserName(e.target.value)} required aria-required="true" />
                    <p className="text-xs text-muted-foreground">Full name of the user</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="email" className="text-right pt-2">
                    Email <span className="text-destructive" aria-label="required">*</span>
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <Input id="email" name="email" type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} required aria-required="true" placeholder="user@example.com" />
                    <p className="text-xs text-muted-foreground">Valid email address for account access</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="role" className="text-right pt-2">
                    Role <span className="text-destructive" aria-label="required">*</span>
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <Select name="role" value={userRole} onValueChange={(value: UserRole) => setUserRole(value)} required aria-required="true">
                      <SelectTrigger className="col-span-3"><SelectValue placeholder="Select a role" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">User role determines system access and permissions</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <Button type="submit" disabled={createUserMutation.isPending || updateUserMutation.isPending}>
                  {createUserMutation.isPending || updateUserMutation.isPending ? 'Saving...' : 'Save changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>
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
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={`text-white ${roleConfig[user.role].color} flex items-center gap-1.5 px-2.5 py-1`}>
                          <span aria-hidden="true">{React.createElement(RoleIcon[user.role], { className: "h-3 w-3" })}</span>
                          <span>{roleConfig[user.role].label}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" onClick={() => { setEditingUser(user); setUserName(user.name); setUserEmail(user.email); setUserRole(user.role); setIsModalOpen(true); }} aria-label={`Edit user ${user.name}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteUser(user.id)} aria-label={`Delete user ${user.name}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
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