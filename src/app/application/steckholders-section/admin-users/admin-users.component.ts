import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { environment } from '../../../environment/environment';

interface AdminUsers {
  id: number;
  mail: string;
  userName: string;
  role: string;
  created_at: string; 
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, HttpClientModule, NgxPaginationModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css',
  template: `
    <!-- Your existing table markup -->
    <pagination-controls 
      (pageChange)="onPageChange($event)"
      [totalItems]="totalItems"
      [itemsPerPage]="20">
    </pagination-controls>
  `
})
export class AdminUsersComponent {
  adminUsers: AdminUsers[] = [];
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  hasData: boolean = true; 

  constructor(private http: HttpClient, private router: Router) {}


  fetchAllAdmins(page: number = 1, limit: number = this.itemsPerPage) {
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
  
    this.http.get<{items: AdminUsers[], total: number}>(
      `${environment.API_BASE_URL}get-all-admin-users?page=${page}&limit=${limit}`, 
      { headers }
    ).subscribe(
      (response) => {
        console.log('Received items:', response.items); // Debug log
        console.log('Total items:', response.total); // Debug log
        this.adminUsers = response.items;
        this.hasData = this.adminUsers.length > 0;
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

  ngOnInit() {
    this.fetchAllAdmins(this.page, this.itemsPerPage);
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllAdmins(this.page, this.itemsPerPage); // Include itemsPerPage
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
  
        this.http.delete(`${environment.API_BASE_URL}delete-admin-user/${id}`, { headers }).subscribe(
          (data: any) => {
            console.log('Admin deleted successfully');
            Swal.fire(
              'Deleted!',
              'The Admin has been deleted.',
              'success'
            );
            this.fetchAllAdmins();
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


  editAdminUser(id: number) {
    this.router.navigate(['/admin-users/create-admin-user'], { queryParams: { id } });
  }
  

}
