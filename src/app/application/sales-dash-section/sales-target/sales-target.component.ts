import { CommonModule } from '@angular/common';
import { Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { SalesDashService } from '../../../services/sales-dash/sales-dash.service';

@Component({
  selector: 'app-sales-target',
  standalone: true,
  imports: [CommonModule, DropdownModule, NgxPaginationModule, FormsModule],
  templateUrl: './sales-target.component.html',
  styleUrl: './sales-target.component.css',
})
export class SalesTargetComponent implements OnInit{

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
    
    private salesDashSrv: SalesDashService,
  ) { }

  ngOnInit(): void {
    this.fetchAllSalesAgents();
    
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





