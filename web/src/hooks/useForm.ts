import { useState, useCallback } from 'react';
import { validateForm, ValidationSchema } from '@/utils/validation';

export interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: ValidationSchema;
  onSubmit?: (values: T) => Promise<void> | void;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as string]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleBlur = useCallback((name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate single field on blur if schema exists
    if (validationSchema && validationSchema[name as string]) {
      const fieldValidators = validationSchema[name as string];
      const value = values[name] as string;
      
      for (const validator of fieldValidators) {
        const result = validator(value);
        if (!result.isValid) {
          setErrors(prev => ({ ...prev, [name]: result.error! }));
          break;
        }
      }
    }
  }, [validationSchema, values]);

  const validate = useCallback(() => {
    if (!validationSchema) return { isValid: true, errors: {} };
    
    const stringValues = Object.keys(values).reduce((acc, key) => {
      acc[key] = String(values[key] || '');
      return acc;
    }, {} as Record<string, string>);
    
    return validateForm(stringValues, validationSchema);
  }, [values, validationSchema]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    setIsSubmitting(true);
    
    const validation = validate();
    setErrors(validation.errors);
    
    if (!validation.isValid) {
      setIsSubmitting(false);
      return;
    }
    
    try {
      await onSubmit?.(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const isValid = Object.keys(errors).length === 0;
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldError,
    clearErrors,
    validate
  };
}
