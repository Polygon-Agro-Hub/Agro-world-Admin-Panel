import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
  
  // Dummy data based on the image
  users = [
    {
      no: '01',
      investorId: 'IR2511200001',
      name: 'Mr. J.K. Rowling',
      phone: '+94 787811001',
      nic: '88788822V',
      email: 'jk1990@gmail.com',
      address: '11/A, Galle Rd, Dehiwala',
      joinedOn: 'July 10, 2025'
    },
    {
      no: '02',
      investorId: 'IR2511200001',
      name: 'Mr. B. Gates',
      phone: '+94 787811002',
      nic: '88788821V',
      email: 'bg1990@gmail.com',
      address: '11/A, Galle Rd, Dehiwala',
      joinedOn: 'July 09, 2025'
    },
    {
      no: '03',
      investorId: 'IR2511200001',
      name: 'Mr. N.M.K. Sumanadasa',
      phone: '+94 787811003',
      nic: '88788825V',
      email: 'sum@gmail.com',
      address: '11/A, Galle Rd, Dehiwala',
      joinedOn: 'July 08, 2025'
    },
    {
      no: '04',
      investorId: 'IR2511200001',
      name: 'Mr. P.D. Nimesha',
      phone: '+94 787811004',
      nic: '88788811V',
      email: 'nim@gmail.com',
      address: '11/A, Galle Rd, Dehiwala',
      joinedOn: 'July 07, 2025'
    }
  ];

  // Filtered users for search functionality
  filteredUsers: any[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Initialize filtered users with all users
    this.filteredUsers = [...this.users];
  }

  back(): void {
    this.router.navigate(['steckholders/action']);
  }

  // Search function
  search(): void {
    if (this.searchQuery.trim() === '') {
      this.filteredUsers = [...this.users];
    } else {
      const query = this.searchQuery.toLowerCase().trim();
      this.filteredUsers = this.users.filter(user => 
        user.phone.toLowerCase().includes(query) ||
        user.nic.toLowerCase().includes(query)
      );
    }
  }

  // Clear search
  clearSearch(): void {
    this.searchQuery = '';
    this.filteredUsers = [...this.users];
  }
}