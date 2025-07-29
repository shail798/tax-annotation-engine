import { v4 as uuidv4 } from 'uuid';

// Types for our data structures
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

export interface FilledForm {
  filled_form_id: string;
  template_id: string;
  user_id?: string;
  taxpayer_data: Record<string, any>;
  filled_data: FilledField[];
  status: 'draft' | 'completed' | 'submitted';
  validation_status: 'valid' | 'invalid' | 'pending';
  created_at: string;
  completed_at?: string;
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

// In-memory storage
class InMemoryStorage {
  private templates: Map<string, FormTemplate> = new Map();
  private filledForms: Map<string, FilledForm> = new Map();

  constructor() {
    this.initializeHardcodedTemplates();
  }

  private initializeHardcodedTemplates() {
    // Form 1040 - Individual Income Tax Return Template
    const form1040: FormTemplate = {
      template_id: 'tmpl_1040_2024_v1',
      form_type: '1040',
      form_name: 'Form 1040 - Individual Income Tax Return',
      tax_year: 2024,
      version: '1.0.0',
      page_count: 2,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      created_by: 'admin',
      annotations: [
        {
          field_id: 'taxpayer_first_name',
          position: { x: 72, y: 140, width: 110, height: 12, page: 1 },
          data_path: 'taxpayer.firstName',
          field_type: 'text',
          format_rules: {
            case: 'uppercase',
            maxLength: 20
          },
          validation_rules: {
            required: true,
            maxLength: 20
          }
        },
        {
          field_id: 'taxpayer_last_name',
          position: { x: 185, y: 140, width: 110, height: 12, page: 1 },
          data_path: 'taxpayer.lastName',
          field_type: 'text',
          format_rules: {
            case: 'uppercase',
            maxLength: 25
          },
          validation_rules: {
            required: true,
            maxLength: 25
          }
        },
        {
          field_id: 'taxpayer_ssn',
          position: { x: 445, y: 140, width: 100, height: 12, page: 1 },
          data_path: 'taxpayer.ssn',
          field_type: 'ssn',
          format_rules: {
            pattern: '###-##-####',
            mask: true
          },
          validation_rules: {
            required: true,
            pattern: '^\\d{9}$'
          }
        },
        {
          field_id: 'spouse_first_name',
          position: { x: 72, y: 165, width: 110, height: 12, page: 1 },
          data_path: 'spouse.firstName',
          field_type: 'text',
          format_rules: {
            case: 'uppercase',
            maxLength: 20
          }
        },
        {
          field_id: 'spouse_last_name',
          position: { x: 185, y: 165, width: 110, height: 12, page: 1 },
          data_path: 'spouse.lastName',
          field_type: 'text',
          format_rules: {
            case: 'uppercase',
            maxLength: 25
          }
        },
        {
          field_id: 'spouse_ssn',
          position: { x: 445, y: 165, width: 100, height: 12, page: 1 },
          data_path: 'spouse.ssn',
          field_type: 'ssn',
          format_rules: {
            pattern: '###-##-####',
            mask: true
          }
        },
        {
          field_id: 'address_street',
          position: { x: 72, y: 190, width: 200, height: 12, page: 1 },
          data_path: 'taxpayer.address.street',
          field_type: 'text',
          format_rules: {
            case: 'uppercase',
            maxLength: 35
          },
          validation_rules: {
            required: true,
            maxLength: 35
          }
        },
        {
          field_id: 'address_city',
          position: { x: 72, y: 215, width: 150, height: 12, page: 1 },
          data_path: 'taxpayer.address.city',
          field_type: 'text',
          format_rules: {
            case: 'uppercase',
            maxLength: 25
          },
          validation_rules: {
            required: true,
            maxLength: 25
          }
        },
        {
          field_id: 'address_state',
          position: { x: 230, y: 215, width: 40, height: 12, page: 1 },
          data_path: 'taxpayer.address.state',
          field_type: 'text',
          format_rules: {
            case: 'uppercase',
            maxLength: 2
          },
          validation_rules: {
            required: true,
            maxLength: 2,
            pattern: '^[A-Z]{2}$'
          }
        },
        {
          field_id: 'address_zip',
          position: { x: 280, y: 215, width: 60, height: 12, page: 1 },
          data_path: 'taxpayer.address.zip',
          field_type: 'text',
          format_rules: {
            maxLength: 10
          },
          validation_rules: {
            required: true,
            pattern: '^\\d{5}(-\\d{4})?$'
          }
        },
        {
          field_id: 'income_wages',
          position: { x: 510, y: 450, width: 90, height: 12, page: 1 },
          data_path: 'income.wages',
          field_type: 'currency',
          format_rules: {
            type: 'currency'
          }
        },
        {
          field_id: 'income_interest',
          position: { x: 510, y: 475, width: 90, height: 12, page: 1 },
          data_path: 'income.interest',
          field_type: 'currency',
          format_rules: {
            type: 'currency'
          }
        },
        {
          field_id: 'income_dividends',
          position: { x: 510, y: 500, width: 90, height: 12, page: 1 },
          data_path: 'income.dividends',
          field_type: 'currency',
          format_rules: {
            type: 'currency'
          }
        }
      ]
    };

    // Form W-2 Template
    const formW2: FormTemplate = {
      template_id: 'tmpl_w2_2024_v1',
      form_type: 'W-2',
      form_name: 'Form W-2 - Wage and Tax Statement',
      tax_year: 2024,
      version: '1.0.0',
      page_count: 1,
      created_at: '2024-01-15T11:00:00Z',
      updated_at: '2024-01-15T11:00:00Z',
      created_by: 'admin',
      annotations: [
        {
          field_id: 'employee_name',
          position: { x: 72, y: 180, width: 200, height: 12, page: 1 },
          data_path: 'employee.fullName',
          field_type: 'text',
          format_rules: {
            case: 'uppercase',
            maxLength: 50
          },
          validation_rules: {
            required: true,
            maxLength: 50
          }
        },
        {
          field_id: 'employee_ssn',
          position: { x: 300, y: 180, width: 100, height: 12, page: 1 },
          data_path: 'employee.ssn',
          field_type: 'ssn',
          format_rules: {
            pattern: '###-##-####'
          },
          validation_rules: {
            required: true,
            pattern: '^\\d{9}$'
          }
        },
        {
          field_id: 'wages_tips',
          position: { x: 120, y: 240, width: 90, height: 12, page: 1 },
          data_path: 'wages.total',
          field_type: 'currency',
          format_rules: {
            type: 'currency'
          }
        },
        {
          field_id: 'federal_tax_withheld',
          position: { x: 240, y: 240, width: 90, height: 12, page: 1 },
          data_path: 'taxes.federal',
          field_type: 'currency',
          format_rules: {
            type: 'currency'
          }
        }
      ]
    };

    // Form 1040 Extended - Two Page Template
    const form1040Extended: FormTemplate = {
      template_id: 'tmpl_1040_extended_2024_v1',
      form_type: '1040-EXT',
      form_name: 'Form 1040 Extended - Individual Income Tax Return (2 Pages)',
      tax_year: 2024,
      version: '1.0.0',
      page_count: 2,
      created_at: '2024-01-15T12:00:00Z',
      updated_at: '2024-01-15T12:00:00Z',
      created_by: 'admin',
      annotations: [
        // PAGE 1 - Personal Information & Basic Details
        {
          field_id: 'taxpayer_first_name',
          position: { x: 72, y: 140, width: 110, height: 12, page: 1 },
          data_path: 'taxpayer.firstName',
          field_type: 'text',
          format_rules: { case: 'uppercase', maxLength: 20 },
          validation_rules: { required: true, maxLength: 20 }
        },
        {
          field_id: 'taxpayer_last_name',
          position: { x: 185, y: 140, width: 110, height: 12, page: 1 },
          data_path: 'taxpayer.lastName',
          field_type: 'text',
          format_rules: { case: 'uppercase', maxLength: 25 },
          validation_rules: { required: true, maxLength: 25 }
        },
        {
          field_id: 'taxpayer_ssn',
          position: { x: 445, y: 140, width: 100, height: 12, page: 1 },
          data_path: 'taxpayer.ssn',
          field_type: 'ssn',
          format_rules: { pattern: '###-##-####' },
          validation_rules: { required: true, pattern: '^\\d{9}$' }
        },
        {
          field_id: 'spouse_first_name',
          position: { x: 72, y: 160, width: 110, height: 12, page: 1 },
          data_path: 'spouse.firstName',
          field_type: 'text',
          format_rules: { case: 'uppercase', maxLength: 20 }
        },
        {
          field_id: 'spouse_last_name',
          position: { x: 185, y: 160, width: 110, height: 12, page: 1 },
          data_path: 'spouse.lastName',
          field_type: 'text',
          format_rules: { case: 'uppercase', maxLength: 25 }
        },
        {
          field_id: 'spouse_ssn',
          position: { x: 445, y: 160, width: 100, height: 12, page: 1 },
          data_path: 'spouse.ssn',
          field_type: 'ssn',
          format_rules: { pattern: '###-##-####' }
        },
        {
          field_id: 'home_address',
          position: { x: 72, y: 180, width: 350, height: 12, page: 1 },
          data_path: 'taxpayer.address.street',
          field_type: 'text',
          format_rules: { case: 'uppercase', maxLength: 35 },
          validation_rules: { required: true, maxLength: 35 }
        },
        {
          field_id: 'city_state_zip',
          position: { x: 72, y: 200, width: 350, height: 12, page: 1 },
          data_path: 'taxpayer.address.cityStateZip',
          field_type: 'text',
          format_rules: { case: 'uppercase', maxLength: 50 },
          validation_rules: { required: true, maxLength: 50 }
        },
        {
          field_id: 'presidential_campaign_taxpayer',
          position: { x: 485, y: 215, width: 10, height: 10, page: 1 },
          data_path: 'taxpayer.presidentialCampaign',
          field_type: 'checkbox'
        },
        {
          field_id: 'presidential_campaign_spouse',
          position: { x: 540, y: 215, width: 10, height: 10, page: 1 },
          data_path: 'spouse.presidentialCampaign',
          field_type: 'checkbox'
        },
        {
          field_id: 'filing_status_single',
          position: { x: 72, y: 260, width: 10, height: 10, page: 1 },
          data_path: 'filingStatus.single',
          field_type: 'checkbox'
        },
        {
          field_id: 'filing_status_married_joint',
          position: { x: 72, y: 280, width: 10, height: 10, page: 1 },
          data_path: 'filingStatus.marriedJoint',
          field_type: 'checkbox'
        },
        {
          field_id: 'filing_status_married_separate',
          position: { x: 72, y: 300, width: 10, height: 10, page: 1 },
          data_path: 'filingStatus.marriedSeparate',
          field_type: 'checkbox'
        },
        {
          field_id: 'digital_assets_yes',
          position: { x: 420, y: 355, width: 10, height: 10, page: 1 },
          data_path: 'digitalAssets',
          field_type: 'checkbox'
        },

        // PAGE 2 - Dependents, Income & Calculations
        {
          field_id: 'dependent_1_first_name',
          position: { x: 72, y: 100, width: 100, height: 12, page: 2 },
          data_path: 'dependents[0].firstName',
          field_type: 'text',
          format_rules: { case: 'uppercase', maxLength: 20 }
        },
        {
          field_id: 'dependent_1_last_name',
          position: { x: 180, y: 100, width: 100, height: 12, page: 2 },
          data_path: 'dependents[0].lastName',
          field_type: 'text',
          format_rules: { case: 'uppercase', maxLength: 25 }
        },
        {
          field_id: 'dependent_1_ssn',
          position: { x: 290, y: 100, width: 100, height: 12, page: 2 },
          data_path: 'dependents[0].ssn',
          field_type: 'ssn',
          format_rules: { pattern: '###-##-####' }
        },
        {
          field_id: 'dependent_1_relationship',
          position: { x: 400, y: 100, width: 80, height: 12, page: 2 },
          data_path: 'dependents[0].relationship',
          field_type: 'text',
          format_rules: { case: 'uppercase', maxLength: 15 }
        },
        {
          field_id: 'dependent_2_first_name',
          position: { x: 72, y: 120, width: 100, height: 12, page: 2 },
          data_path: 'dependents[1].firstName',
          field_type: 'text',
          format_rules: { case: 'uppercase', maxLength: 20 }
        },
        {
          field_id: 'dependent_2_last_name',
          position: { x: 180, y: 120, width: 100, height: 12, page: 2 },
          data_path: 'dependents[1].lastName',
          field_type: 'text',
          format_rules: { case: 'uppercase', maxLength: 25 }
        },
        {
          field_id: 'income_w2',
          position: { x: 510, y: 200, width: 90, height: 12, page: 2 },
          data_path: 'income.w2',
          field_type: 'currency',
          format_rules: { type: 'currency' }
        },
        {
          field_id: 'income_interest',
          position: { x: 510, y: 220, width: 90, height: 12, page: 2 },
          data_path: 'income.interest',
          field_type: 'currency',
          format_rules: { type: 'currency' }
        },
        {
          field_id: 'income_dividends',
          position: { x: 510, y: 240, width: 90, height: 12, page: 2 },
          data_path: 'income.dividends',
          field_type: 'currency',
          format_rules: { type: 'currency' }
        },
        {
          field_id: 'income_social_security',
          position: { x: 510, y: 260, width: 90, height: 12, page: 2 },
          data_path: 'income.socialSecurity',
          field_type: 'currency',
          format_rules: { type: 'currency' }
        },
        {
          field_id: 'income_retirement',
          position: { x: 510, y: 280, width: 90, height: 12, page: 2 },
          data_path: 'income.retirement',
          field_type: 'currency',
          format_rules: { type: 'currency' }
        },
        {
          field_id: 'income_unemployment',
          position: { x: 510, y: 300, width: 90, height: 12, page: 2 },
          data_path: 'income.unemployment',
          field_type: 'currency',
          format_rules: { type: 'currency' }
        },
        {
          field_id: 'total_income',
          position: { x: 510, y: 340, width: 90, height: 12, page: 2 },
          data_path: 'calculations.totalIncome',
          field_type: 'currency',
          format_rules: { type: 'currency' }
        },
        {
          field_id: 'standard_deduction',
          position: { x: 510, y: 380, width: 90, height: 12, page: 2 },
          data_path: 'deductions.standard',
          field_type: 'currency',
          format_rules: { type: 'currency' }
        },
        {
          field_id: 'taxable_income',
          position: { x: 510, y: 420, width: 90, height: 12, page: 2 },
          data_path: 'calculations.taxableIncome',
          field_type: 'currency',
          format_rules: { type: 'currency' }
        },
        {
          field_id: 'tax_owed',
          position: { x: 510, y: 460, width: 90, height: 12, page: 2 },
          data_path: 'calculations.taxOwed',
          field_type: 'currency',
          format_rules: { type: 'currency' }
        },
        {
          field_id: 'tax_withheld',
          position: { x: 510, y: 500, width: 90, height: 12, page: 2 },
          data_path: 'payments.withheld',
          field_type: 'currency',
          format_rules: { type: 'currency' }
        },
        {
          field_id: 'refund_amount',
          position: { x: 510, y: 540, width: 90, height: 12, page: 2 },
          data_path: 'calculations.refund',
          field_type: 'currency',
          format_rules: { type: 'currency' }
        }
      ]
    };

    // Store the templates
    this.templates.set(form1040.template_id, form1040);
    this.templates.set(formW2.template_id, formW2);
    this.templates.set(form1040Extended.template_id, form1040Extended);
  }

