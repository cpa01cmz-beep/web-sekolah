import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/ui/form-field'
import { FormSuccess } from '@/components/ui/form-success'
import { useState, memo, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { validateName, validateEmail, validateMessage } from '@/utils/validation'
import { logger } from '@/lib/logger'
import { useFormValidation } from '@/hooks/useFormValidation'

interface ContactFormProps {
  onSubmit?: (data: { name: string; email: string; message: string }) => Promise<void> | void
}

export const ContactForm = memo(function ContactForm({ onSubmit }: ContactFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formData = { name, email, message }
  const {
    errors,
    validateAll,
    reset: resetValidation,
  } = useFormValidation(formData, {
    validators: {
      name: validateName,
      email: validateEmail,
      message: validateMessage,
    },
  })

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!validateAll()) {
        return
      }
      setIsSubmitting(true)
      setError(null)
      try {
        await onSubmit?.({ name, email, message })
        setIsSuccess(true)
        setName('')
        setEmail('')
        setMessage('')
        resetValidation()
      } catch (err) {
        logger.error('Contact form submission failed', err)
        const message =
          err instanceof Error ? err.message : 'Failed to send message. Please try again.'
        setError(message)
        toast.error(message)
      } finally {
        setIsSubmitting(false)
      }
    },
    [validateAll, onSubmit, name, email, message, resetValidation]
  )

  const handleReset = useCallback(() => {
    setIsSuccess(false)
    setError(null)
    resetValidation()
  }, [resetValidation])

  const successAction = useMemo(
    () => ({
      label: 'Send Another Message',
      onClick: handleReset,
    }),
    [handleReset]
  )

  if (isSuccess) {
    return (
      <FormSuccess
        title="Message Sent Successfully!"
        description="Thank you for reaching out. We'll get back to you as soon as possible."
        action={successAction}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md" role="alert">
          {error}
        </div>
      )}
      <FormField
        id="contact-name"
        label="Full Name"
        error={errors.name}
        helperText="Enter your full name"
        required
      >
        <Input
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          autoComplete="name"
        />
      </FormField>
      <FormField
        id="contact-email"
        label="Email"
        error={errors.email}
        helperText="We'll never share your email with anyone else"
        required
      >
        <Input
          type="email"
          placeholder="john.doe@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          autoComplete="email"
        />
      </FormField>
      <FormField
        id="contact-message"
        label="Message"
        error={errors.message}
        helperText="How can we help you? Provide as much detail as possible"
        required
      >
        <Textarea
          placeholder="Your message..."
          rows={5}
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        />
      </FormField>
      <Button type="submit" className="w-full" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  )
})
ContactForm.displayName = 'ContactForm'
