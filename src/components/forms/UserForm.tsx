import { useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { UserRole, SchoolUser } from '@shared/types';
import { AlertCircle } from 'lucide-react';
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
                  aria-invalid={!!nameError}
                  aria-describedby={nameError ? 'name-error' : 'name-helper'}
                />
                <p id="name-helper" className="text-xs text-muted-foreground">Full name of user</p>
                {nameError && (
                  <p id="name-error" className="text-xs text-destructive flex items-center gap-1" role="alert" aria-live="polite">
                    <AlertCircle className="h-3 w-3" aria-hidden="true" />
                    {nameError}
                  </p>
                )}
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
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? 'email-error' : 'email-helper'}
                  placeholder="user@example.com"
                />
                <p id="email-helper" className="text-xs text-muted-foreground">Valid email address for account access</p>
                {emailError && (
                  <p id="email-error" className="text-xs text-destructive flex items-center gap-1" role="alert" aria-live="polite">
                    <AlertCircle className="h-3 w-3" aria-hidden="true" />
                    {emailError}
                  </p>
                )}
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
                  aria-invalid={!!roleError}
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
