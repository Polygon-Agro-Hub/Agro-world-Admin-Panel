import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GoviLinkService } from '../../../services/govi-link/govi-link.service';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-view-services-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './view-services-list.component.html',
  styleUrls: ['./view-services-list.component.css']
})
export class ViewServicesListComponent implements OnInit {
  officerServices: any[] = [];      // all services
  filteredServices: any[] = [];     // filtered services for display
  loading = true;
  isLoading = false;
  searchTerm: string = '';
  hasData: boolean = true;

  constructor(
    private goviLinkService: GoviLinkService,
    private router: Router
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.goviLinkService.getAllOfficerServices().subscribe({
      next: (data) => {
        this.officerServices = data;
        this.filteredServices = data;   // initially show all
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching services:', err);
        this.loading = false;
      }
    });
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredServices = this.officerServices;
      return;
    }
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredServices = this.officerServices.filter(service =>
      service.englishName?.toLowerCase().includes(term) ||
      service.tamilName?.toLowerCase().includes(term) ||
      service.sinhalaName?.toLowerCase().includes(term)
    );
  }

  // ❌ Clear search
  onClearSearch() {
    this.searchTerm = '';
    this.filteredServices = this.officerServices;
  }

  // Navigation
  goBack() {
    this.router.navigate(['/govi-link/action']);
  }

  onEditService(service: any) {
    this.router.navigate(['/govi-link/action/edit-services', service.id]);
  }

  add() {
    this.router.navigate(['/govi-link/action/add-services']);
  }

  onViewService(service: any) {
    this.router.navigate(['/govi-link/action/edit-services', service.id], {
      queryParams: { view: true }
    });
  }

  // 🗑 Delete with confirmation
  onDeleteService(service: any) {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: `Are you sure you want to delete this "${service.englishName}" Service? This action cannot be undone.`,
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'No, Cancel',
      customClass: {
        popup: 'bg-white dark:bg-gray-800 text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.goviLinkService.deleteOfficerService(service.id).subscribe({
          next: () => {
            this.officerServices = this.officerServices.filter(
              (s) => s.id !== service.id
            );
            this.filteredServices = this.filteredServices.filter(
              (s) => s.id !== service.id
            );

            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: `"${service.englishName}" has been deleted.`,
              confirmButtonText: 'OK',
              customClass: {
                popup: 'bg-white dark:bg-gray-800 text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            });
          },
          error: (err) => {
            console.error('Delete failed:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete service. Please try again.',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'bg-white dark:bg-gray-800 text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            });
          },
        });
      }
    });
  }
}
