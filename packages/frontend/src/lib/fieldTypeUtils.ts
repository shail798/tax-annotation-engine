// Field type utility functions to avoid duplication

export const getInputType = (fieldType: string): string => {
  switch (fieldType) {
    case 'number':
      return 'number';
    case 'email':
      return 'email';
    case 'checkbox':
      return 'checkbox';
    case 'ssn':
    case 'text':
    case 'state':
    case 'zip':
    default:
      return 'text';
  }
};

export const getMaxLength = (fieldType: string, customMaxLength?: number): number | undefined => {
  if (customMaxLength) return customMaxLength;
  
  switch (fieldType) {
    case 'ssn':
      return 9;
    case 'state':
      return 2;
    case 'zip':
      return 10;
    default:
      return undefined;
  }
};

export const getPlaceholder = (fieldType: string, customPlaceholder?: string): string | undefined => {
  if (customPlaceholder) return customPlaceholder;
  
  switch (fieldType) {
    case 'ssn':
      return '123456789';
    case 'state':
      return 'NY';
    case 'zip':
      return '10001';
    case 'number':
      return '0';
    default:
      return undefined;
  }
};

export const isCheckboxChecked = (value: any): boolean => {
  return value === '✓' || value === 'X' || value === 'Yes' || value === true || value === 'true' || value === '1';
};

export const formatCheckboxValue = (checked: boolean): string => {
  return checked ? '✓' : '';
}; 