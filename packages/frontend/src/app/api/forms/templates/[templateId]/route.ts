import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { handleApiError, createError } from '@/lib/errorHandler';

// GET /api/forms/templates/[templateId] - Get specific template
export async function GET(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const { templateId } = params;
    const template = storage.getTemplate(templateId);

    if (!template) {
      const errorResponse = handleApiError(createError('Form template not found', 404, 'TEMPLATE_NOT_FOUND'));
      return NextResponse.json(errorResponse.body, { status: errorResponse.status });
    }

    return NextResponse.json({
      success: true,
      data: template,
    });
  } catch (error) {
    const errorResponse = handleApiError(createError('Failed to fetch template', 500, 'FETCH_TEMPLATE_ERROR'));
    return NextResponse.json(errorResponse.body, { status: errorResponse.status });
  }
} 