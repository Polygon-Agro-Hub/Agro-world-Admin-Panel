import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { DropdownModule } from 'primeng/dropdown';

interface Transaction {
  no: string;
  investorId: string;
  transactionId: string;
  investorPhone: string;
  noShares: number;
  totalAmount: number;
  dateTime: string;
  nicFrontImage: boolean;
  nicBackImage: boolean;
  bankSlip: boolean;
  status: 'To Review' | 'Accepted' | 'Rejected';
}

@Component({
  selector: 'app-project-investments-transactions',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, DropdownModule],
  templateUrl: './project-investments-transactions.component.html',
  styleUrl: './project-investments-transactions.component.css',
})
export class ProjectInvestmentsTransactionsComponent {
  isLoading = false;
  
  // Dummy data based on the image
  transactions: Transaction[] = [
    {
      no: '001',
      investorId: 'IR2511200001',
      transactionId: 'IR2511200001-0001',
      investorPhone: '-788767500',
      noShares: 100,
      totalAmount: 1000000.00,
      dateTime: '11:00PM on June 01, 2026',
      nicFrontImage: true,
      nicBackImage: true,
      bankSlip: true,
      status: 'To Review'
    },
    {
      no: '002',
      investorId: 'IR2511200002',
      transactionId: 'IR2511200002-0002',
      investorPhone: '-788767500',
      noShares: 100,
      totalAmount: 500000.00,
      dateTime: '11:00PM on June 01, 2026',
      nicFrontImage: true,
      nicBackImage: true,
      bankSlip: true,
      status: 'Accepted'
    },
    {
      no: '003',
      investorId: 'IR2511200002',
      transactionId: 'IR2511200002-0003',
      investorPhone: '-788767500',
      noShares: 100,
      totalAmount: 500000.00,
      dateTime: '11:00PM on June 01, 2026',
      nicFrontImage: true,
      nicBackImage: true,
      bankSlip: true,
      status: 'Rejected'
    }
  ];

  // Method to format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  // Method to get status class for styling
  getStatusClass(status: string): string {
    switch (status) {
      case 'To Review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }
}