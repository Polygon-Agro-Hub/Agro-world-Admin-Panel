import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environment/environment';
import Swal from 'sweetalert2';

interface marketxl {
  id: number;
  xlName: string;
  createdAt: any;
  startTime: any;
  endTime: any; 
}

@Component({
  selector: 'app-market-price-bulk-delete',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule
  ],
  templateUrl: './market-price-bulk-delete.component.html',
  styleUrl: './market-price-bulk-delete.component.css'
})
export class MarketPriceBulkDeleteComponent {
  isLoading = false;
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  hasData: boolean = true; 
  mprices: marketxl[] = [];


  constructor(private http: HttpClient, private router: Router) {}


  ngOnInit() {
   
    this.fetchAllXl(this.page, this.itemsPerPage);
    
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllXl(this.page, this.itemsPerPage); // Include itemsPerPage
}

  fetchAllXl(page: number = 1, limit: number = this.itemsPerPage) {
    console.log('Fetching market prices for page:', page); // Debug log
    this.page = page;
    const token = localStorage.getItem('Login Token : ');
    if (!token) {
      console.error('No token found');
      return;
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    this.http.get<{items: marketxl[], total: number}>(
      `${environment.API_BASE_URL}market-price/get-all-market-xlsx?page=${page}&limit=${limit}`, 
      { headers }
    ).subscribe(
      (response) => {
        console.log('Received items:', response.items); // Debug log
        console.log('Total items:', response.total); // Debug log
        this.mprices = response.items;
        this.hasData = this.mprices.length > 0;
        this.totalItems = response.total;
      },
      (error) => {
        console.error('Error fetching market prices:', error);
        if (error.status === 401) {
          // Handle unauthorized access (e.g., redirect to login)
        }
      }
    );
  }


  deleteAdminUser(id: any) {
    const token = localStorage.getItem('Login Token : ');
    if (!token) {
      console.error('No token found');
      return;
    }
  
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you really want to delete this Admin? This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
  
        this.http.delete(`${environment.API_BASE_URL}market-price/delete-xl-file/${id}`, { headers }).subscribe(
          (data: any) => {
            console.log('Admin deleted successfully');
            Swal.fire(
              'Deleted!',
              'The Admin has been deleted.',
              'success'
            );
            this.fetchAllXl();
          },
          (error) => {
            console.error('Error deleting news:', error);
            Swal.fire(
              'Error!',
              'There was an error deleting the news item.',
              'error'
            );
          }
        );
      }
    });
  }



  
}
