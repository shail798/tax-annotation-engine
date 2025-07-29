import { FormTemplate, FormAnnotation, FilledField } from './storage';

export interface TaxpayerData {
  taxpayer: {
    firstName: string;
    lastName: string;
    ssn: string;
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  spouse?: {
    firstName?: string;
    lastName?: string;
    ssn?: string;
  };
  income: {
    wages?: number;
    interest?: number;
    dividends?: number;
  };
  dependents?: Array<{
    firstName: string;
    lastName: string;
    ssn: string;
    relationship: string;
  }>;
}

export interface ValidationError {
  field_id: string;
  error: string;
  data_path: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Resolve nested data paths like "taxpayer.address.street" or "dependents[0].firstName"
 */
export const getValueByPath = (data: any, path: string): any => {
  if (!data || !path) return undefined;

  return path.split('.').reduce((obj, key) => {
    if (!obj) return undefined;

    // Handle array notation like "dependents[0].firstName"
    const arrayMatch = key.match(/(\w+)\[(\d+)\]/);
    if (arrayMatch) {
      const [, arrayName, index] = arrayMatch;
      return obj[arrayName!]?.[parseInt(index!, 10)];
    }
    
    return obj[key];
  }, data);
};

/**
 * Apply formatting rules to values based on field type and format configuration
 */
export const formatValue = (value: any, annotation: FormAnnotation): string => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const { field_type, format_rules } = annotation;
  let formatted = String(value);

  try {
    switch (field_type) {
      case 'ssn':
        if (format_rules?.pattern === '###-##-####' && formatted.length === 9) {
          formatted = `${formatted.slice(0, 3)}-${formatted.slice(3, 5)}-${formatted.slice(5)}`;
        }
        break;

      case 'currency':
        if (format_rules?.type === 'currency') {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            formatted = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(numValue);
          }
        }
        break;

      case 'number':
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          if (format_rules?.type === 'percentage') {
            formatted = new Intl.NumberFormat('en-US', {
              style: 'percent',
              minimumFractionDigits: format_rules.precision || 2,
              maximumFractionDigits: format_rules.precision || 2,
            }).format(numValue / 100);
          } else if (format_rules?.type === 'decimal') {
            formatted = new Intl.NumberFormat('en-US', {
              minimumFractionDigits: format_rules.precision || 2,
              maximumFractionDigits: format_rules.precision || 2,
            }).format(numValue);
          } else if (format_rules?.type === 'integer') {
            formatted = Math.round(numValue).toString();
          }
        }
        break;

      case 'date':
        if (format_rules?.pattern) {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            // Simple date formatting for common patterns
            if (format_rules.pattern === 'MM/DD/YYYY') {
              formatted = date.toLocaleDateString('en-US');
            } else if (format_rules.pattern === 'YYYY-MM-DD') {
              formatted = date.toISOString().split('T')[0]!;
            }
          }
        }
        break;

      case 'checkbox':
        // Handle checkbox values - use checkmark like real IRS forms
        if (value === true || value === 'true' || value === 'X' || value === 'Yes' || value === '1' || value === '✓') {
          formatted = '✓';
        } else if (value === false || value === 'false' || value === '' || value === 'No' || value === '0') {
          formatted = '';
        } else {
          formatted = value ? '✓' : '';
        }
        break;

      case 'text':
      default:
        // Apply text case formatting
        if (format_rules?.case) {
          switch (format_rules.case) {
            case 'uppercase':
              formatted = formatted.toUpperCase();
              break;
            case 'lowercase':
              formatted = formatted.toLowerCase();
              break;
            case 'titlecase':
              formatted = formatted.replace(/\w\S*/g, (txt) => 
                txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
              );
              break;
          }
        }

        // Apply max length constraint
        if (format_rules?.maxLength && formatted.length > format_rules.maxLength) {
          formatted = formatted.substring(0, format_rules.maxLength);
        }
        break;
    }

    return formatted;
  } catch (error) {
    console.warn(`Formatting error for field ${annotation.field_id}:`, error);
    return String(value); // Return original value as fallback
  }
};

