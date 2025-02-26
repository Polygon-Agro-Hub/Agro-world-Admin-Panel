import { CommonModule } from '@angular/common';
import { Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ReactiveFormsModule } from '@angular/forms'; // ✅ Import this
import { HttpClientModule } from '@angular/common/http';
import { DropdownModule } from 'primeng/dropdown';
import { SalesDashService } from '../../../services/sales-dash/sales-dash.service';

@Component({
  selector: 'app-sales-target',
  standalone: true,
  imports: [CommonModule, DropdownModule, NgxPaginationModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './sales-target.component.html',
  styleUrl: './sales-target.component.css',
})
export class SalesTargetComponent implements OnInit{

  targetForm: FormGroup;
  currentDailyTarget!: number;

  agentsArr!: Agents[];

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  hasData: boolean = true;

  selectStatus: string = '';
  searchText: string = '';
  selectDate: string = ''; 

  status = [
    { name: 'Completed'},
    { name: 'Pending'},
    { name: 'Exceeded'},
    
  ];

  constructor(
    private fb: FormBuilder,
    private salesDashSrv: SalesDashService,
  ) {
    this.targetForm = this.fb.group({
      targetValue: [null, [Validators.required, Validators.min(1)]],
      startDate: ['', [Validators.required, this.futureDateValidator]],
    });
   }

   futureDateValidator(control: any) {
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ignore time

    return selectedDate >= today ? null : { pastDate: true };
  }

  saveTarget() {
    if (this.targetForm.invalid) {
      return;
    }

    const targetData = this.targetForm.value;

    console.log(targetData);

    this.salesDashSrv.saveTarget(targetData.startDate, targetData.targetValue).subscribe(
      (response) => {
        console.log('Target saved successfully:', response);
        alert('Target saved successfully!');
        this.fetchDailyTarget();
      },
      (error) => {
        console.error('Error saving target:', error);
        alert('Failed to save target.');
      }
    );
  }

  ngOnInit(): void {
    this.fetchAllSalesAgents();
    this.fetchDailyTarget();
    
  }

  

  fetchAllSalesAgents(page: number = 1, limit: number = this.itemsPerPage, search: string = this.searchText, status: string = this.selectStatus, date: string = this.selectDate) {
    this.salesDashSrv.getAllSalesAgents(page, limit, search, status, date).subscribe((res) => {

      console.log(res);

      this.agentsArr = res.items;
      this.totalItems = res.total;
      if (res.items.length === 0) {
        this.hasData = false;
      }
    });
  }

  fetchDailyTarget() {
    this.salesDashSrv.getDailyTarget().subscribe((res) => {

      console.log(res[0].targetValue);

      this.currentDailyTarget = res[0]?.targetValue ?? 0.00;

    });
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllSalesAgents(this.page, this.itemsPerPage, this.searchText, this.selectStatus, this.selectDate);
  }

  onSearch() {
    this.fetchAllSalesAgents(this.page, this.itemsPerPage, this.searchText, this.selectStatus, this.selectDate);
  }

  offSearch() {
    
    this.searchText = '';
    this.fetchAllSalesAgents(this.page, this.itemsPerPage, this.searchText, this.selectStatus, this.selectDate);
  }

  filterStatus() {
    if (!this.selectStatus) {
      this.selectStatus = ''; // Ensure it's always an empty string
    }
    console.log("Selected Status:", this.selectStatus);
    this.fetchAllSalesAgents(this.page, this.itemsPerPage, this.searchText, this.selectStatus, this.selectDate);
  }

  onDateChange(event: any) {
    this.selectDate = event.target.value || '';
    console.log("Selected Status:", this.selectDate);
    this.fetchAllSalesAgents(this.page, this.itemsPerPage, this.searchText, this.selectStatus, this.selectDate);
  }

  get formControls(): { [key: string]: any } {
    return this.targetForm.controls;
  }
}

class Agents {
  id!: number;
  empId!: string;
  firstName!: string;
  lastName!: string;
  target!: number;
  targetCompletion!: string;
  targetStatus!: string;
  
}





