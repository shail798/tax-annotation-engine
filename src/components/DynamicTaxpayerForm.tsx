'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormSection, FieldRequirement, getFieldValue, setFieldValue } from '@/lib/formAnalyzer';
import { getInputType, getMaxLength, getPlaceholder, isCheckboxChecked, formatCheckboxValue } from '@/lib/fieldTypeUtils';

interface DynamicTaxpayerFormProps {
  sections: FormSection[];
  data: Record<string, any>;
  onDataChange: (newData: Record<string, any>) => void;
}

interface DynamicFieldProps {
  field: FieldRequirement;
  value: any;
  onChange: (value: string | number) => void;
}

const DynamicField: React.FC<DynamicFieldProps> = ({ field, value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (field.type === 'checkbox') {
      // For checkboxes, send checkmark like real IRS forms
      onChange(formatCheckboxValue(e.target.checked));
    } else {
      const newValue = field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
      onChange(newValue);
    }
  };

  // For checkboxes, determine if checked based on value
  const isChecked = field.type === 'checkbox' ? isCheckboxChecked(value) : false;

  return (
    <div className="space-y-2 animate-in fade-in-50 duration-300">
      <Label htmlFor={field.path} className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {field.type === 'checkbox' ? (
        <div className="flex items-center space-x-2">
          <input
            id={field.path}
            type="checkbox"
            checked={isChecked}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
          />
          <span className="text-sm text-gray-600">
            {isChecked ? 'Yes' : 'No'}
          </span>
        </div>
      ) : (
        <Input
          id={field.path}
          type={getInputType(field.type)}
          value={value || ''}
          onChange={handleChange}
          placeholder={getPlaceholder(field.type, field.placeholder)}
          maxLength={getMaxLength(field.type, field.maxLength)}
          className={`transition-colors ${field.required ? 'border-gray-300 focus:border-blue-500' : 'border-gray-200 focus:border-gray-400'}`}
          required={field.required}
        />
      )}
      
      {field.type === 'ssn' && (
        <p className="text-xs text-gray-500">Enter 9 digits without dashes</p>
      )}
      {field.type === 'state' && (
        <p className="text-xs text-gray-500">2-letter state code (e.g., NY, CA)</p>
      )}
      {field.type === 'checkbox' && (
        <p className="text-xs text-gray-500">Check if applicable</p>
      )}
    </div>
  );
};

const FormSectionComponent: React.FC<{
  section: FormSection;
  data: Record<string, any>;
  onDataChange: (newData: Record<string, any>) => void;
}> = ({ section, data, onDataChange }) => {
  const handleFieldChange = (fieldPath: string, value: string | number) => {
    const newData = setFieldValue(data, fieldPath, value);
    onDataChange(newData);
  };

  // Determine grid layout based on field count
  const getGridLayout = () => {
    const fieldCount = section.fields.length;
    if (fieldCount === 1) return 'grid-cols-1';
    if (fieldCount === 2) return 'grid-cols-2';
    if (fieldCount <= 4) return 'grid-cols-2';
    return 'grid-cols-2 lg:grid-cols-3';
  };

  return (
    <Card className="mb-4 animate-in slide-in-from-bottom-2 duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {section.title}
          <span className="text-sm font-normal text-gray-500">
            ({section.fields.length} field{section.fields.length !== 1 ? 's' : ''})
          </span>
        </CardTitle>
        <CardDescription>
          {section.fields.filter(f => f.required).length > 0 && (
            <span className="text-sm text-gray-600">
              Fields marked with <span className="text-red-500">*</span> are required
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-4 ${getGridLayout()}`}>
          {section.fields.map((field) => (
            <DynamicField
              key={field.path}
              field={field}
              value={getFieldValue(data, field.path)}
              onChange={(value) => handleFieldChange(field.path, value)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const DynamicTaxpayerForm: React.FC<DynamicTaxpayerFormProps> = ({
  sections,
  data,
  onDataChange,
}) => {
  if (sections.length === 0) {
    return (
      <Card className="animate-in fade-in-50 duration-300">
        <CardContent className="p-8 text-center">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-1">No form template selected</p>
          <p className="text-sm text-gray-400">Select a form template above to see required fields</p>
        </CardContent>
      </Card>
    );
  }

  const totalFields = sections.reduce((total, section) => total + section.fields.length, 0);
  const requiredFields = sections.reduce((total, section) => 
    total + section.fields.filter(f => f.required).length, 0
  );

  return (
    <div className="space-y-4">
      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200 animate-in slide-in-from-top-2 duration-300">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Form Requirements
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-600 font-medium">Sections:</span>
            <span className="ml-2 text-blue-800">{sections.length}</span>
          </div>
          <div>
            <span className="text-blue-600 font-medium">Total Fields:</span>
            <span className="ml-2 text-blue-800">{totalFields}</span>
          </div>
          <div>
            <span className="text-blue-600 font-medium">Required:</span>
            <span className="ml-2 text-blue-800">{requiredFields}</span>
          </div>
          <div>
            <span className="text-blue-600 font-medium">Optional:</span>
            <span className="ml-2 text-blue-800">{totalFields - requiredFields}</span>
          </div>
        </div>
      </div>

      {sections.map((section, index) => (
        <FormSectionComponent
          key={`${section.title}-${index}`}
          section={section}
          data={data}
          onDataChange={onDataChange}
        />
      ))}

      {data && Object.keys(data).length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Current Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-32">
              {JSON.stringify(data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DynamicTaxpayerForm; 