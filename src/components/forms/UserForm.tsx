import { useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { UserRole, SchoolUser } from '@shared/types';
import { validateName, validateEmail, validateRole } from '@/utils/validation';

interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
}

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  editingUser: SchoolUser | null;
  onSave: (data: UserFormData) => void;
  isLoading: boolean;
}

export function UserForm({ open, onClose, editingUser, onSave, isLoading }: UserFormProps) {
  const [userName, setUserName] = useState<string>(() => editingUser?.name || '');
  const [userEmail, setUserEmail] = useState<string>(() => editingUser?.email || '');
  const [userRole, setUserRole] = useState<UserRole>(() => editingUser?.role || 'student');
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      setUserName('');
      setUserEmail('');
      setUserRole('student');
      setShowValidationErrors(false);
      onClose();
    } else if (editingUser) {
      setUserName(editingUser.name);
      setUserEmail(editingUser.email);
      setUserRole(editingUser.role);
      setShowValidationErrors(false);
    }
  }, [editingUser, onClose]);

  const nameError = useMemo(() => validateName(userName, showValidationErrors), [userName, showValidationErrors]);
  const emailError = useMemo(() => validateEmail(userEmail, showValidationErrors), [userEmail, showValidationErrors]);
  const roleError = useMemo(() => validateRole(userRole, showValidationErrors), [userRole, showValidationErrors]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowValidationErrors(true);

    if (nameError || emailError || roleError) {
      return;
    }

    const userData: UserFormData = {
      name: userName.trim(),
      email: userEmail.trim(),
      role: userRole,
    };
    onSave(userData);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {editingUser ? 'Update details for this user.' : 'Fill in the details to create a new user.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-start gap-4">
              <FormField
                id="name"
                label="Name"
                error={nameError}
                helperText="Full name of user"
                required
                className="col-span-3"
              >
                <Input
                  name="name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </FormField>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <FormField
                id="email"
                label="Email"
                error={emailError}
                helperText="Valid email address for account access"
                required
                className="col-span-3"
              >
                <Input
                  name="email"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                  placeholder="user@example.com"
                />
              </FormField>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <FormField
                id="role"
                label="Role"
                error={roleError}
                helperText="User role determines system access and permissions"
                required
                className="col-span-3"
              >
                <Select
                  name="role"
                  value={userRole}
                  onValueChange={(value: UserRole) => setUserRole(value)}
                  required
                >
                  <SelectTrigger className="col-span-3" aria-labelledby="role-label"><SelectValue placeholder="Select a role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
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
