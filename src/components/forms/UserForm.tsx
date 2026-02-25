import { useState, useCallback, memo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { UserRole, SchoolUser } from '@shared/types'
import { validateName, validateEmail, validateRole } from '@/utils/validation'
import { useFormValidation } from '@/hooks/useFormValidation'

interface UserFormData {
  name: string
  email: string
  role: UserRole
}

interface UserFormProps {
  open: boolean
  onClose: () => void
  editingUser: SchoolUser | null
  onSave: (data: UserFormData) => void
  isLoading: boolean
}

export const UserForm = memo(function UserForm({
  open,
  onClose,
  editingUser,
  onSave,
  isLoading,
}: UserFormProps) {
  const [userName, setUserName] = useState<string>(() => editingUser?.name || '')
  const [userEmail, setUserEmail] = useState<string>(() => editingUser?.email || '')
  const [userRole, setUserRole] = useState<UserRole>(() => editingUser?.role || 'student')

  const formData = { name: userName, email: userEmail, role: userRole }
  const {
    errors,
    validateAll,
    reset: resetValidation,
  } = useFormValidation(formData, {
    validators: {
      name: validateName,
      email: validateEmail,
      role: validateRole,
    },
  })

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        setUserName('')
        setUserEmail('')
        setUserRole('student')
        resetValidation()
        onClose()
      } else if (editingUser) {
        setUserName(editingUser.name)
        setUserEmail(editingUser.email)
        setUserRole(editingUser.role)
        resetValidation()
      }
    },
    [editingUser, onClose, resetValidation]
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!validateAll()) {
        return
      }

      const userData: UserFormData = {
        name: userName.trim(),
        email: userEmail.trim(),
        role: userRole,
      }
      onSave(userData)
    },
    [validateAll, userName, userEmail, userRole, onSave]
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {editingUser
              ? 'Update details for this user.'
              : 'Fill in the details to create a new user.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-start gap-4">
              <FormField
                id="name"
                label="Name"
                error={errors.name}
                helperText="Full name of user"
                required
                className="col-span-3"
              >
                <Input
                  name="name"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </FormField>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <FormField
                id="email"
                label="Email"
                error={errors.email}
                helperText="Valid email address for account access"
                required
                className="col-span-3"
              >
                <Input
                  name="email"
                  type="email"
                  value={userEmail}
                  onChange={e => setUserEmail(e.target.value)}
                  required
                  placeholder="user@example.com"
                  autoComplete="email"
                />
              </FormField>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <FormField
                id="role"
                label="Role"
                error={errors.role}
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
                  <SelectTrigger className="col-span-3" aria-labelledby="role-label">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
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
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading} aria-busy={isLoading}>
              {isLoading ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
})
UserForm.displayName = 'UserForm'
