import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
// import { DatePipe } from '@angular/common';

import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

import { FormsModule } from '@angular/forms';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { SalesAgentsService } from '../../../services/dash/sales-agents.service';

@Component({
  selector: 'app-view-sales-agents',
  standalone: true,
  imports: [
            HttpClientModule,
            CommonModule,
            LoadingSpinnerComponent,
            NgxPaginationModule,
            FormsModule,
            DropdownModule
  ],
  templateUrl: './view-sales-agents.component.html',
  styleUrl: './view-sales-agents.component.css'
})
export class ViewSalesAgentsComponent implements OnInit {

  salesAgentsArr: SalesAgent[] = [];
  

  isLoading = false;

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  hasData: boolean = true;
  searchText: string = '';

  statusArr = [
    { status: 'Approved', value: 'Approved' },
    { status: 'Rejected', value: 'Rejected' },
    
  ];

  statusFilter: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    
    private salesAgentsService: SalesAgentsService,
  ) {}

  ngOnInit() {
    
    this.fetchAllSalesAgents();
  }

  fetchAllSalesAgents(page: number = 1, limit: number = this.itemsPerPage, search: string = this.searchText, status: string = this.statusFilter) {
    
    
    // this.isLoading = true;
    this.salesAgentsService.getAllSalesAgents( page, limit, search, status).subscribe(
      (data) => {
        console.log(data);
        this.isLoading = false;
        this.salesAgentsArr = data.items;
        
        this.hasData = this.salesAgentsArr.length > 0;
        this.totalItems = data.total;
      },
      (error) => {
        console.error('Error fetch news:', error);
        if (error.status === 401) {
          this.isLoading = false;
        }
      }
    );
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllSalesAgents(this.page, this.itemsPerPage, this.searchText, this.statusFilter); // Include itemsPerPage
  }

  onSearch() {
    this.fetchAllSalesAgents(this.page, this.itemsPerPage, this.searchText, this.statusFilter);
  }

  offSearch() {
    this.searchText = '';
    this.fetchAllSalesAgents(this.page, this.itemsPerPage, this.searchText, this.statusFilter);
  }

  applyFilters() {
    this.fetchAllSalesAgents(this.page, this.itemsPerPage, this.searchText, this.statusFilter);
  }

  Back(): void {
    this.router.navigate(['/steckholders/action']);
  }

  
  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  deleteSalesAgent(id: any) {
    console.log(id);
    console.log('clicked');
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this sales agent? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.salesAgentsService.deleteSalesAgent(id).subscribe(
          (data: any) => {
            if (data) {
              Swal.fire(
                'Deleted!',
                'The sales agent has been deleted.',
                'success'
              );
              this.fetchAllSalesAgents();
            }
          },
          (error) => {
            console.error('Error deleting Sales Agent:', error);
            Swal.fire(
              'Error!',
              'There was an error deleting the Sales Agent.',
              'error'
            );
          }
        );
      }
    });
  }

}

class SalesAgent {
  id!: number;
  empId!: string;
  firstName!: string;
  lastName!: string;
  status!: string;
  phoneCode1!: string;
  phoneNumber1!: string;
  nic!: string;
 
  
}



