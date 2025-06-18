

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [
    CommonModule,
    NgxPaginationModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './subsription.component.html',
  styleUrls: ['./subsription.component.css'],
})
export class SubsriptionComponent implements OnInit {
  isLoading = true;
  subscriptionObj: Subscription[] = [];
  filteredSubscriptions: Subscription[] = [];
  hasData = true;

  activeTab: 'retail' | 'wholesale' = 'retail';
  searchText: string = '';

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;

  private apiUrl = 'http://localhost:3000/agro-api/admin-api/api/market-place/marketplace-users';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchAllSubscriptions();
  }

  back(): void {
    this.router.navigate(['market/action']);
  }

  switchTab(tab: 'retail' | 'wholesale') {
    if (this.activeTab !== tab) {
      this.activeTab = tab;
      this.page = 1;
      this.fetchAllSubscriptions();
    }
  }

  fetchAllSubscriptions() {
    this.isLoading = true;
    const token = localStorage.getItem('AdminLoginToken');

    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Unauthorized',
        text: 'Please log in to continue.',
      }).then(() => this.router.navigate(['/login']));
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const urlWithBuyerType = `${this.apiUrl}?buyerType=${this.activeTab}`;

    this.http.get<any[]>(urlWithBuyerType, { headers }).subscribe({
      next: (res) => {
        this.subscriptionObj = res.map((user) => ({
          id: user.id,
          customerName: user.firstName || 'N/A',
          email: user.email || 'N/A',
          time: user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A',
        }));
        this.applySearchFilter();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Unauthorized',
            text: 'Session expired. Please log in again.',
          }).then(() => {
            localStorage.removeItem('AdminLoginToken');
            this.router.navigate(['/login']);
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Could not load subscriptions. Please try again later.',
          });
        }
      },
    });
  }

  applySearchFilter() {
    const search = this.searchText.toLowerCase();
    this.filteredSubscriptions = this.subscriptionObj.filter(
      (user) =>
        user.customerName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
    );
    this.totalItems = this.filteredSubscriptions.length;
    this.hasData = this.totalItems > 0;
  }

  onSearchChange() {
    this.applySearchFilter();
    this.page = 1;
  }

  clearSearch() {
    this.searchText = '';
    this.applySearchFilter();
  }

  onPageChange(event: number) {
    this.page = event;
  }

  deleteUser(id: number): void {
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you really want to delete this user? This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  }).then((result) => {
    if (result.isConfirmed) {
      const token = localStorage.getItem('AdminLoginToken');
      if (!token) {
        this.handleUnauthorized();
        return;
      }

      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      // Updated URL to match the backend route
      const deleteUrl = `http://localhost:3000/agro-api/admin-api/api/market-place/marketplace-dltusers/${id}`;

      this.http.delete<{ status: boolean; message: string }>(deleteUrl, { headers }).subscribe({
        next: (response) => {
          if (response.status) {
            this.subscriptionObj = this.subscriptionObj.filter((user) => user.id !== id);
            this.applySearchFilter();
            Swal.fire('Deleted!', response.message || 'The user has been deactivated.', 'success');
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.message || 'Could not deactivate user.',
            });
          }
        },
        error: (err) => {
          if (err.status === 401) {
            this.handleUnauthorized();
          } else if (err.status === 404 || err.status === 400) {
            Swal.fire({
              icon: 'error',
              title: 'Not Found',
              text: err.error?.message || 'The user could not be found or was already deactivated.',
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Could not deactivate user. Please try again later.',
            });
          }
        },
      });
    }
  });
}
  handleUnauthorized() {
    throw new Error('Method not implemented.');
  }


  downloadExcel(): void {
    const exportData = this.filteredSubscriptions.map((sub) => ({
      'Customer Name': sub.customerName,
      Email: sub.email,
      Time: sub.time,
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = {
      Sheets: { Subscriptions: worksheet },
      SheetNames: ['Subscriptions'],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blobData: Blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });

    FileSaver.saveAs(blobData, 'Subscriptions.xlsx');
  }
}

export interface Subscription {
  id: number;
  customerName: string;
  email: string;
  time: string;
}