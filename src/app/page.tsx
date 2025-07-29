'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formApi, FormTemplate, FilledField, ValidationError } from '@/lib/api';
import FormRenderer from '@/components/FormRenderer';
import DynamicTaxpayerForm from '@/components/DynamicTaxpayerForm';
import { analyzeTemplate, DynamicFormStructure } from '@/lib/formAnalyzer';
import { toast } from 'sonner';

export default function HomePage() {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [filledFields, setFilledFields] = useState<FilledField[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  
  // Dynamic form structure based on selected template
  const [formStructure, setFormStructure] = useState<DynamicFormStructure>({
    sections: [],
    dataStructure: {}
  });
  const [taxpayerData, setTaxpayerData] = useState<Record<string, any>>({});

  // Load templates on component mount
  useEffect(() => {
    loadTemplates();
  }, []);

  // Update form structure when template changes
  useEffect(() => {
    if (selectedTemplate) {
      const newFormStructure = analyzeTemplate(selectedTemplate);
      setFormStructure(newFormStructure);
      setTaxpayerData(newFormStructure.dataStructure);
      
      // Clear previous form results
      setFilledFields([]);
      setValidationErrors([]);
      
      toast.info(`Form updated for ${selectedTemplate.form_name}`, {
        description: `${newFormStructure.sections.length} sections with ${newFormStructure.sections.reduce((total, section) => total + section.fields.length, 0)} fields`
      });
    }
  }, [selectedTemplate]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await formApi.getTemplates();
      setTemplates(data.templates);
      if (data.templates.length > 0) {
        setSelectedTemplate(data.templates[0]); // Auto-select first template
      }
      toast.success(`Loaded ${data.templates.length} templates`);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load form templates');
    } finally {
      setLoading(false);
    }
  };

  const handleFillForm = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a form template');
      return;
    }

    try {
      setLoading(true);
      const result = await formApi.fillForm(selectedTemplate.template_id, taxpayerData as any);
      
      setFilledFields(result.fields);
      setValidationErrors(result.validation_errors);
      
      if (result.validation_status === 'valid') {
        toast.success('Form filled successfully!');
      } else {
        toast.warning(`Form filled with ${result.validation_errors.length} validation errors`);
      }
    } catch (error) {
      console.error('Failed to fill form:', error);
      toast.error('Failed to fill form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Tax Form Annotation System
          </h1>
          <p className="text-lg text-gray-600">
            Demo: Fill tax forms with automated field mapping and formatting
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Input Form */}
          <div className="space-y-6">
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle>1. Select Form Template</CardTitle>
                <CardDescription>
                  Choose a tax form template to fill
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select
                    value={selectedTemplate?.template_id || ''}
                    onValueChange={(value) => {
                      const template = templates.find(t => t.template_id === value);
                      setSelectedTemplate(template || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a form template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.template_id} value={template.template_id}>
                          {template.form_name} ({template.tax_year})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedTemplate && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      <p><strong>Form Type:</strong> {selectedTemplate.form_type}</p>
                      <p><strong>Version:</strong> {selectedTemplate.version}</p>
                      <p><strong>Template Fields:</strong> {selectedTemplate.annotations.length}</p>
                      <p><strong>Required Sections:</strong> {formStructure.sections.length}</p>
                      <p><strong>Input Fields:</strong> {formStructure.sections.reduce((total, section) => total + section.fields.length, 0)}</p>
                      <p><strong>Pages:</strong> {selectedTemplate.page_count}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Dynamic Taxpayer Data Input */}
            <Card>
              <CardHeader>
                <CardTitle>2. Enter Required Information</CardTitle>
                <CardDescription>
                  Fields change automatically based on the selected form template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DynamicTaxpayerForm
                  sections={formStructure.sections}
                  data={taxpayerData}
                  onDataChange={setTaxpayerData}
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>3. Generate Form</CardTitle>
                <CardDescription>
                  Process the data and generate the filled form
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleFillForm} 
                  disabled={loading || !selectedTemplate}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Processing...' : 'Fill Form'}
                </Button>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <h5 className="font-medium text-red-800 mb-2">Validation Errors:</h5>
                    <ul className="text-sm text-red-700 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>
                          <strong>{error.field_id}:</strong> {error.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Form Display */}
          <div>
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Generated Form</CardTitle>
                <CardDescription>
                  {filledFields.length > 0 
                    ? `Showing ${filledFields.length} filled fields` 
                    : 'Fill the form to see the result here'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filledFields.length > 0 ? (
                  <FormRenderer
                    fields={filledFields}
                    title={selectedTemplate?.form_name || 'Tax Form'}
                    scale={0.9}
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>No form data yet</p>
                    <p className="text-sm mt-2">Enter taxpayer information and click "Fill Form"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
