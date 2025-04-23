import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ReactiveFormsModule } from '@angular/forms'; // ✅ Import this
import { HttpClientModule } from '@angular/common/http';
import { DropdownModule } from 'primeng/dropdown';
import { SalesDashService } from '../../../services/sales-dash/sales-dash.service';
import Swal from 'sweetalert2';

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
  ],
  templateUrl: './sales-target.component.html',
  styleUrl: './sales-target.component.css',
})
export class SalesTargetComponent implements OnInit {
  // targetForm: FormGroup;
  currentDailyTarget!: number;
  newTargetValue: number = 0;

  agentsArr!: Agents[];

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  hasData: boolean = true;

  selectStatus: string = '';
  searchText: string = '';
  selectDate: string = '';
  totalTarget!: number;
  agentCount: number = 0;

  status = [{ name: 'Completed' }, { name: 'Pending' }, { name: 'Exceeded' }];

  constructor(
    private fb: FormBuilder,
    private salesDashSrv: SalesDashService
  ) {}

  ngOnInit(): void {
    this.selectDate = new Date().toISOString().split('T')[0];
    this.fetchAllSalesAgents();
  }

  futureDateValidator(control: any) {
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ignore time

    return selectedDate >= today ? null : { pastDate: true };
  }

  saveTarget() {
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
        text: 'Target value must be greater than 0. Please enter a valid target.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
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
            } else {
              Swal.fire({
                title: 'Error!',
                text: response.message,
                icon: 'error',
                confirmButtonText: 'OK',
              });
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
          }
        );
      } else {
        // Add this else block to clear the input when canceled
        this.newTargetValue = 0;
      }
    });
  }

  fetchAllSalesAgents(
    page: number = 1,
    limit: number = this.itemsPerPage,
    search: string = this.searchText,
    status: string = this.selectStatus,
    date: string = this.selectDate
  ) {
    this.salesDashSrv
      .getAllSalesAgents(page, limit, search, status, date)
      .subscribe((res) => {
        console.log(res);

        // Convert to integer using parseInt() or Math.round()
        this.totalTarget = Math.round(res.totalTarget.targetValue); // or parseInt(res.totalTarget.targetValue, 10)

        this.agentsArr = res.items;
        this.totalItems = res.total;
        this.agentCount = res.items.length === undefined ? 0 : res.items.length;

        if (res.items.length === 0) {
          this.hasData = false;
        }
      });
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

  onDateChange(event: any) {
    this.selectDate = event.target.value || '';
    console.log('Selected Status:', this.selectDate);
    this.fetchAllSalesAgents(
      this.page,
      this.itemsPerPage,
      this.searchText,
      this.selectStatus,
      this.selectDate
    );
  }

  preventDecimalInput(event: KeyboardEvent) {
    const forbiddenKeys = ['.', ',', 'e', 'E', '+', '-'];
    if (forbiddenKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  validateTargetInput() {
    // If value is not a number, set to 0
    if (isNaN(this.newTargetValue)) {
      this.newTargetValue = 0;
      return;
    }

    // Round to nearest integer
    this.newTargetValue = Math.round(this.newTargetValue);

    // Ensure minimum value of 1
    if (this.newTargetValue < 1) {
      this.newTargetValue = 0;
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
