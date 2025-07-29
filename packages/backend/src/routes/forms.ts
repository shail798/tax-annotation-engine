import express from 'express';
import { z } from 'zod';
import { storage } from '../storage/inMemoryStorage';
import { processTaxpayerData } from '../services/dataMapping';
import { createError } from '../middleware/errorHandler';

export const formsRouter = express.Router();

// Validation schemas
const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  page: z.number().min(1),
});

const FormatRulesSchema = z.object({
  pattern: z.string().optional(),
  mask: z.boolean().optional(),
  case: z.enum(['uppercase', 'lowercase', 'titlecase']).optional(),
  maxLength: z.number().optional(),
  type: z.enum(['currency', 'percentage', 'decimal', 'integer']).optional(),
  precision: z.number().optional(),
}).optional();

const ValidationRulesSchema = z.object({
  required: z.boolean().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
}).optional();

const AnnotationSchema = z.object({
  field_id: z.string(),
  position: PositionSchema,
  data_path: z.string(),
  field_type: z.enum(['text', 'number', 'currency', 'ssn', 'date', 'checkbox']),
  format_rules: FormatRulesSchema,
  validation_rules: ValidationRulesSchema,
});

const CreateTemplateSchema = z.object({
  form_type: z.string(),
  form_name: z.string(),
  tax_year: z.number(),
  version: z.string(),
  annotations: z.array(AnnotationSchema),
});

// More flexible validation schema that accepts any structure
const FillFormSchema = z.object({
  template_id: z.string(),
  taxpayer_data: z.record(z.any()), // Accept any object structure
});

// GET /api/forms/templates - Get all templates
formsRouter.get('/templates', (req, res) => {
  try {
    const templates = storage.getAllTemplates();
    
    res.json({
      success: true,
      data: {
        templates,
        total: templates.length,
      },
    });
  } catch (error) {
    throw createError('Failed to fetch templates', 500, 'FETCH_TEMPLATES_ERROR');
  }
});

// POST /api/forms/templates - Create new form template
formsRouter.post('/templates', (req, res) => {
  try {
    const validatedData = CreateTemplateSchema.parse(req.body);
    
    const template = storage.createTemplate({
      ...validatedData,
      annotations: validatedData.annotations as any,
      page_count: Math.max(...validatedData.annotations.map(a => a.position.page)),
      created_by: 'admin',
    });

    res.status(201).json({
      success: true,
      data: {
        template_id: template.template_id,
        form_type: template.form_type,
        version: template.version,
        created_at: template.created_at,
        total_fields: template.annotations.length,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw error; // Will be handled by error middleware
    }
    throw createError('Failed to create template', 500, 'CREATE_TEMPLATE_ERROR');
  }
});

// GET /api/forms/templates/:templateId - Get specific template
formsRouter.get('/templates/:templateId', (req, res) => {
  try {
    const { templateId } = req.params;
    const template = storage.getTemplate(templateId);

    if (!template) {
      throw createError('Form template not found', 404, 'TEMPLATE_NOT_FOUND');
    }

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error; // Re-throw custom errors
    }
    throw createError('Failed to fetch template', 500, 'FETCH_TEMPLATE_ERROR');
  }
});

// GET /api/forms/templates/type/:formType - Get templates by type
formsRouter.get('/templates/type/:formType', (req, res) => {
  try {
    const { formType } = req.params;
    const templates = storage.getTemplatesByType(formType);

    res.json({
      success: true,
      data: {
        form_type: formType,
        templates,
        total: templates.length,
      },
    });
  } catch (error) {
    throw createError('Failed to fetch templates by type', 500, 'FETCH_TEMPLATES_BY_TYPE_ERROR');
  }
});

// POST /api/forms/fill - Fill form with taxpayer data
formsRouter.post('/fill', (req, res) => {
  try {
    const validatedData = FillFormSchema.parse(req.body);
    const { template_id, taxpayer_data } = validatedData;

    // Get the template
    const template = storage.getTemplate(template_id);
    if (!template) {
      throw createError('Form template not found', 404, 'TEMPLATE_NOT_FOUND');
    }

    // Process taxpayer data and create filled form  
    const { filledFields, validation } = processTaxpayerData(taxpayer_data as any, template);

    // Store the filled form
    const filledForm = storage.createFilledForm({
      template_id,
      taxpayer_data: taxpayer_data as any,
      filled_data: filledFields,
      status: validation.valid ? 'completed' : 'draft',
      validation_status: validation.valid ? 'valid' : 'invalid',
      ...(validation.valid && { completed_at: new Date().toISOString() }),
    });

    res.json({
      success: true,
      data: {
        filled_form_id: filledForm.filled_form_id,
        template_id: filledForm.template_id,
        fields: filledFields,
        validation_status: filledForm.validation_status,
        validation_errors: validation.errors,
        created_at: filledForm.created_at,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw error; // Will be handled by error middleware
    }
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error; // Re-throw custom errors
    }
    throw createError('Failed to fill form', 500, 'FILL_FORM_ERROR');
  }
});

// GET /api/forms/filled/:filledFormId - Get filled form data
formsRouter.get('/filled/:filledFormId', (req, res) => {
  try {
    const { filledFormId } = req.params;
    const filledForm = storage.getFilledForm(filledFormId);

    if (!filledForm) {
      throw createError('Filled form not found', 404, 'FILLED_FORM_NOT_FOUND');
    }

    res.json({
      success: true,
      data: {
        filled_form_id: filledForm.filled_form_id,
        template_id: filledForm.template_id,
        status: filledForm.status,
        validation_status: filledForm.validation_status,
        fields: filledForm.filled_data,
        created_at: filledForm.created_at,
        completed_at: filledForm.completed_at,
      },
    });
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error; // Re-throw custom errors
    }
    throw createError('Failed to fetch filled form', 500, 'FETCH_FILLED_FORM_ERROR');
  }
});

// GET /api/forms/filled - Get all filled forms
formsRouter.get('/filled', (req, res) => {
  try {
    const filledForms = storage.getAllFilledForms();
    
    res.json({
      success: true,
      data: {
        filled_forms: filledForms.map(form => ({
          filled_form_id: form.filled_form_id,
          template_id: form.template_id,
          status: form.status,
          validation_status: form.validation_status,
          created_at: form.created_at,
          completed_at: form.completed_at,
        })),
        total: filledForms.length,
      },
    });
  } catch (error) {
    throw createError('Failed to fetch filled forms', 500, 'FETCH_FILLED_FORMS_ERROR');
  }
});

// GET /api/forms/stats - Get system statistics
formsRouter.get('/stats', (req, res) => {
  try {
    const stats = storage.getStats();
    
    res.json({
      success: true,
      data: {
        ...stats,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    throw createError('Failed to fetch statistics', 500, 'FETCH_STATS_ERROR');
  }
});

export default formsRouter; 