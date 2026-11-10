import { Component, OnInit } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CollectionOfficerService } from '../../../../services/collection-officer/collection-officer.service';

interface SelfRegisteredDriver {
  id: number;
  firstNameEnglish: string;
  lastNameEnglish: string;
  jobRole: string;
  phoneCode01: string;
  phoneNumber01: string;
  nic: string;
  createdAt: string;
}

@Component({
  selector: 'app-view-review-drivers',
  standalone: true,
  imports: [LoadingSpinnerComponent, NgIf, NgFor, DatePipe, FormsModule, DropdownModule],
  templateUrl: './view-review-drivers.component.html',
  styleUrl: './view-review-drivers.component.css'
})
export class ViewReviewDriversComponent implements OnInit {
  isLoading = false;
  drivers: SelfRegisteredDriver[] = [];

  searchText = '';
  selectedRole: string | null = null;
  roleOptions = [
    { name: 'Light Weight Driver', value: 'Light Weight Driver' },
    { name: 'Heavy Weight Driver', value: 'Heavy Weight Driver' },
  ];

  constructor(
    private router: Router,
    private collectionOfficerService: CollectionOfficerService,
  ) { }

  ngOnInit(): void {
    this.loadDrivers();
  }

  get totalLabel(): string {
    return String(this.drivers.length).padStart(2, '0');
  }

  loadDrivers(): void {
    this.isLoading = true;
    this.collectionOfficerService
      .getSelfRegisteredDrivers(this.searchText.trim(), this.selectedRole ?? '')
      .subscribe({
        next: (res) => {
          this.drivers = res.items ?? [];
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load self registered drivers.' });
        },
      });
  }

  onSearch(): void {
    this.loadDrivers();
  }

  offSearch(): void {
    this.searchText = '';
    this.loadDrivers();
  }

  onRoleChange(): void {
    this.loadDrivers();
  }

  reviewDriver(id: number): void {
    this.router.navigate(['steckholders/action/self-registered-drivers-review', id]);
  }

  getOrdinal(date: string): string {
    const day = new Date(date).getDate();
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }

  formatPhone(code: string, number: string): string {
    const num = String(number ?? '').trim();
    const cc = String(code ?? '').trim();

    if (cc === '+94' || cc === '94') {
      return '0' + num.replace(/^0+/, '');
    }
    return `${cc}${num}`;
  }

  back(): void {
    this.router.navigate(['steckholders/action']);
  }
}