import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { UserRole, SchoolUser } from '@shared/types';
import { getAvatarUrl } from '@/constants/avatars';

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  editingUser: SchoolUser | null;
  onSave: (data: Omit<SchoolUser, 'id'>) => void;
  isLoading: boolean;
}

export function UserForm({ open, onClose, editingUser, onSave, isLoading }: UserFormProps) {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('student');

  useEffect(() => {
    if (editingUser) {
      setUserName(editingUser.name);
      setUserEmail(editingUser.email);
      setUserRole(editingUser.role);
    } else {
      setUserName('');
      setUserEmail('');
      setUserRole('student');
    }
  }, [editingUser]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userData = {
      name: userName,
      email: userEmail,
      role: userRole,
      avatarUrl: getAvatarUrl(userEmail),
    };
    onSave(userData);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {editingUser ? 'Update the details for this user.' : 'Fill in the details to create a new user.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="name" className="text-right pt-2">
                Name <span className="text-destructive" aria-label="required">*</span>
              </Label>
              <div className="col-span-3 space-y-2">
                <Input 
                  id="name" 
                  name="name" 
                  value={userName} 
                  onChange={(e) => setUserName(e.target.value)} 
                  required 
                  aria-required="true" 
                />
                <p className="text-xs text-muted-foreground">Full name of the user</p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="email" className="text-right pt-2">
                Email <span className="text-destructive" aria-label="required">*</span>
              </Label>
              <div className="col-span-3 space-y-2">
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={userEmail} 
                  onChange={(e) => setUserEmail(e.target.value)} 
                  required 
                  aria-required="true" 
                  placeholder="user@example.com" 
                />
                <p className="text-xs text-muted-foreground">Valid email address for account access</p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="role" className="text-right pt-2">
                Role <span className="text-destructive" aria-label="required">*</span>
              </Label>
              <div className="col-span-3 space-y-2">
                <Select 
                  name="role" 
                  value={userRole} 
                  onValueChange={(value: UserRole) => setUserRole(value)} 
                  required 
                  aria-required="true"
                >
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
            <Button type="submit" disabled={isLoading} aria-busy={isLoading}>
              {isLoading ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
