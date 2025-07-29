import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { handleApiError, createError } from '@/lib/errorHandler';

// GET /api/forms/filled - Get all filled forms
export async function GET() {
  try {
    const filledForms = storage.getAllFilledForms();
    
    return NextResponse.json({
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
    const errorResponse = handleApiError(createError('Failed to fetch filled forms', 500, 'FETCH_FILLED_FORMS_ERROR'));
    return NextResponse.json(errorResponse.body, { status: errorResponse.status });
  }
} 