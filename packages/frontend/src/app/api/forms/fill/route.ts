import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { storage } from '@/lib/storage';
import { processTaxpayerData } from '@/lib/dataMapping';
import { handleApiError, createError } from '@/lib/errorHandler';

// More flexible validation schema that accepts any structure
const FillFormSchema = z.object({
  template_id: z.string(),
  taxpayer_data: z.record(z.string(), z.any()), // Accept any object structure
});

// POST /api/forms/fill - Fill form with taxpayer data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = FillFormSchema.parse(body);
    const { template_id, taxpayer_data } = validatedData;

    // Get the template
    const template = storage.getTemplate(template_id);
    if (!template) {
      const errorResponse = handleApiError(createError('Form template not found', 404, 'TEMPLATE_NOT_FOUND'));
      return NextResponse.json(errorResponse.body, { status: errorResponse.status });
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

    return NextResponse.json({
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
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse.body, { status: errorResponse.status });
  }
} 