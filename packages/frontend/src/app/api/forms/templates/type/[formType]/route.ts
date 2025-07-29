import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { handleApiError, createError } from '@/lib/errorHandler';

// GET /api/forms/templates/type/[formType] - Get templates by type
export async function GET(
  request: NextRequest,
  { params }: { params: { formType: string } }
) {
  try {
    const { formType } = params;
    const templates = storage.getTemplatesByType(formType);

    return NextResponse.json({
      success: true,
      data: {
        form_type: formType,
        templates,
        total: templates.length,
      },
    });
  } catch (error) {
    const errorResponse = handleApiError(createError('Failed to fetch templates by type', 500, 'FETCH_TEMPLATES_BY_TYPE_ERROR'));
    return NextResponse.json(errorResponse.body, { status: errorResponse.status });
  }
} 