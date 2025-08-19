import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmailvalidationsService {
  // Validation error messages
  public readonly validationMessages = {
    required: 'Email is required',
    invalidFormat: 'Please enter a valid email in the format: example@domain.com',
    consecutiveDots: 'Email cannot contain consecutive dots',
    leadingDot: 'Email cannot start with a dot',
    trailingDot: 'Email cannot end with a dot',
    invalidCharacters: 'Email contains invalid characters. Only letters, numbers, and + . - _ are allowed',
    noAtSymbol: 'Email must contain @ symbol',
    invalidDomain: 'Invalid domain format',
    emptyLocalPart: 'Email must have a local part before @',
    emptyDomain: 'Email must have a domain after @'
  };

  constructor() { }

  /**
   * Validates email format with detailed error messages
   */
  validateEmail(email: string): { isValid: boolean; errorMessage?: string } {
    if (!email || email.trim() === '') {
      return { isValid: false, errorMessage: this.validationMessages.required };
    }

    const trimmedEmail = email.trim();
    
    // Check for @ symbol
    if (!trimmedEmail.includes('@')) {
      return { isValid: false, errorMessage: this.validationMessages.noAtSymbol };
    }

    const [localPart, domainPart] = trimmedEmail.split('@');
    
    // Check if local part exists
    if (!localPart || localPart === '') {
      return { isValid: false, errorMessage: this.validationMessages.emptyLocalPart };
    }

    // Check if domain part exists
    if (!domainPart || domainPart === '') {
      return { isValid: false, errorMessage: this.validationMessages.emptyDomain };
    }

    // Check for consecutive dots
    if (/(\.\.)/.test(localPart) || /(\.\.)/.test(domainPart)) {
      return { isValid: false, errorMessage: this.validationMessages.consecutiveDots };
    }

    // Check for leading dot
    if (localPart.startsWith('.') || domainPart.startsWith('.')) {
      return { isValid: false, errorMessage: this.validationMessages.leadingDot };
    }

    // Check for trailing dot
    if (localPart.endsWith('.') || domainPart.endsWith('.')) {
      return { isValid: false, errorMessage: this.validationMessages.trailingDot };
    }

    // Check for invalid characters - only allow letters, numbers, and + . - _
    const localPartRegex = /^[a-zA-Z0-9.+_-]+$/;
    const domainPartRegex = /^[a-zA-Z0-9.-]+$/;
    
    if (!localPartRegex.test(localPart)) {
      return { isValid: false, errorMessage: this.validationMessages.invalidCharacters };
    }

    if (!domainPartRegex.test(domainPart)) {
      return { isValid: false, errorMessage: this.validationMessages.invalidDomain };
    }

    // Check domain has at least one dot and valid TLD
    if (!/\./.test(domainPart) || domainPart.split('.').pop()!.length < 2) {
      return { isValid: false, errorMessage: this.validationMessages.invalidDomain };
    }

    // General email regex validation (final check)
    const emailRegex = /^[a-zA-Z0-9.+_-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { isValid: false, errorMessage: this.validationMessages.invalidFormat };
    }

    return { isValid: true };
  }

  /**
   * Simple boolean validation for form controls
   */
  isEmailValid(email: string): boolean {
    return this.validateEmail(email).isValid;
  }

  /**
   * Get specific error message for reactive forms
   */
  getErrorMessage(email: string): string | null {
    const validation = this.validateEmail(email);
    return validation.isValid ? null : validation.errorMessage!;
  }
}