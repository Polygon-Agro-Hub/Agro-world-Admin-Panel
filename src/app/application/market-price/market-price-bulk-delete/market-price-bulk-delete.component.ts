import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environment/environment';

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
      `${environment.API_URL}market-price/get-all-market-xlsx?page=${page}&limit=${limit}`, 
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
}
