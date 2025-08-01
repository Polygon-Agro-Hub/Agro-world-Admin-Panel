export interface Country {
    name: string;
    code: string;       // ISO 2-letter country code
    dialCode: string;   // e.g., +94
  }
  
  export const COUNTRIES: Country[] = [
    { name: 'Sri Lanka', code: 'lk', dialCode: '+94' },
    { name: 'Vietnam', code: 'vn', dialCode: '+84' },
    { name: 'Cambodia', code: 'kh', dialCode: '+855' },
    { name: 'Bangladesh', code: 'bd', dialCode: '+880' },
    { name: 'India', code: 'in', dialCode: '+91' },
    { name: 'Netherlands', code: 'nl', dialCode: '+31' }
  ];
  