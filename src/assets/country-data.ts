export interface Country {
    name: string;
    code: string;       // ISO 2-letter country code
    dialCode: string;   // e.g., +94
  }
  
  export const COUNTRIES: Country[] = [
    { name: 'Sri Lanka', code: 'lk', dialCode: '+94' },
    { name: 'India', code: 'in', dialCode: '+91' },
    { name: 'United States', code: 'us', dialCode: '+1' }
  ];
  