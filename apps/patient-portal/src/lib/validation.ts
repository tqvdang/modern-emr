export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class ValidationRule<T = any> {
  constructor(
    public field: string,
    public validator: (value: T, data?: any) => boolean,
    public message: string,
    public code?: string
  ) {}

  validate(value: T, data?: any): ValidationError | null {
    if (!this.validator(value, data)) {
      return {
        field: this.field,
        message: this.message,
        code: this.code
      };
    }
    return null;
  }
}

export class Validator {
  private rules: ValidationRule[] = [];

  static required(field: string, message?: string): ValidationRule {
    return new ValidationRule(
      field,
      (value) => {
        if (typeof value === 'string') return value.trim().length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return value !== null && value !== undefined && value !== '';
      },
      message || `${field} is required`,
      'REQUIRED'
    );
  }

  static email(field: string, message?: string): ValidationRule {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return new ValidationRule(
      field,
      (value: string) => !value || emailRegex.test(value.trim()),
      message || `${field} must be a valid email address`,
      'INVALID_EMAIL'
    );
  }

  static phone(field: string, message?: string): ValidationRule {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return new ValidationRule(
      field,
      (value: string) => !value || phoneRegex.test(value.replace(/[\s\-\(\)]/g, '')),
      message || `${field} must be a valid phone number`,
      'INVALID_PHONE'
    );
  }

  static minLength(field: string, min: number, message?: string): ValidationRule {
    return new ValidationRule(
      field,
      (value: string) => !value || value.trim().length >= min,
      message || `${field} must be at least ${min} characters long`,
      'MIN_LENGTH'
    );
  }

  static maxLength(field: string, max: number, message?: string): ValidationRule {
    return new ValidationRule(
      field,
      (value: string) => !value || value.trim().length <= max,
      message || `${field} must not exceed ${max} characters`,
      'MAX_LENGTH'
    );
  }

  static dateOfBirth(field: string, message?: string): ValidationRule {
    return new ValidationRule(
      field,
      (value: string) => {
        if (!value) return true;
        const date = new Date(value);
        const now = new Date();
        const age = now.getFullYear() - date.getFullYear();
        return date <= now && age <= 150;
      },
      message || `${field} must be a valid date of birth`,
      'INVALID_DOB'
    );
  }

  static oneOf(field: string, options: string[], message?: string): ValidationRule {
    return new ValidationRule(
      field,
      (value: string) => !value || options.includes(value),
      message || `${field} must be one of: ${options.join(', ')}`,
      'INVALID_OPTION'
    );
  }

  static custom(field: string, validator: (value: any, data?: any) => boolean, message: string, code?: string): ValidationRule {
    return new ValidationRule(field, validator, message, code);
  }

  addRule(rule: ValidationRule): this {
    this.rules.push(rule);
    return this;
  }

  validate(data: Record<string, any>): ValidationResult {
    const errors: ValidationError[] = [];

    for (const rule of this.rules) {
      const value = this.getNestedValue(data, rule.field);
      const error = rule.validate(value, data);
      if (error) {
        errors.push(error);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

// Common validation schemas
export const createPatientValidator = () => {
  return new Validator()
    .addRule(Validator.required('firstName', 'First name is required'))
    .addRule(Validator.required('lastName', 'Last name is required'))
    .addRule(Validator.minLength('firstName', 2))
    .addRule(Validator.maxLength('firstName', 50))
    .addRule(Validator.minLength('lastName', 2))
    .addRule(Validator.maxLength('lastName', 50))
    .addRule(Validator.maxLength('middleName', 50))
    .addRule(Validator.email('email'))
    .addRule(Validator.phone('phoneHome'))
    .addRule(Validator.phone('phoneMobile'))
    .addRule(Validator.dateOfBirth('dateOfBirth'))
    .addRule(Validator.oneOf('gender', ['Male', 'Female', 'Other', 'Unknown']))
    .addRule(Validator.maxLength('address', 200))
    .addRule(Validator.maxLength('city', 100))
    .addRule(Validator.maxLength('state', 50))
    .addRule(Validator.maxLength('zipCode', 20))
    .addRule(Validator.maxLength('country', 100))
    .addRule(Validator.custom('email', (email, data) => {
      // At least one contact method required
      return !!(email || data.phoneHome || data.phoneMobile);
    }, 'At least one contact method (email or phone) is required', 'CONTACT_REQUIRED'));
};

export const createAppointmentValidator = () => {
  return new Validator()
    .addRule(Validator.required('patientId', 'Patient is required'))
    .addRule(Validator.required('providerId', 'Provider is required'))
    .addRule(Validator.required('startDateTime', 'Start date/time is required'))
    .addRule(Validator.required('endDateTime', 'End date/time is required'))
    .addRule(Validator.required('appointmentType', 'Appointment type is required'))
    .addRule(Validator.oneOf('priority', ['Low', 'Normal', 'High', 'Urgent']))
    .addRule(Validator.maxLength('description', 1000))
    .addRule(Validator.custom('endDateTime', (endDateTime, data) => {
      if (!endDateTime || !data.startDateTime) return true;
      return new Date(endDateTime) > new Date(data.startDateTime);
    }, 'End time must be after start time', 'INVALID_TIME_RANGE'));
};

export const createUserValidator = () => {
  return new Validator()
    .addRule(Validator.required('email', 'Email is required'))
    .addRule(Validator.email('email'))
    .addRule(Validator.required('firstName', 'First name is required'))
    .addRule(Validator.required('lastName', 'Last name is required'))
    .addRule(Validator.minLength('firstName', 2))
    .addRule(Validator.maxLength('firstName', 50))
    .addRule(Validator.minLength('lastName', 2))
    .addRule(Validator.maxLength('lastName', 50))
    .addRule(Validator.oneOf('role', ['Administrator', 'Provider', 'Staff', 'Patient']))
    .addRule(Validator.minLength('password', 8, 'Password must be at least 8 characters'))
    .addRule(Validator.custom('password', (password) => {
      if (!password) return true; // Optional for updates
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      return hasUpper && hasLower && hasNumber && hasSymbol;
    }, 'Password must contain uppercase, lowercase, number, and special character', 'WEAK_PASSWORD'));
};