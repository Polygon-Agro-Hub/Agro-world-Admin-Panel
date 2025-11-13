import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { FinanceService } from '../../../services/finance/finance.service';
import { HttpClient } from '@angular/common/http'; // Add this import

interface FarmerPayment {
  id: number;
  invNo: string;
  farmerName: string;
  NICnumber: string;
  phoneNumber: string;
  totalPayment: number;
  bankName: string;
  branchName: string;
  accNumber: string;
  createdAt: string;
}

interface BankOption {
  label: string;
  value: string;
}

// Add Bank interface
interface Bank {
  ID: number;
  name: string;
}

@Component({
  selector: 'app-farmer-payments',
  standalone: true,
  imports: [
    CommonModule, 
    DropdownModule, 
    CalendarModule,
    LoadingSpinnerComponent, 
    FormsModule
  ],
  templateUrl: './farmer-payments.component.html',
  styleUrl: './farmer-payments.component.css'
})
export class FarmerPaymentsComponent implements OnInit {
  isLoading = false;
  isDownloading = false;
  hasData: boolean = true;
  farmerPayments: FarmerPayment[] = [];
  filteredPayments: FarmerPayment[] = [];
  
  // Filter properties
  selectedBank: string = '';
  selectedDate: Date | null = null;
  searchTerm: string = '';

  // Dropdown options
  bankOptions: BankOption[] = [];
  banks: Bank[] = []; // Add banks array

  constructor(
    private router: Router,
    private financeService: FinanceService,
    private http: HttpClient // Add HttpClient
  ) { }

  ngOnInit(): void {
    this.loadBanks(); // Load banks first
    this.loadFarmerPayments();
  }

  // Add this method to load banks from JSON
  loadBanks(): void {
    this.http.get<Bank[]>('assets/json/banks.json').subscribe({
      next: (data) => {
        this.banks = data.sort((a, b) => a.name.localeCompare(b.name));
        this.bankOptions = this.banks.map(bank => ({
          label: bank.name,
          value: bank.name
        }));
      },
      error: (error) => {
        console.error('Error loading banks:', error);
        // Fallback: populate from existing data if JSON fails
        this.populateBankOptionsFromData();
      }
    });
  }

  loadFarmerPayments(): void {
    this.isLoading = true;
    
    const dateParam = this.selectedDate ? this.formatDateForApi(this.selectedDate) : '';
    
    this.financeService.getAllFarmerPayments(dateParam, this.selectedBank)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.status && response.data) {
            this.farmerPayments = response.data;
            this.filteredPayments = [...this.farmerPayments];
            this.hasData = this.filteredPayments.length > 0;
            
            // If banks weren't loaded from JSON, populate from data
            if (this.bankOptions.length === 0) {
              this.populateBankOptionsFromData();
            }
          } else {
            this.hasData = false;
            this.farmerPayments = [];
            this.filteredPayments = [];
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error loading farmer payments:', error);
          this.hasData = false;
          this.farmerPayments = [];
          this.filteredPayments = [];
        }
      });
  }

  // Rename this method to avoid confusion
  populateBankOptionsFromData(): void {
    const uniqueBanks = [...new Set(this.farmerPayments
      .filter(payment => payment.bankName)
      .map(payment => payment.bankName))];
    
    this.bankOptions = uniqueBanks.map(bank => ({
      label: bank,
      value: bank
    })).sort((a, b) => a.label.localeCompare(b.label));
  }

  onBankChange(event: any): void {
    this.selectedBank = event.value;
    this.applyFilters();
  }

  onDateChange(event: any): void {
    this.selectedDate = event;
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  clearDate(): void {
    this.selectedDate = null;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.farmerPayments];

    // Apply bank filter
    if (this.selectedBank) {
      filtered = filtered.filter(payment => 
        payment.bankName === this.selectedBank
      );
    }

    // Apply date filter
    if (this.selectedDate) {
      const selectedDateStr = this.formatDateForApi(this.selectedDate);
      filtered = filtered.filter(payment => 
        payment.createdAt.startsWith(selectedDateStr)
      );
    }

    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(payment =>
        payment.farmerName.toLowerCase().includes(searchLower) ||
        payment.NICnumber.toLowerCase().includes(searchLower) ||
        payment.phoneNumber.includes(searchLower)
      );
    }

    this.filteredPayments = filtered;
    this.hasData = filtered.length > 0;
  }

  refreshData(): void {
    this.selectedBank = '';
    this.selectedDate = null;
    this.searchTerm = '';
    this.loadFarmerPayments();
  }

  // Helper method to format date for API
  private formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  downloadData(): void {
    if (this.filteredPayments.length === 0) {
      console.warn('No data to download');
      alert('No data available to download');
      return;
    }

    this.isDownloading = true;

    try {
      // Prepare data for Excel
      const excelData = this.prepareExcelData();
      
      // Create worksheet
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths for better readability
      const colWidths = [
        { wch: 5 },   // No
        { wch: 15 },  // Invoice No
        { wch: 25 },  // Farmer Name
        { wch: 15 },  // NIC Number
        { wch: 15 },  // Phone Number
        { wch: 15 },  // Amount
        { wch: 12 },  // Date
        { wch: 20 },  // Account Number
        { wch: 20 },  // Bank Name
        { wch: 20 }   // Branch Name
      ];
      ws['!cols'] = colWidths;

      // Add header style
      if (ws['!ref']) {
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
          if (ws[cellAddress]) {
            // Make header cells bold
            if (!ws[cellAddress].s) {
              ws[cellAddress].s = {};
            }
            ws[cellAddress].s = {
              font: { bold: true },
              alignment: { horizontal: 'center' },
              fill: { fgColor: { rgb: "D3D3D3" } } // Light gray background
            };
          }
        }
      }

      // Create workbook
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Farmer Payments');
      
      // Generate file name with timestamp
      const fileName = `Farmer_Payments_${this.getCurrentTimestamp()}.xlsx`;
      
      // Save the file
      XLSX.writeFile(wb, fileName);
      
      console.log('Excel file downloaded successfully');
      
    } catch (error) {
      console.error('Error downloading Excel file:', error);
      alert('Error downloading Excel file. Please try again.');
    } finally {
      this.isDownloading = false;
    }
  }

  private prepareExcelData(): any[] {
    return this.filteredPayments.map((payment, index) => ({
      'No': index + 1,
      'Invoice No': payment.invNo || 'N/A',
      'Farmer Name': payment.farmerName || 'N/A',
      'NIC Number': payment.NICnumber || 'N/A',
      'Phone Number': payment.phoneNumber || 'N/A',
      'Amount (LKR)': payment.totalPayment || 0,
      'Date': this.formatDate(payment.createdAt),
      'Account Number': payment.accNumber || 'N/A',
      'Bank Name': payment.bankName || 'N/A',
      'Branch Name': payment.branchName || 'N/A'
    }));
  }

  private getCurrentTimestamp(): string {
    const now = new Date();
    return now.toISOString()
      .replace(/[-:]/g, '')
      .replace(/\..+/, '')
      .replace('T', '_');
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return dateString.split('T')[0];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  }

  getTotalAmount(): number {
    return this.filteredPayments.reduce((sum, payment) => sum + (payment.totalPayment || 0), 0);
  }

  getTotalRecords(): number {
    return this.filteredPayments.length;
  }

  back(): void {
    this.router.navigate(['finance/action']);
  }
}