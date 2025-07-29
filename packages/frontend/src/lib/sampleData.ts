// Sample data based on common form types
export const SAMPLE_DATA: Record<string, any> = {
  // Primary taxpayer samples
  'taxpayer.firstName': 'John',
  'taxpayer.lastName': 'Doe', 
  'taxpayer.ssn': '123456789',
  'taxpayer.address.street': '123 Main Street',
  'taxpayer.address.city': 'New York',
  'taxpayer.address.state': 'NY',
  'taxpayer.address.zip': '10001',
  'taxpayer.address.cityStateZip': 'New York, NY 10001',
  'taxpayer.presidentialCampaign': '✓',
  
  // Spouse samples
  'spouse.firstName': 'Jane',
  'spouse.lastName': 'Doe',
  'spouse.ssn': '987654321',
  'spouse.presidentialCampaign': '✓',
  
  // Filing Status
  'filingStatus.single': '',
  'filingStatus.marriedJoint': '✓',
  'filingStatus.marriedSeparate': '',
  
  // Elections
  'digitalAssets': 'No',
  
  // Dependents
  'dependents[0].firstName': 'Sarah',
  'dependents[0].lastName': 'Doe',
  'dependents[0].ssn': '555666777',
  'dependents[0].relationship': 'Daughter',
  'dependents[1].firstName': 'Michael',
  'dependents[1].lastName': 'Doe',
  'dependents[1].ssn': '444333222',
  'dependents[1].relationship': 'Son',
  
  // Income samples
  'income.wages': 75000,
  'income.w2': 75000,
  'income.interest': 1200,
  'income.dividends': 800,
  'income.socialSecurity': 15000,
  'income.retirement': 8000,
  'income.unemployment': 0,
  
  // Employee samples (W-2)
  'employee.fullName': 'John Doe',
  'employee.ssn': '123456789',
  
  // W-2 wage samples
  'wages.total': 75000,
  'taxes.federal': 12000,
  
  // Tax Calculations
  'calculations.totalIncome': 100000,
  'calculations.taxableIncome': 75000,
  'calculations.taxOwed': 15000,
  'calculations.refund': 2500,
  
  // Deductions
  'deductions.standard': 25000,
  
  // Payments
  'payments.withheld': 17500,
}; 