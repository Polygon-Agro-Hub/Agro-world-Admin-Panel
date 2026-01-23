import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-investment-info-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './investment-info-tab.component.html',
  styleUrl: './investment-info-tab.component.css',
})
export class InvestmentInfoTabComponent {
  @Input() investmentObj!: IInvestment;
  @Input() currentPage: number = 5;
  @Input() totalPages: number = 11;
  @Output() nextPage = new EventEmitter<void>();
  @Output() previousPage = new EventEmitter<void>();

  onNextPage(): void {
    this.nextPage.emit();
  }

  onPreviousPage(): void {
    this.previousPage.emit();
  }

  // Method to format the expected investment value
  formatExpectedInvestment(value: string): string {
    if (!value) return 'Rs 0';
    
    // Remove any existing commas and non-digit characters (except decimal point)
    const numericValue = value.replace(/[^\d.]/g, '');
    
    // Format with commas for thousands
    const parts = numericValue.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    const formattedValue = parts.join('.');
    
    // Add Rs prefix
    return `Rs ${formattedValue}`;
  }
}

interface IInvestment {
  expected: string;
  purpose: string;
  repaymentMonth: number;
  createdAt: string;
}