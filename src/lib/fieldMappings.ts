import type { FieldRequirement } from './formAnalyzer';

// Mapping of data paths to human-readable information
export const FIELD_MAPPINGS: Record<string, {
  label: string;
  type: FieldRequirement['type'];
  section: string;
  placeholder?: string;
}> = {
  // Primary taxpayer
  'taxpayer.firstName': { label: 'First Name', type: 'text', section: 'Primary Taxpayer' },
  'taxpayer.lastName': { label: 'Last Name', type: 'text', section: 'Primary Taxpayer' },
  'taxpayer.ssn': { label: 'Social Security Number', type: 'ssn', section: 'Primary Taxpayer', placeholder: '123456789' },
  
  // Spouse
  'spouse.firstName': { label: 'First Name', type: 'text', section: 'Spouse (if filing jointly)' },
  'spouse.lastName': { label: 'Last Name', type: 'text', section: 'Spouse (if filing jointly)' },
  'spouse.ssn': { label: 'Social Security Number', type: 'ssn', section: 'Spouse (if filing jointly)', placeholder: '987654321' },
  
  // Address
  'taxpayer.address.street': { label: 'Street Address', type: 'text', section: 'Address Information' },
  'taxpayer.address.city': { label: 'City', type: 'text', section: 'Address Information' },
  'taxpayer.address.state': { label: 'State', type: 'state', section: 'Address Information', placeholder: 'NY' },
  'taxpayer.address.zip': { label: 'ZIP Code', type: 'zip', section: 'Address Information', placeholder: '10001' },
  'taxpayer.address.cityStateZip': { label: 'City, State, ZIP', type: 'text', section: 'Address Information' },
  
  // Income (1040)
  'income.wages': { label: 'Wages and Salaries', type: 'number', section: 'Income Information' },
  'income.w2': { label: 'W-2 Wages', type: 'number', section: 'Income Information' },
  'income.interest': { label: 'Interest Income', type: 'number', section: 'Income Information' },
  'income.dividends': { label: 'Dividend Income', type: 'number', section: 'Income Information' },
  'income.socialSecurity': { label: 'Social Security Benefits', type: 'number', section: 'Income Information' },
  'income.retirement': { label: 'Retirement Income', type: 'number', section: 'Income Information' },
  'income.unemployment': { label: 'Unemployment Compensation', type: 'number', section: 'Income Information' },
  
  // Employee data (W-2)
  'employee.fullName': { label: 'Employee Full Name', type: 'text', section: 'Employee Information' },
  'employee.ssn': { label: 'Employee SSN', type: 'ssn', section: 'Employee Information', placeholder: '123456789' },
  
  // W-2 specific
  'wages.total': { label: 'Total Wages and Tips', type: 'number', section: 'Wage Information' },
  'taxes.federal': { label: 'Federal Income Tax Withheld', type: 'number', section: 'Tax Information' },

  // Filing Status & Elections
  'filingStatus.single': { label: 'Single', type: 'checkbox', section: 'Filing Status' },
  'filingStatus.marriedJoint': { label: 'Married Filing Jointly', type: 'checkbox', section: 'Filing Status' },
  'filingStatus.marriedSeparate': { label: 'Married Filing Separately', type: 'checkbox', section: 'Filing Status' },
  'taxpayer.presidentialCampaign': { label: 'Presidential Campaign Fund (You)', type: 'checkbox', section: 'Elections' },
  'spouse.presidentialCampaign': { label: 'Presidential Campaign Fund (Spouse)', type: 'checkbox', section: 'Elections' },
  'digitalAssets': { label: 'Digital Assets', type: 'checkbox', section: 'Elections' },

  // Dependents
  'dependents[0].firstName': { label: 'Dependent 1 - First Name', type: 'text', section: 'Dependents Information' },
  'dependents[0].lastName': { label: 'Dependent 1 - Last Name', type: 'text', section: 'Dependents Information' },
  'dependents[0].ssn': { label: 'Dependent 1 - SSN', type: 'ssn', section: 'Dependents Information' },
  'dependents[0].relationship': { label: 'Dependent 1 - Relationship', type: 'text', section: 'Dependents Information' },
  'dependents[1].firstName': { label: 'Dependent 2 - First Name', type: 'text', section: 'Dependents Information' },
  'dependents[1].lastName': { label: 'Dependent 2 - Last Name', type: 'text', section: 'Dependents Information' },
  'dependents[1].ssn': { label: 'Dependent 2 - SSN', type: 'ssn', section: 'Dependents Information' },
  'dependents[1].relationship': { label: 'Dependent 2 - Relationship', type: 'text', section: 'Dependents Information' },

  // Tax Calculations
  'calculations.totalIncome': { label: 'Total Income', type: 'number', section: 'Tax Calculations' },
  'calculations.taxableIncome': { label: 'Taxable Income', type: 'number', section: 'Tax Calculations' },
  'calculations.taxOwed': { label: 'Tax Owed', type: 'number', section: 'Tax Calculations' },
  'calculations.refund': { label: 'Refund Amount', type: 'number', section: 'Tax Calculations' },

  // Deductions
  'deductions.standard': { label: 'Standard Deduction', type: 'number', section: 'Deductions' },

  // Payments
  'payments.withheld': { label: 'Federal Tax Withheld', type: 'number', section: 'Payments' },
};

// Section order configuration
export const SECTION_ORDER = [
  'Primary Taxpayer',
  'Spouse (if filing jointly)',
  'Address Information',
  'Filing Status',
  'Elections',
  'Dependents Information',
  'Employee Information',
  'Income Information',
  'Wage Information',
  'Deductions',
  'Tax Calculations',
  'Payments',
  'Tax Information',
  'Other Information'
]; 