import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { storage } from '@/lib/storage';
import { handleApiError, createError } from '@/lib/errorHandler';

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

// GET /api/forms/templates - Get all templates
export async function GET() {
  try {
    const templates = storage.getAllTemplates();
    
    return NextResponse.json({
      success: true,
      data: {
        templates,
        total: templates.length,
      },
    });
  } catch (error) {
    const errorResponse = handleApiError(createError('Failed to fetch templates', 500, 'FETCH_TEMPLATES_ERROR'));
    return NextResponse.json(errorResponse.body, { status: errorResponse.status });
  }
}

// POST /api/forms/templates - Create new form template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateTemplateSchema.parse(body);
    
    const template = storage.createTemplate({
      ...validatedData,
      annotations: validatedData.annotations as any,
      page_count: Math.max(...validatedData.annotations.map(a => a.position.page)),
      created_by: 'admin',
    });

    return NextResponse.json({
      success: true,
      data: {
        template_id: template.template_id,
        form_type: template.form_type,
        version: template.version,
        created_at: template.created_at,
        total_fields: template.annotations.length,
      },
    }, { status: 201 });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse.body, { status: errorResponse.status });
  }
} 