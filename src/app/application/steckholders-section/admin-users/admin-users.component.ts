import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  HttpClientModule,
  HttpClient,
  HttpHeaders,
} from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { environment } from '../../../environment/environment';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

interface AdminUsers {
  id: number;
  mail: string;
  userName: string;
  role: string;
  positions: string;
  created_at: string;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    NgxPaginationModule,
    DropdownModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css',
  template: `
    <pagination-controls
      (pageChange)="onPageChange($event)"
      [totalItems]="totalItems"
      [itemsPerPage]="20"
    >
    </pagination-controls>
  `,
})
export class AdminUsersComponent implements OnInit {
  adminUsers: AdminUsers[] = [];
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  searchNIC: string = '';
  hasData: boolean = true;

  status!: Roles[];
  statusFilter: any = '';
  roleArr: Roles[] = [];
  searchText: string = '';
  userId: number | null = null;
  role: any = localStorage.getItem('role:');
  isLoading = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) {}

  ngOnInit() {
    this.userId = Number(localStorage.getItem('userId:'));
    this.fetchAllAdmins(this.page, this.itemsPerPage);
    this.getAllRoles();
  }

  fetchAllAdmins(page: number = 1, limit: number = this.itemsPerPage) {
    this.isLoading = true;
    this.page = page;
    const token = this.tokenService.getToken();
    if (!token) return;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    let url = `${environment.API_URL}auth/get-all-admin-users?page=${page}&limit=${limit}`;

    if (this.statusFilter.role) {
      url += `&role=${this.statusFilter.id}`;
    }
    if (this.searchText) {
      url += `&search=${this.searchText}`;
    }

    this.http
      .get<{ items: AdminUsers[]; total: number }>(url, { headers })
      .subscribe(
        (response) => {
          this.isLoading = false;
          this.adminUsers = response.items;
          this.hasData = this.adminUsers.length > 0;
          this.totalItems = response.total;
        },
        (error) => {
          this.isLoading = false;
        }
      );
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllAdmins(this.page, this.itemsPerPage);
  }

  deleteAdminUser(id: any) {
    const token = this.tokenService.getToken();
    if (!token) return;

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this Admin? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });

        this.http
          .delete(`${environment.API_URL}auth/delete-admin-user/${id}`, {
            headers,
          })
          .subscribe(
            () => {
              Swal.fire('Deleted!', 'The Admin has been deleted.', 'success');
              this.fetchAllAdmins();
            },
            () => {
              Swal.fire(
                'Error!',
                'There was an error deleting the admin.',
                'error'
              );
            }
          );
      }
    });
  }

  editAdminUser(id: number) {
    this.router.navigate(['/steckholders/action/admin/create-admin-user'], {
      queryParams: { id },
    });
  }

  applyFilter() {
    this.fetchAllAdmins(this.page, this.itemsPerPage);
  }

  onSearch() {
    this.searchText = this.searchText.trim();
    this.fetchAllAdmins(this.page, this.itemsPerPage);
  }

  offSearch() {
    this.searchText = '';
    this.fetchAllAdmins(this.page, this.itemsPerPage);
  }

  clearSearch(): void {
    this.statusFilter = '';
    this.fetchAllAdmins();
  }

  getAllRoles() {
    const token = this.tokenService.getToken();
    if (!token) return;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get<any>(`${environment.API_URL}auth/get-all-roles`, { headers })
      .subscribe(
        (response) => {
          this.roleArr = response.roles;
        },
        () => {}
      );
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }
}

class Roles {
  id!: number;
  role!: string;
}
