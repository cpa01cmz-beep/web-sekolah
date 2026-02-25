import { Input } from '@/components/ui/input'
import { FormField, type FormFieldProps } from '@/components/ui/form-field'

export interface FormFieldInputProps extends Omit<FormFieldProps, 'children'> {
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'date'
  placeholder?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  autoComplete?: string
}

export function FormFieldInput({
  id,
  label,
  error,
  helperText,
  required,
  showErrorIcon = true,
  className,
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  autoComplete,
}: FormFieldInputProps) {
  return (
    <FormField
      id={id}
      label={label}
      error={error}
      helperText={helperText}
      required={required}
      showErrorIcon={showErrorIcon}
      className={className}
    >
      <Input
        type={type}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        aria-busy={disabled}
        autoComplete={autoComplete}
      />
    </FormField>
  )
}
