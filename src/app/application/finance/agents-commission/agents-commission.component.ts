import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';

interface CommissionData {
  no: string;
  empId: string;
  noOfCustomers: number;
  totalOrderValue: number;
  eligibility: string;
  commission: number | string;
  month: string;
}

interface FilterOption {
  label: string;
  value: string;
}

interface MonthOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-agents-commission',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    LoadingSpinnerComponent,
    FormsModule,
    CalendarModule,
  ],
  templateUrl: './agents-commission.component.html',
  styleUrl: './agents-commission.component.css',
})
export class AgentsCommissionComponent {
  isLoading = false;
  commissionData: CommissionData[] = [];
  filteredCommissionData: CommissionData[] = [];
  
  // Eligibility filter options
  filterOptions: FilterOption[] = [
    { label: 'Eligible', value: 'eligible' },
    { label: 'Not Eligible', value: 'notEligible' },
    { label: 'All', value: 'all' }
  ];
  selectedFilter = 'eligible';
  
  // Month filter options
  monthOptions: MonthOption[] = [
    { label: 'January', value: '1' },
    { label: 'February', value: '2' },
    { label: 'March', value: '3' },
    { label: 'April', value: '4' },
    { label: 'May', value: '5' },
    { label: 'June', value: '6' },
    { label: 'July', value: '7' },
    { label: 'August', value: '8' },
    { label: 'September', value: '9' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' }
  ];
  selectedMonth = 'all';
  
  searchQuery = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadDummyData();
    this.applyFilters();
  }

  loadDummyData(): void {
    // Expanded data with different months for testing
    this.commissionData = [
      {
        no: '001',
        empId: 'SA00004',
        noOfCustomers: 101,
        totalOrderValue: 1000000.00,
        eligibility: 'Eligible',
        commission: 8585.00,
        month: 'June'
      },
      {
        no: '002',
        empId: 'SA00005',
        noOfCustomers: 205,
        totalOrderValue: 800000.00,
        eligibility: 'Eligible',
        commission: 23575.00,
        month: 'June'
      },
      {
        no: '003',
        empId: 'SA00006',
        noOfCustomers: 201,
        totalOrderValue: 200000.00,
        eligibility: 'Eligible',
        commission: 200000.00,
        month: 'May'
      },
      {
        no: '004',
        empId: 'SA00007',
        noOfCustomers: 450,
        totalOrderValue: 850000.00,
        eligibility: 'Eligible',
        commission: 74250.00,
        month: 'May'
      },
      {
        no: '005',
        empId: 'SA00008',
        noOfCustomers: 90,
        totalOrderValue: 50000.00,
        eligibility: 'Not Eligible',
        commission: '--',
        month: 'June'
      },
      {
        no: '006',
        empId: 'SA00009',
        noOfCustomers: 150,
        totalOrderValue: 300000.00,
        eligibility: 'Eligible',
        commission: 15000.00,
        month: 'July'
      },
      {
        no: '007',
        empId: 'SA00010',
        noOfCustomers: 80,
        totalOrderValue: 40000.00,
        eligibility: 'Not Eligible',
        commission: '--',
        month: 'July'
      }
    ];
  }

  applyFilters(): void {
    let filtered = this.commissionData;
    
    // Filter by eligibility
    if (this.selectedFilter === 'eligible') {
      filtered = filtered.filter(item => item.eligibility === 'Eligible');
    } else if (this.selectedFilter === 'notEligible') {
      filtered = filtered.filter(item => item.eligibility === 'Not Eligible');
    }
    
    // Filter by month
    if (this.selectedMonth !== 'all') {
      filtered = filtered.filter(item => item.month === this.selectedMonth);
    }
    
    // Filter by search query
    if (this.searchQuery.trim()) {
      filtered = filtered.filter(item => 
        item.empId.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    
    this.filteredCommissionData = filtered;
  }

  back(): void {
    this.router.navigate(['finance/action']);
  }

  getTotalOrders(): number {
    return this.filteredCommissionData.length;
  }

  onFilterChange(event: any): void {
    this.selectedFilter = event.value;
    this.applyFilters();
  }

  onMonthChange(event: any): void {
    this.selectedMonth = event.value;
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  downloadData(): void {
    this.isLoading = true;
    // Simulate download process
    setTimeout(() => {
      console.log('Downloading data:', this.filteredCommissionData);
      this.isLoading = false;
      alert('Data downloaded successfully!');
    }, 1000);
  }
}