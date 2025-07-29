import { FormTemplate, FormAnnotation } from './api';
import { FIELD_MAPPINGS, SECTION_ORDER } from './fieldMappings';
import { SAMPLE_DATA } from './sampleData';

export interface FieldRequirement {
  path: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'ssn' | 'state' | 'zip' | 'checkbox';
  required: boolean;
  maxLength?: number;
  pattern?: string;
  placeholder?: string;
  section: string;
}

export interface FormSection {
  title: string;
  fields: FieldRequirement[];
}

export interface DynamicFormStructure {
  sections: FormSection[];
  dataStructure: Record<string, any>;
}

/**
 * Analyze a form template and determine what taxpayer data fields are needed
 */
export const analyzeTemplate = (template: FormTemplate): DynamicFormStructure => {
  const requiredPaths = new Set<string>();
  const fieldRequirements: FieldRequirement[] = [];
  
  // Extract all unique data paths from annotations
  template.annotations.forEach((annotation: FormAnnotation) => {
    if (annotation.data_path && !requiredPaths.has(annotation.data_path)) {
      requiredPaths.add(annotation.data_path);
      
      const mapping = FIELD_MAPPINGS[annotation.data_path];
      if (mapping) {
        fieldRequirements.push({
          path: annotation.data_path,
          label: mapping.label,
          type: mapping.type,
          section: mapping.section,
          required: annotation.validation_rules?.required || false,
          maxLength: annotation.validation_rules?.maxLength || annotation.format_rules?.maxLength,
          pattern: annotation.validation_rules?.pattern,
          placeholder: mapping.placeholder,
        });
      } else {
        // Fallback for unmapped paths
        const pathParts = annotation.data_path.split('.');
        const fieldName = pathParts[pathParts.length - 1];
        
        fieldRequirements.push({
          path: annotation.data_path,
          label: fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
          type: annotation.field_type === 'currency' ? 'number' : 'text',
          section: 'Other Information',
          required: annotation.validation_rules?.required || false,
          maxLength: annotation.validation_rules?.maxLength,
          pattern: annotation.validation_rules?.pattern,
        });
      }
    }
  });
  
  // Group fields by section
  const sectionsMap = new Map<string, FieldRequirement[]>();
  fieldRequirements.forEach(field => {
    if (!sectionsMap.has(field.section)) {
      sectionsMap.set(field.section, []);
    }
    sectionsMap.get(field.section)!.push(field);
  });
  
  // Convert to sections array with predefined order
  const sections: FormSection[] = [];
  SECTION_ORDER.forEach(sectionTitle => {
    const sectionFields = sectionsMap.get(sectionTitle);
    if (sectionFields && sectionFields.length > 0) {
      sections.push({
        title: sectionTitle,
        fields: sectionFields.sort((a, b) => a.label.localeCompare(b.label))
      });
    }
  });
  
  // Generate initial data structure
  const dataStructure = generateInitialDataStructure(fieldRequirements);
  
  return {
    sections,
    dataStructure
  };
};

/**
 * Generate initial data structure with sample values
 */
const generateInitialDataStructure = (fields: FieldRequirement[]): Record<string, any> => {
  const data: Record<string, any> = {};
  
  fields.forEach(field => {
    const pathParts = field.path.split('.');
    let current = data;
    
    // Create nested structure
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]];
    }
    
    // Set value (use sample if available, otherwise default)
    const lastKey = pathParts[pathParts.length - 1];
    current[lastKey] = SAMPLE_DATA[field.path] || (field.type === 'number' ? 0 : '');
  });
  
  return data;
};

/**
 * Get field value from nested object using dot notation
 */
export const getFieldValue = (data: any, path: string): any => {
  return path.split('.').reduce((obj, key) => obj?.[key], data);
};

/**
 * Set field value in nested object using dot notation
 */
export const setFieldValue = (data: any, path: string, value: any): any => {
  const newData = { ...data };
  const pathParts = path.split('.');
  let current = newData;
  
  for (let i = 0; i < pathParts.length - 1; i++) {
    if (!current[pathParts[i]]) {
      current[pathParts[i]] = {};
    } else {
      current[pathParts[i]] = { ...current[pathParts[i]] };
    }
    current = current[pathParts[i]];
  }
  
  current[pathParts[pathParts.length - 1]] = value;
  return newData;
}; 