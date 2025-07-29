'use client';

import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { FilledField } from '@/lib/api';

export interface FormRendererProps {
  fields: FilledField[];
  title?: string;
  scale?: number;
}

interface PageProps {
  pageNumber: number;
  fields: FilledField[];
  scale: number;
}

const FormPage: React.FC<PageProps> = ({ pageNumber, fields, scale }) => {
  const pageFields = fields.filter(field => field.position.page === pageNumber);
  
  if (pageFields.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Page {pageNumber}</CardTitle>
      </CardHeader>

      <div 
        className="relative mt-10 bg-white"
        style={{
          width: `${612 * scale}px`, // US Letter width at 72 DPI
          height: `${792 * scale}px`, // US Letter height at 72 DPI
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {pageFields.map((field) => {
          // Determine if this is a checkbox field based on field_id or display_value
          const isCheckboxField = field.field_id.includes('filing_status') || 
                                   field.field_id.includes('presidential_campaign') || 
                                   field.field_id.includes('digital_assets') ||
                                   (field.display_value === '✓' || field.display_value === 'X' || field.display_value === '');

          // Check if field has meaningful content
          const hasValue = field.display_value && field.display_value.trim() !== '';
          
          return (
            <div
              key={field.field_id}
              className={`absolute flex items-center justify-center px-1 text-xs font-mono ${
                field.formatted ? 'text-blue-900' : 'text-gray-800'
              } ${isCheckboxField && hasValue ? 'border border-gray-600 bg-white text-black font-bold' : ''} ${
                !hasValue ? 'opacity-20' : ''
              }`}
              style={{
                left: `${field.position.x}px`,
                top: `${field.position.y}px`,
                width: `${field.position.width}px`,
                height: `${field.position.height}px`,
                fontSize: `${Math.min(field.position.height * 0.8, 12)}px`,
                lineHeight: `${field.position.height}px`,
              }}
              title={field.display_value}
            >
              <span className={`${isCheckboxField ? 'font-bold text-center' : 'truncate'}`}>
                {field.display_value}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export const FormRenderer: React.FC<FormRendererProps> = ({ 
  fields, 
  title = "Tax Form", 
  scale = 0.5
}) => {
  // Get unique page numbers and sort them
  const pageNumbers = Array.from(new Set(fields.map(field => field.position.page))).sort((a, b) => a - b);

  if (fields.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">No form data to display</p>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Form header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{fields.length} field(s) filled</span>
          <span>Scale: {Math.round(scale * 100)}%</span>
        </div>
      </div>

      {/* Render pages */}
      <div className="space-y-6">
        {pageNumbers.map(pageNumber => (
          <FormPage
            key={pageNumber}
            pageNumber={pageNumber}
            fields={fields}
            scale={scale}
          />
        ))}
      </div>
    </div>
  );
};

export default FormRenderer; 