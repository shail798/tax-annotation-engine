import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types (matching backend interfaces)
export interface FormTemplate {
  template_id: string;
  form_type: string;
  form_name: string;
  tax_year: number;
  version: string;
  page_count: number;
  annotations: FormAnnotation[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface FormAnnotation {
  field_id: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
    page: number;
  };
  data_path: string;
  field_type: 'text' | 'number' | 'currency' | 'ssn' | 'date' | 'checkbox';
  format_rules?: {
    pattern?: string;
    mask?: boolean;
    case?: 'uppercase' | 'lowercase' | 'titlecase';
    maxLength?: number;
    type?: 'currency' | 'percentage' | 'decimal' | 'integer';
    precision?: number;
  };
  validation_rules?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

export interface FilledField {
  field_id: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
    page: number;
  };
  raw_value: any;
  display_value: string;
  formatted: boolean;
}

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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// API functions
export const formApi = {
  // Get all templates
  getTemplates: async (): Promise<{ templates: FormTemplate[]; total: number }> => {
    const response = await api.get<ApiResponse<{ templates: FormTemplate[]; total: number }>>('/forms/templates');
    return response.data.data;
  },

  // Get specific template
  getTemplate: async (templateId: string): Promise<FormTemplate> => {
    const response = await api.get<ApiResponse<FormTemplate>>(`/forms/templates/${templateId}`);
    return response.data.data;
  },

  // Get templates by type
  getTemplatesByType: async (formType: string): Promise<{ form_type: string; templates: FormTemplate[]; total: number }> => {
    const response = await api.get<ApiResponse<{ form_type: string; templates: FormTemplate[]; total: number }>>(`/forms/templates/type/${formType}`);
    return response.data.data;
  },

  // Fill form with taxpayer data
  fillForm: async (templateId: string, taxpayerData: TaxpayerData): Promise<{
    filled_form_id: string;
    template_id: string;
    fields: FilledField[];
    validation_status: 'valid' | 'invalid';
    validation_errors: ValidationError[];
    created_at: string;
  }> => {
    const response = await api.post<ApiResponse<{
      filled_form_id: string;
      template_id: string;
      fields: FilledField[];
      validation_status: 'valid' | 'invalid';
      validation_errors: ValidationError[];
      created_at: string;
    }>>('/forms/fill', {
      template_id: templateId,
      taxpayer_data: taxpayerData,
    });
    return response.data.data;
  },

  // Get filled form
  getFilledForm: async (filledFormId: string): Promise<{
    filled_form_id: string;
    template_id: string;
    status: 'draft' | 'completed' | 'submitted';
    validation_status: 'valid' | 'invalid' | 'pending';
    fields: FilledField[];
    created_at: string;
    completed_at?: string;
  }> => {
    const response = await api.get<ApiResponse<{
      filled_form_id: string;
      template_id: string;
      status: 'draft' | 'completed' | 'submitted';
      validation_status: 'valid' | 'invalid' | 'pending';
      fields: FilledField[];
      created_at: string;
      completed_at?: string;
    }>>(`/forms/filled/${filledFormId}`);
    return response.data.data;
  },

  // Get system stats
  getStats: async (): Promise<{
    templates: number;
    filledForms: number;
    timestamp: string;
  }> => {
    const response = await api.get<ApiResponse<{
      templates: number;
      filledForms: number;
      timestamp: string;
    }>>('/forms/stats');
    return response.data.data;
  },
};

export default api; 