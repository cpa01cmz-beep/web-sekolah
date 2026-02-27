import { useMemo, useState, useCallback } from 'react'

export type Validator<T> = (value: T, showErrors: boolean) => string | undefined

export interface FormValidationConfig<T extends Record<string, any>> {
  validators: { [K in keyof T]?: Validator<T[K]> }
}

export interface FormValidationResult<T extends Record<string, any>> {
  errors: { [K in keyof T]?: string }
  validateAll: () => boolean
  reset: () => void
  hasErrors: boolean
}

export function useFormValidation<T extends Record<string, any>>(
  formData: T,
  config: FormValidationConfig<T>
): FormValidationResult<T> {
  const [showValidationErrors, setShowValidationErrors] = useState(false)

  const errors = useMemo(() => {
    const result = {} as { [K in keyof T]?: string }

    for (const [key, validator] of Object.entries(config.validators)) {
      if (validator) {
        const error = validator(formData[key as keyof T], showValidationErrors)
        if (error) {
          result[key as keyof T] = error
        }
      }
    }

    return result
  }, [formData, showValidationErrors, config.validators])

  const validateAll = useCallback(() => {
    setShowValidationErrors(true)
    return Object.values(errors).every(error => !error)
  }, [errors])

  const reset = useCallback(() => {
    setShowValidationErrors(false)
  }, [])

  const hasErrors = useMemo(() => {
    return Object.values(errors).some(error => Boolean(error))
  }, [errors])

  return {
    errors,
    validateAll,
    reset,
    hasErrors,
  }
}
