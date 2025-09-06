import { VALIDATION_RULES } from '@/constants';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

// Individual field validators
export const validators = {
  required: (value: string): ValidationResult => {
    const isValid = Boolean(value && value.trim().length > 0);
    return {
      isValid,
      error: isValid ? undefined : VALIDATION_RULES.REQUIRED_FIELD
    };
  },

  email: (value: string): ValidationResult => {
    if (!value) {
      return { isValid: false, error: VALIDATION_RULES.REQUIRED_FIELD };
    }
    
    const isValid = VALIDATION_RULES.EMAIL.PATTERN.test(value);
    return {
      isValid,
      error: isValid ? undefined : VALIDATION_RULES.EMAIL.MESSAGE
    };
  },

  password: (value: string): ValidationResult => {
    if (!value) {
      return { isValid: false, error: VALIDATION_RULES.REQUIRED_FIELD };
    }
    
    const minLengthValid = value.length >= VALIDATION_RULES.PASSWORD.MIN_LENGTH;
    if (!minLengthValid) {
      return {
        isValid: false,
        error: `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters long`
      };
    }

    // Check password strength
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumbers = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    const strengthChecks = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar];
    const passedChecks = strengthChecks.filter(Boolean).length;

    let warning: string | undefined;
    if (passedChecks < 3) {
      warning = 'Password could be stronger. Consider adding uppercase, lowercase, numbers, and special characters.';
    }

    return {
      isValid: true,
      warning
    };
  },

  confirmPassword: (password: string, confirmPassword: string): ValidationResult => {
    if (!confirmPassword) {
      return { isValid: false, error: VALIDATION_RULES.REQUIRED_FIELD };
    }
    
    const isValid = password === confirmPassword;
    return {
      isValid,
      error: isValid ? undefined : 'Passwords do not match'
    };
  },

  phone: (value: string): ValidationResult => {
    if (!value) return { isValid: true }; // Optional field
    
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const isValid = phoneRegex.test(value.replace(/\s/g, ''));
    
    return {
      isValid,
      error: isValid ? undefined : 'Please enter a valid phone number'
    };
  },

  name: (value: string): ValidationResult => {
    if (!value) {
      return { isValid: false, error: VALIDATION_RULES.REQUIRED_FIELD };
    }
    
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      return { isValid: false, error: 'Name must be at least 2 characters long' };
    }
    
    if (trimmed.length > 50) {
      return { isValid: false, error: 'Name must be less than 50 characters' };
    }
    
    return { isValid: true };
  },

  // Advanced validators
  url: (value: string): ValidationResult => {
    if (!value) return { isValid: true }; // Optional field
    
    try {
      new URL(value);
      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Please enter a valid URL' };
    }
  },

  dateOfBirth: (value: string): ValidationResult => {
    if (!value) return { isValid: true }; // Optional field
    
    const date = new Date(value);
    const now = new Date();
    const age = now.getFullYear() - date.getFullYear();
    
    if (isNaN(date.getTime())) {
      return { isValid: false, error: 'Please enter a valid date' };
    }
    
    if (age < 13) {
      return { isValid: false, error: 'Must be at least 13 years old' };
    }
    
    if (age > 120) {
      return { isValid: false, error: 'Please enter a valid birth date' };
    }
    
    return { isValid: true };
  },

  minLength: (minLength: number) => (value: string): ValidationResult => {
    if (!value) {
      return { isValid: false, error: VALIDATION_RULES.REQUIRED_FIELD };
    }
    const isValid = value.length >= minLength;
    return {
      isValid,
      error: isValid ? undefined : `Must be at least ${minLength} characters long`
    };
  },

  maxLength: (maxLength: number) => (value: string): ValidationResult => {
    const isValid = !value || value.length <= maxLength;
    return {
      isValid,
      error: isValid ? undefined : `Must be no more than ${maxLength} characters long`
    };
  },

  numeric: (value: string): ValidationResult => {
    if (!value) {
      return { isValid: false, error: VALIDATION_RULES.REQUIRED_FIELD };
    }
    const isValid = !isNaN(Number(value)) && isFinite(Number(value));
    return {
      isValid,
      error: isValid ? undefined : 'Must be a valid number'
    };
  },

  positiveNumber: (value: string): ValidationResult => {
    const numericResult = validators.numeric(value);
    if (!numericResult.isValid) return numericResult;
    
    const isValid = Number(value) > 0;
    return {
      isValid,
      error: isValid ? undefined : 'Must be a positive number'
    };
  }
};

// Form validation schemas
export interface ValidationSchema {
  [key: string]: Array<(value: string) => ValidationResult>;
}

export const validationSchemas = {
  login: {
    email: [validators.required, validators.email],
    password: [validators.required]
  },
  register: {
    firstName: [validators.required, validators.name],
    lastName: [validators.required, validators.name],
    email: [validators.required, validators.email],
    password: [validators.required, validators.password],
    phone: [validators.phone]
  },
  profile: {
    firstName: [validators.required, validators.name],
    lastName: [validators.required, validators.name],
    email: [validators.required, validators.email],
    phone: [validators.phone],
    dateOfBirth: [validators.dateOfBirth]
  }
};

// Enhanced form validation function
export const validateForm = (
  values: Record<string, string>,
  schema: ValidationSchema
): FormValidationResult => {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};
  
  for (const [field, fieldValidators] of Object.entries(schema)) {
    const value = values[field] || '';
    
    for (const validator of fieldValidators) {
      const result = validator(value);
      
      if (!result.isValid && result.error) {
        errors[field] = result.error;
        break; // Stop at first error
      }
      
      if (result.warning) {
        warnings[field] = result.warning;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
};

// Real-time validation helpers
export const validateField = (
  value: string,
  validators: Array<(value: string) => ValidationResult>
): ValidationResult => {
  for (const validator of validators) {
    const result = validator(value);
    if (!result.isValid) {
      return result;
    }
  }
  return { isValid: true };
};

// Debounced validation for real-time feedback
export const createDebouncedValidator = (
  validator: (value: string) => ValidationResult,
  delay: number = 300
) => {
  let timeoutId: NodeJS.Timeout;
  
  return (value: string, callback: (result: ValidationResult) => void) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const result = validator(value);
      callback(result);
    }, delay);
  };
};
