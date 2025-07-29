import axios from 'axios';
import type { FormTemplate, FormAnnotation, FilledField, FilledForm } from './storage';
import type { TaxpayerData, ValidationError } from './dataMapping';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Re-export types for external use
export type { FormTemplate, FormAnnotation, FilledField, FilledForm, TaxpayerData, ValidationError };

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