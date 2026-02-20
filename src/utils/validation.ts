import { ValidationLimits } from '../../shared/constants';

export const MIN_SCORE = ValidationLimits.GRADE_MIN_SCORE;

export const MAX_SCORE = ValidationLimits.GRADE_MAX_SCORE;

export function isValidScore(score: number | null | undefined): score is number {
  if (score === null || score === undefined) return false;
  return !isNaN(score) && Number.isInteger(score) && score >= MIN_SCORE && score <= MAX_SCORE;
}

export interface ValidationError {
  field: string;
  message?: string;
}

export interface ValidationRule<T = unknown> {
  validate: (value: T) => boolean;
  message: string;
}

export interface ValidationOptions {
  showErrors: boolean;
}

export function validateField<T>(
  value: T,
  rules: ValidationRule<T>[],
  options: ValidationOptions
): string | undefined {
  for (const rule of rules) {
    if (!rule.validate(value)) {
      return options.showErrors ? rule.message : undefined;
    }
  }
  return undefined;
}

export const validationRules = {
  name: {
    required: {
      validate: (value: string) => value.trim().length > 0,
      message: 'Name is required',
    },
    minLength: (min: number) => ({
      validate: (value: string) => value.trim().length >= min,
      message: `Name must be at least ${min} characters`,
    }),
  },
  email: {
    required: {
      validate: (value: string) => value.trim().length > 0,
      message: 'Email is required',
    },
    format: {
      validate: (value: string) => /^\S+@\S+\.\S+$/.test(value),
      message: 'Please enter a valid email address',
    },
  },
  phone: {
    required: {
      validate: (value: string) => value.trim().length > 0,
      message: 'Phone number is required',
    },
    numeric: {
      validate: (value: string) => /^\d+$/.test(value),
      message: 'Phone number must be digits only',
    },
    length: (min: number, max: number) => ({
      validate: (value: string) => value.length >= min && value.length <= max,
      message: `Phone number must be ${min}-${max} digits`,
    }),
  },
  nisn: {
    required: {
      validate: (value: string) => value.trim().length > 0,
      message: 'NISN is required',
    },
    numeric: {
      validate: (value: string) => /^\d+$/.test(value),
      message: 'NISN must be digits only',
    },
    exactLength: (length: number) => ({
      validate: (value: string) => value.length === length,
      message: `NISN must be exactly ${length} digits`,
    }),
  },
  password: {
    required: {
      validate: (value: string) => value.trim().length > 0,
      message: 'Password is required',
    },
    minLength: (min: number) => ({
      validate: (value: string) => value.length >= min,
      message: `Password must be at least ${min} characters`,
    }),
  },
  message: {
    required: {
      validate: (value: string) => value.trim().length > 0,
      message: 'Message is required',
    },
    minLength: (min: number) => ({
      validate: (value: string) => value.trim().length >= min,
      message: `Message must be at least ${min} characters`,
    }),
  },
  role: {
    required: {
      validate: (value: string) => Boolean(value && value.length > 0),
      message: 'Role is required',
    },
  },
  title: {
    required: {
      validate: (value: string) => value.trim().length > 0,
      message: 'Title is required',
    },
    minLength: (min: number) => ({
      validate: (value: string) => value.trim().length >= min,
      message: `Title must be at least ${min} characters`,
    }),
  },
  content: {
    required: {
      validate: (value: string) => value.trim().length > 0,
      message: 'Content is required',
    },
    minLength: (min: number) => ({
      validate: (value: string) => value.trim().length >= min,
      message: `Content must be at least ${min} characters`,
    }),
  },
};

export function validateName(value: string, showErrors: boolean, minLength: number = ValidationLimits.USER_NAME_MIN_LENGTH): string | undefined {
  return validateField(value, [
    validationRules.name.required,
    validationRules.name.minLength(minLength),
  ], { showErrors });
}

export function validateEmail(value: string, showErrors: boolean): string | undefined {
  return validateField(value, [
    validationRules.email.required,
    validationRules.email.format,
  ], { showErrors });
}

export function validatePhone(value: string, showErrors: boolean, min: number = ValidationLimits.PHONE_MIN_LENGTH, max: number = ValidationLimits.PHONE_MAX_LENGTH): string | undefined {
  return validateField(value, [
    validationRules.phone.required,
    validationRules.phone.numeric,
    validationRules.phone.length(min, max),
  ], { showErrors });
}

export function validateNisn(value: string, showErrors: boolean, length: number = ValidationLimits.NISN_LENGTH): string | undefined {
  return validateField(value, [
    validationRules.nisn.required,
    validationRules.nisn.numeric,
    validationRules.nisn.exactLength(length),
  ], { showErrors });
}

export function validateMessage(value: string, showErrors: boolean, minLength: number = ValidationLimits.ANNOUNCEMENT_CONTENT_MIN_LENGTH): string | undefined {
  return validateField(value, [
    validationRules.message.required,
    validationRules.message.minLength(minLength),
  ], { showErrors });
}

export function validateRole(value: string, showErrors: boolean): string | undefined {
  return validateField(value, [
    validationRules.role.required,
  ], { showErrors });
}

export function validateTitle(value: string, showErrors: boolean, minLength: number = ValidationLimits.ANNOUNCEMENT_TITLE_MIN_LENGTH): string | undefined {
  return validateField(value, [
    validationRules.title.required,
    validationRules.title.minLength(minLength),
  ], { showErrors });
}

export function validateContent(value: string, showErrors: boolean, minLength: number = ValidationLimits.ANNOUNCEMENT_CONTENT_MIN_LENGTH): string | undefined {
  return validateField(value, [
    validationRules.content.required,
    validationRules.content.minLength(minLength),
  ], { showErrors });
}

export function validatePassword(value: string, showErrors: boolean, minLength: number = ValidationLimits.PASSWORD_MIN_LENGTH): string | undefined {
  return validateField(value, [
    validationRules.password.required,
    validationRules.password.minLength(minLength),
  ], { showErrors });
}

export function validateRequired(value: string, showErrors: boolean, fieldName: string = 'Field'): string | undefined {
  if (!showErrors) return undefined;
  return value.trim().length > 0 ? undefined : `${fieldName} is required`;
}
