import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Tax Form Annotation System API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
} 