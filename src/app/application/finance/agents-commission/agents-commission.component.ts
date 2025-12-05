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
  filterOptions = [
    { label: 'Eligible', value: 'eligible' },
    { label: 'Not Eligible', value: 'notEligible' },
    { label: 'All', value: 'all' }
  ];
  selectedFilter = 'eligible';
  searchQuery = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadDummyData();
  }

  loadDummyData(): void {
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
        month: 'June'
      },
      {
        no: '004',
        empId: 'SA00007',
        noOfCustomers: 450,
        totalOrderValue: 850000.00,
        eligibility: 'Eligible',
        commission: 74250.00,
        month: 'June'
      },
      {
        no: '005',
        empId: 'SA00008',
        noOfCustomers: 90,
        totalOrderValue: 50000.00,
        eligibility: 'Not Eligible',
        commission: '--',
        month: 'June'
      }
    ];
  }

  back(): void {
    this.router.navigate(['finance/action']);
  }

  get filteredData(): CommissionData[] {
    let filtered = this.commissionData;
    
    // Filter by eligibility
    if (this.selectedFilter === 'eligible') {
      filtered = filtered.filter(item => item.eligibility === 'Eligible');
    } else if (this.selectedFilter === 'notEligible') {
      filtered = filtered.filter(item => item.eligibility === 'Not Eligible');
    }
    
    // Filter by search query
    if (this.searchQuery.trim()) {
      filtered = filtered.filter(item => 
        item.empId.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }

  getTotalOrders(): number {
    return this.commissionData.filter(item => item.eligibility === 'Eligible').length;
  }

  onFilterChange(event: any): void {
    this.selectedFilter = event.value;
  }

  onSearch(): void {
    // Filter logic is handled in the getter
  }

  clearSearch(): void {
    this.searchQuery = '';
  }

  downloadData(): void {
    this.isLoading = true;
    // Simulate download process
    setTimeout(() => {
      console.log('Downloading data:', this.filteredData);
      this.isLoading = false;
      alert('Data downloaded successfully!');
    }, 1000);
  }
}