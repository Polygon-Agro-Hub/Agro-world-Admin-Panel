import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { FinanceService } from '../../../../services/finance/finance.service';

@Component({
  selector: 'app-view-govicapital-users',
  standalone: true,
  imports: [LoadingSpinnerComponent, CommonModule, FormsModule],
  templateUrl: './view-govicapital-users.component.html',
  styleUrl: './view-govicapital-users.component.css',
})
export class ViewGovicapitalUsersComponent implements OnInit {
  isLoading = false;
  searchQuery: string = '';
  users: any[] = [];
  totalUsers: number = 0;
  private searchTimeout: any;
  hasData = false;

  constructor(
    private router: Router,
    private financeService: FinanceService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(searchTerm: string = ''): void {
    this.isLoading = true;
    
    console.log('Loading users with search term:', searchTerm); // Debug log
    
    this.financeService.getGocicareAllInvestmentUsers(searchTerm)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Raw API response:', response); // Debug log
          
          // Make sure we're accessing the correct property
          const items = response.items || response || [];
          this.users = this.transformUserData(items);
          this.totalUsers = this.users.length;
          console.log('Transformed users:', this.users);
          this.hasData = this.users.length > 0;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.users = [];
          this.totalUsers = 0;
          this.hasData = false;
        }
      });
  }

  transformUserData(users: any[]): any[] {
  if (!users || !Array.isArray(users)) {
    return [];
  }
  
  return users.map((user, index) => ({
    no: (index + 1).toString().padStart(2, '0'),
    investorId: user.regCode || `IR${user.id}`,
    name: user.title && user.userName ? `${user.title}. ${user.userName}` : (user.userName || 'N/A'),
    // Fixed: Removed the space between phoneCode and phoneNumber
    phone: user.phoneCode && user.phoneNumber ? `${user.phoneCode}${user.phoneNumber}` : (user.phoneNumber || 'N/A'),
    nic: user.nic || 'N/A',
    email: user.email || 'N/A',
    address: user.address || 'N/A',
    joinedOn: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'N/A'
  }));
}

  back(): void {
    this.router.navigate(['steckholders/action']);
  }

  onSearchClick(): void {
    console.log('Search clicked with query:', this.searchQuery);
    
    // Trim the search query to remove whitespace
    const searchTerm = this.searchQuery ? this.searchQuery.trim() : '';
    
    // Only search if there's a term, otherwise load all
    if (searchTerm !== '') {
      this.loadUsers(searchTerm);
    } else {
      this.loadUsers(''); // Load all users when search is empty
    }
  }

  onSearchKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearchClick();
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.loadUsers(''); // Reload all users
  }
}