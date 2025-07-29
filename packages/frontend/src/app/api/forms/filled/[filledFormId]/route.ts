import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { handleApiError, createError } from '@/lib/errorHandler';

// GET /api/forms/filled/[filledFormId] - Get filled form data
export async function GET(
  request: NextRequest,
  { params }: { params: { filledFormId: string } }
) {
  try {
    const { filledFormId } = params;
    const filledForm = storage.getFilledForm(filledFormId);

    if (!filledForm) {
      const errorResponse = handleApiError(createError('Filled form not found', 404, 'FILLED_FORM_NOT_FOUND'));
      return NextResponse.json(errorResponse.body, { status: errorResponse.status });
    }

    return NextResponse.json({
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
    const errorResponse = handleApiError(createError('Failed to fetch filled form', 500, 'FETCH_FILLED_FORM_ERROR'));
    return NextResponse.json(errorResponse.body, { status: errorResponse.status });
  }
} 