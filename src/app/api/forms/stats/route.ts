import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { handleApiError, createError } from '@/lib/errorHandler';

// GET /api/forms/stats - Get system statistics
export async function GET() {
  try {
    const stats = storage.getStats();
    
    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    const errorResponse = handleApiError(createError('Failed to fetch statistics', 500, 'FETCH_STATS_ERROR'));
    return NextResponse.json(errorResponse.body, { status: errorResponse.status });
  }
} 