  // Template operations
  createTemplate(template: Omit<FormTemplate, 'template_id' | 'created_at' | 'updated_at'>): FormTemplate {
    const templateId = `tmpl_${template.form_type.toLowerCase()}_${template.tax_year}_v${template.version.replace(/\./g, '_')}`;
    const now = new Date().toISOString();
    
    const newTemplate: FormTemplate = {
      ...template,
      template_id: templateId,
      created_at: now,
      updated_at: now,
    };

    this.templates.set(templateId, newTemplate);
    return newTemplate;
  }

  getTemplate(templateId: string): FormTemplate | undefined {
    return this.templates.get(templateId);
  }

  getAllTemplates(): FormTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplatesByType(formType: string): FormTemplate[] {
    return Array.from(this.templates.values()).filter(
      template => template.form_type.toLowerCase() === formType.toLowerCase()
    );
  }

  // Filled form operations
  createFilledForm(filledForm: Omit<FilledForm, 'filled_form_id' | 'created_at'>): FilledForm {
    const filledFormId = `filled_${uuidv4()}`;
    const now = new Date().toISOString();

    const newFilledForm: FilledForm = {
      ...filledForm,
      filled_form_id: filledFormId,
      created_at: now,
    };

    this.filledForms.set(filledFormId, newFilledForm);
    return newFilledForm;
  }

  getFilledForm(filledFormId: string): FilledForm | undefined {
    return this.filledForms.get(filledFormId);
  }

  getAllFilledForms(): FilledForm[] {
    return Array.from(this.filledForms.values());
  }

  updateFilledForm(filledFormId: string, updates: Partial<FilledForm>): FilledForm | undefined {
    const existingForm = this.filledForms.get(filledFormId);
    if (!existingForm) {
      return undefined;
    }

    const updatedForm: FilledForm = {
      ...existingForm,
      ...updates,
    };

    this.filledForms.set(filledFormId, updatedForm);
    return updatedForm;
  }

  // Utility methods
  clearAllData(): void {
    this.filledForms.clear();
  }

  getStats() {
    return {
      templates: this.templates.size,
      filledForms: this.filledForms.size,
    };
  }
}

// Export singleton instance
export const storage = new InMemoryStorage(); 