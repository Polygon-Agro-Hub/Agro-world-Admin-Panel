import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ReactiveFormsModule } from '@angular/forms'; // ✅ Import this
import { HttpClientModule } from '@angular/common/http';
import { DropdownModule } from 'primeng/dropdown';
import { SalesDashService } from '../../../services/sales-dash/sales-dash.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";
import { Calendar, CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-sales-target',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    LoadingSpinnerComponent,
    CalendarModule,
    
  ],
  templateUrl: './sales-target.component.html',
  styleUrl: './sales-target.component.css',
})
export class SalesTargetComponent implements OnInit {
  @ViewChild('calendar') calendar!: Calendar;
  loading: any;
  resetFilters() {
    throw new Error('Method not implemented.');
  }
  // targetForm: FormGroup;
  currentDailyTarget!: number;
  newTargetValue: any = '';

  agentsArr!: Agents[];

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  hasData: boolean = true;

  selectStatus: string = '';
  searchText: string = '';
  selectDate: Date | null = null;
  totalTarget!: number;
  agentCount: number = 0;

  status = [{ name: 'Completed' }, { name: 'Pending' }, { name: 'Exceeded' }];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private salesDashSrv: SalesDashService,
    private router: Router
  ) { }



  back(): void {
  Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: 'You may lose the added data after going back!',
    showCancelButton: true,
    confirmButtonText: 'Yes, Go Back',
    cancelButtonText: 'No, Stay Here',
       customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
    },
  }).then((result) => {
    if (result.isConfirmed) {
      this.router.navigate(['/sales-dash']);
    }
  });
}


  toggleCalendar() {
    this.calendar.overlayVisible = !this.calendar.overlayVisible;
  }

  ngOnInit(): void {
    this.selectDate = new Date()
    this.fetchAllSalesAgents();
  }

  blockFirstSpace(event: KeyboardEvent) {
  const input = (event.target as HTMLInputElement).value;
  if (event.key === ' ' && input.length === 0) {
    event.preventDefault(); // Prevent space at the beginning
  }
}


  futureDateValidator(control: any) {
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ignore time

    return selectedDate >= today ? null : { pastDate: true };
  }

  saveTarget() {
    this.isLoading = true;
    // First validate the input
    this.validateTargetInput();

    // Check for invalid values (0, empty, or NaN)
    if (
      !this.newTargetValue ||
      this.newTargetValue <= 0 ||
      isNaN(this.newTargetValue)
    ) {
      Swal.fire({
        title: 'Invalid Target',
        text: 'Please Add a Target',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
    },
      });
      this.isLoading = false;
      return; // Exit the function early
    }

    // Only proceed with save if value is valid
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to save the target of ${this.newTargetValue}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Save it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
    },
    }).then((result) => {
      if (result.isConfirmed) {
        this.salesDashSrv.saveTarget(this.newTargetValue).subscribe(
          (response) => {
            if (response.status) {
              Swal.fire({
                title: 'Success!',
                text: response.message,
                icon: 'success',
                confirmButtonText: 'OK',
              });
              this.newTargetValue = 0;
              this.fetchAllSalesAgents();
              this.isLoading = false;
            } else {
              Swal.fire({
                title: 'Error!',
                text: response.message,
                icon: 'error',
                confirmButtonText: 'OK',
              });
              this.isLoading = false;
            }
          },
          (error) => {
            console.error('Error saving target:', error);
            Swal.fire({
              title: 'Failed!',
              text: 'Failed to save target.',
              icon: 'error',
              confirmButtonText: 'OK',
            });
            this.isLoading = false;
          }
        );
      } else {
        // Add this else block to clear the input when canceled
        this.newTargetValue = 0;
        this.isLoading = false;
      }
    });
  }

  formatAgentCount(): string {
    return this.agentCount < 10 ? '0' + this.agentCount : this.agentCount.toString();
  }

  fetchAllSalesAgents(
    page: number = 1,
    limit: number = this.itemsPerPage,
    search: string = this.searchText,
    status: string = this.selectStatus,
    date: Date | null = this.selectDate
  ) {
    this.isLoading = true;
    this.salesDashSrv
      .getAllSalesAgents(page, limit, search, status, this.formatDateForBackend(date))
      .subscribe({
        next: (res) => {
          console.log(res);

          this.totalTarget = res.totalTarget
            ? Math.round(res.totalTarget.targetValue)
            : 0;
          this.agentsArr = res.items || [];
          this.totalItems = res.total || 0;
          this.agentCount = this.agentsArr.length;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching agents:', err);
          this.agentsArr = [];
          this.totalItems = 0;
          this.agentCount = 0;
          this.totalTarget = 0;
          this.isLoading = false;
        },
      });
  }

  formatDateForBackend(date: Date | null): string {
    if (!date) return '';
  
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllSalesAgents(
      this.page,
      this.itemsPerPage,
      this.searchText,
      this.selectStatus,
      this.selectDate
    );
  }

  onSearch() {
    this.fetchAllSalesAgents(
      this.page,
      this.itemsPerPage,
      this.searchText,
      this.selectStatus,
      this.selectDate
    );
  }

  offSearch() {
    this.searchText = '';
    this.fetchAllSalesAgents(
      this.page,
      this.itemsPerPage,
      this.searchText,
      this.selectStatus,
      this.selectDate
    );
  }

  filterStatus() {
    if (!this.selectStatus) {
      this.selectStatus = ''; // Ensure it's always an empty string
    }
    console.log('Selected Status:', this.selectStatus);
    this.fetchAllSalesAgents(
      this.page,
      this.itemsPerPage,
      this.searchText,
      this.selectStatus,
      this.selectDate
    );
  }

  onDateChange(date: Date | null) {
    this.selectDate = date;
    console.log('selectDate:', this.selectDate);
    this.fetchAllSalesAgents(
      this.page,
      this.itemsPerPage,
      this.searchText,
      this.selectStatus,
      this.selectDate
    );
  }
  
  

  preventDecimalInput(event: KeyboardEvent) {
  const input = event.target as HTMLInputElement;
  const forbiddenKeys = ['.', ',', 'e', 'E', '+', '-'];
  
  // Prevent decimal and other forbidden characters
  if (forbiddenKeys.includes(event.key)) {
    event.preventDefault();
    return;
  }
  
  // Prevent zero as first character
  if (event.key === '0' && input.value.length === 0) {
    event.preventDefault();
  }
}

  validateTargetInput() {
  // If value is not a number, set to empty
  if (isNaN(this.newTargetValue)) {
    this.newTargetValue = '';
    return;
  }

  // Remove leading zeros
  if (this.newTargetValue.toString().startsWith('0')) {
    this.newTargetValue = this.newTargetValue.toString().replace(/^0+/, '');
  }

  // If empty after removing zeros, set to empty
  if (this.newTargetValue === '') {
    return;
  }

  // Round to nearest integer
  this.newTargetValue = Math.round(this.newTargetValue);

  // Ensure minimum value of 1
  if (this.newTargetValue < 1) {
    this.newTargetValue = '';
  }
}

  // get formControls(): { [key: string]: any } {
  //   return this.targetForm.controls;
  // }
}

class Agents {
  id!: number;
  empId!: string;
  firstName!: string;
  lastName!: string;
  target!: number;
  targetComplete!: number;
}
