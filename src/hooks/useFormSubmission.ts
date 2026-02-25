import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export interface UseFormSubmissionOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  successMessage?: string
  errorMessage?: string
}

export interface UseFormSubmissionReturn {
  isSubmitting: boolean
  error: Error | null
  submit: (data: T) => Promise<void>
  reset: () => void
}

export function useFormSubmission<T>(
  options: UseFormSubmissionOptions<T> = {}
): UseFormSubmissionReturn {
  const {
    onSuccess,
    onError,
    successMessage = 'Submission successful',
    errorMessage = 'Submission failed. Please try again.',
  } = options

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const submit = useCallback(
    async (data: T) => {
      setIsSubmitting(true)
      setError(null)

      try {
        await onSuccess?.(data)
        toast.success(successMessage)
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        toast.error(errorMessage)
        onError?.(error)
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSuccess, onError, successMessage, errorMessage]
  )

  const reset = useCallback(() => {
    setIsSubmitting(false)
    setError(null)
  }, [])

  return {
    isSubmitting,
    error,
    submit,
    reset,
  }
}
