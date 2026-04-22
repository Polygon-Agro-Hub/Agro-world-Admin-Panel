import { CommonModule, Location } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { FinanceService } from '../../../services/finance/finance.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-agents-commission',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    AutoCompleteModule,
    LoadingSpinnerComponent,
    FormsModule,
    CalendarModule,
  ],
  templateUrl: './agents-commission.component.html',
  styleUrl: './agents-commission.component.css',
})
export class AgentsCommissionComponent {
  @ViewChild('commissionForm') commissionForm!: NgForm; // Add this

  agentArr: SalesAgents[] = [];
  filteredAgents: SalesAgents[] = [];
  salesCommisionsArr: SalesCommisions[] = [];
  selectedAgent: SalesAgents | null = null;
  filterObj!: FilterData;
  selectedFilter: string = '';
  fromDate!: Date;
  toDate!: Date;
  deliveredDate!: Date;

  isLoading = true;
  isinit = false;
  hasData = false;

  // Add form submitted flag
  formSubmitted = false;

  // Eligibility filter options
  filterOptions: FilterOption[] = [
    { label: 'Completed', value: 'Completed' },
    { label: 'Pending', value: 'Pending' },
  ];

  constructor(
    private financeService: FinanceService,
    private location: Location,
    public tokenService: TokenService,
    public permissionService: PermissionService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.fetchSalesAgent();
  }

  fetchSalesAgent() {
    this.isLoading = true;
    this.financeService.getSalesAgentForFilters().subscribe((res) => {
      this.agentArr = res.data;
      this.filteredAgents = [...this.agentArr];
      this.isLoading = false;
    });
  }

  filterAgents(event: any) {
    const query = event.query.toLowerCase().trim();
    this.filteredAgents = this.agentArr.filter(
      (agent) =>
        agent.empId.toLowerCase().includes(query) ||
        agent.id.toString().includes(query),
    );
  }

  onAgentSelect(event: any) {
    this.selectedAgent = event.value;
  }

  clearAgent() {
    this.selectedAgent = null;
  }

  genarateData() {
    // Mark form as submitted
    this.formSubmitted = true;

    // Mark all controls as touched to trigger validation display
    if (this.commissionForm) {
      this.markFormGroupTouched(this.commissionForm);
    }

    // Check if form is valid
    if (!this.isFormValid()) {
      return;
    }
    this.isLoading = true;
    // Format dates and create filter object
    this.filterObj = {
      agentId: this.selectedAgent?.id || null,
      paymentStatus: this.selectedFilter,
      fromDate: this.formatDateForAPI(this.fromDate),
      toDate: this.formatDateForAPI(this.toDate),
      deliveredDate: this.formatDateForAPI(this.deliveredDate),
    };

    this.financeService.getAgentCommisons(this.filterObj).subscribe(
      (res) => {
        this.salesCommisionsArr = res.data;
        this.hasData = this.salesCommisionsArr.length > 0;
        this.isinit = true;
        this.isLoading = false;
      },
      (error) => {
        console.error('API Error:', error);
        this.isinit = true;
        this.isLoading = false;
      },
    );
  }

  // Helper method to mark all controls as touched
  private markFormGroupTouched(formGroup: NgForm) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      // If it's a FormGroup, recursively mark its controls
      if ((control as any).controls) {
        this.markFormGroupTouched(control as any);
      }
    });
  }

  // Check if form is valid
  private isFormValid(): boolean {
    return !!(
      this.selectedAgent &&
      this.selectedFilter &&
      this.fromDate &&
      this.toDate &&
      this.deliveredDate
    );
  }

  back(): void {
    this.router.navigate(['finance/action']);
  }

  generateFileName(): string {
    const empId = this.selectedAgent?.empId || 'Unknown';
    const fromDate = this.formatDateForDisplay(this.fromDate);
    const toDate = this.formatDateForDisplay(this.toDate);
    const deliveredDate = this.formatDateForDisplay(this.deliveredDate);
    const paymentStatus = this.selectedFilter;

    return `${empId} Orders From ${fromDate} To ${toDate} delivered before ${deliveredDate} payment ${paymentStatus}.xlsx`;
  }

  // Download data as Excel
  downloadData(): void {
    if (this.salesCommisionsArr.length === 0) {
      alert('No data available to download. Please generate data first.');
      return;
    }

    this.isLoading = true;

    try {
      // Prepare data for Excel
      const excelData = this.salesCommisionsArr.map((item, index) => ({
        No: (index + 1).toString().padStart(3, '0'),
        'Order ID': item.invNo || 'N/A',
        'Ordered Date': item.sheduleDate
          ? new Date(item.sheduleDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : 'N/A',
        'Delivered Date': item.deliveredTime
          ? new Date(item.deliveredTime).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : 'N/A',
        'Payment Status': item.isPaid ? 'Completed' : 'Pending',
      }));

      // Create worksheet
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const wscols = [
        { wch: 8 }, // No
        { wch: 15 }, // Order ID
        { wch: 20 }, // Ordered Date
        { wch: 20 }, // Delivered Date
        { wch: 15 }, // Payment Status
      ];
      worksheet['!cols'] = wscols;

      // Create workbook
      const workbook: XLSX.WorkBook = {
        Sheets: { 'Orders Data': worksheet },
        SheetNames: ['Orders Data'],
      };

      // Generate Excel file
      const excelBuffer: any = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });

      // Save file
      this.saveAsExcelFile(excelBuffer, this.generateFileName());

      this.isLoading = false;
    } catch (error) {
      console.error('Error generating Excel file:', error);
      alert('Error downloading data. Please try again.');
      this.isLoading = false;
    }
  }

  // Save Excel file
  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(data);
    link.download = fileName;
    link.click();

    // Clean up
    setTimeout(() => {
      window.URL.revokeObjectURL(link.href);
    }, 100);
  }

  private formatDateForDisplay(date: Date): string {
    if (!date) return 'Unknown';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private formatDateForAPI(date: Date): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
}

interface SalesAgents {
  id: number;
  empId: string;
}

interface FilterOption {
  label: string;
  value: string;
}

interface FilterData {
  agentId: number | null;
  paymentStatus: string;
  fromDate: string;
  toDate: string;
  deliveredDate: string;
}

interface SalesCommisions {
  invNo: string;
  sheduleDate: string;
  deliveredTime: string;
  isPaid: boolean;
}