/**
 * Validate a single field value against its validation rules
 */
export const validateField = (
  value: any, 
  annotation: FormAnnotation, 
  taxpayerData: any
): ValidationError | null => {
  const { field_id, data_path, validation_rules } = annotation;

  if (!validation_rules) return null;

  // Check required fields
  if (validation_rules.required && (value === null || value === undefined || value === '')) {
    return {
      field_id,
      error: 'Required field is missing',
      data_path,
    };
  }

  // If value is empty and not required, skip other validations
  if (!value && !validation_rules.required) {
    return null;
  }

  const stringValue = String(value);

  // Pattern validation
  if (validation_rules.pattern) {
    const regex = new RegExp(validation_rules.pattern);
    if (!regex.test(stringValue)) {
      return {
        field_id,
        error: `Value does not match required pattern: ${validation_rules.pattern}`,
        data_path,
      };
    }
  }

  // Length validations
  if (validation_rules.minLength && stringValue.length < validation_rules.minLength) {
    return {
      field_id,
      error: `Value must be at least ${validation_rules.minLength} characters`,
      data_path,
    };
  }

  if (validation_rules.maxLength && stringValue.length > validation_rules.maxLength) {
    return {
      field_id,
      error: `Value cannot exceed ${validation_rules.maxLength} characters`,
      data_path,
    };
  }

  // Numeric validations
  if (annotation.field_type === 'number' || annotation.field_type === 'currency') {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      if (validation_rules.min !== undefined && numValue < validation_rules.min) {
        return {
          field_id,
          error: `Value must be at least ${validation_rules.min}`,
          data_path,
        };
      }

      if (validation_rules.max !== undefined && numValue > validation_rules.max) {
        return {
          field_id,
          error: `Value cannot exceed ${validation_rules.max}`,
          data_path,
        };
      }
    }
  }

  return null;
};

/**
 * Validate all taxpayer data against template requirements
 */
export const validateTaxpayerData = (
  taxpayerData: any, 
  template: FormTemplate
): ValidationResult => {
  const errors: ValidationError[] = [];

  template.annotations.forEach(annotation => {
    const value = getValueByPath(taxpayerData, annotation.data_path);
    const error = validateField(value, annotation, taxpayerData);
    
    if (error) {
      errors.push(error);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Map taxpayer data to form fields with formatting
 */
export const mapDataToFields = (
  taxpayerData: any, 
  template: FormTemplate
): FilledField[] => {
  const filledFields: FilledField[] = [];

  template.annotations.forEach(annotation => {
    try {
      // Extract value using data path
      const rawValue = getValueByPath(taxpayerData, annotation.data_path);
      
      // Apply formatting
      const displayValue = formatValue(rawValue, annotation);
      
      const filledField: FilledField = {
        field_id: annotation.field_id,
        position: annotation.position,
        raw_value: rawValue,
        display_value: displayValue,
        formatted: displayValue !== String(rawValue || ''),
      };

      filledFields.push(filledField);
    } catch (error) {
      console.error(`Error processing field ${annotation.field_id}:`, error);
      
      // Add empty field as fallback
      filledFields.push({
        field_id: annotation.field_id,
        position: annotation.position,
        raw_value: null,
        display_value: '',
        formatted: false,
      });
    }
  });

  return filledFields;
};

/**
 * Process taxpayer data and create filled form
 */
export const processTaxpayerData = (
  taxpayerData: any,
  template: FormTemplate
): {
  filledFields: FilledField[];
  validation: ValidationResult;
} => {
  // Validate the data first
  const validation = validateTaxpayerData(taxpayerData, template);
  
  // Map data to fields regardless of validation (for partial forms)
  const filledFields = mapDataToFields(taxpayerData, template);
  
  return {
    filledFields,
    validation,
  };
}; 