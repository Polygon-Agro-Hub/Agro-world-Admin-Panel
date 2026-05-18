import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { Router, ActivatedRoute } from '@angular/router';
import { StakeholderService } from '../../../../services/stakeholder/stakeholder.service';
import { PermissionService } from '../../../../services/roles-permission/permission.service';
import { TokenService } from '../../../../services/token/services/token.service';

export interface GoviShopUser {
  id: string;
  userName: string;
  shop: string;
  branch: string;
  phoneNumber: string;
  email: string;
  lastUpdatedBy: string | null;
  lastUpdatedAt: Date | null;
  joinedAt: Date;
}

@Component({
  selector: 'app-govishop-users',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './govishop-users.component.html',
  styleUrl: './govishop-users.component.css',
})
export class GovishopUsersComponent implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef;
  
  isLoading = false;
  supplierName = '';
  searchTerm = '';
  shopId: string = '';
  role: string = '';

  users: GoviShopUser[] = [];

  get totalUsers(): number {
    return this.users.length;
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private goviShopService: StakeholderService,
    public tokenService: TokenService,
    public permissionService: PermissionService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.shopId = params['shopId'] || '';
      this.supplierName = params['shopName'] || '';
      this.role = params['role'] || 'Manager';
      
      console.log('Shop ID:', this.shopId);
      console.log('Shop Name:', this.supplierName);
      console.log('Role:', this.role);
      
      if (this.shopId) {
        this.loadUsers();
      }
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    
    console.log('Fetching users with params:', {
      shopId: this.shopId,
      search: this.searchTerm || undefined,
      role: this.role
    });
    
    this.goviShopService.getUsers(
      this.searchTerm || undefined,
      this.role
    ).subscribe({
      next: (response: any) => {
        console.log('API Response:', response);
        
        if (response && response.success === true && Array.isArray(response.data)) {
          this.users = response.data.map((item: any) => ({
            id: item.id,
            userName: item.userName,
            shop: item.shopName || 'N/A',
            branch: item.branchName || 'N/A',
            phoneNumber: item.phone,
            email: item.email,
            lastUpdatedBy: item.updatedBy,
            lastUpdatedAt: item.updatedAt,
            joinedAt: new Date(item.createdAt)
          }));
        } else if (response && Array.isArray(response.data)) {
          this.users = response.data.map((item: any) => ({
            id: item.id,
            userName: item.userName,
            shop: item.shopName || 'N/A',
            branch: item.branchName || 'N/A',
            phoneNumber: item.phone,
            email: item.email,
            lastUpdatedBy: item.updatedBy,
            lastUpdatedAt: item.updatedAt,
            joinedAt: new Date(item.createdAt)

          }));
        } else if (Array.isArray(response)) {
          this.users = response.map((item: any) => ({
            id: item.id,
            userName: item.userName,
            shop: item.shopName || 'N/A',
            branch: item.branchName || 'N/A',
            phoneNumber: item.phone,
            email: item.email,
            lastUpdatedBy: item.updatedBy,
            lastUpdatedAt: item.updatedAt,
            joinedAt: new Date(item.createdAt)
          }));
        } else {
          this.users = [];
        }
        
        console.log('Mapped users:', this.users);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.loadUsers();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.loadUsers();
    setTimeout(() => this.searchInput?.nativeElement?.focus(), 0);
  }

  back(): void {
    this.router.navigate(['steckholders/action/govi-shop-suppliers']);
  }

  editUser(id: string): void {
    this.router.navigate(['steckholders/action/govi-shop-suppliers/edit-govi-shop-pos-user'], {
      queryParams: { id }
    });
  }
}