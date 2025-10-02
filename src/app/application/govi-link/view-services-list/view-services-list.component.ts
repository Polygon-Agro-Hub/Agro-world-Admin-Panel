import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';  // ✅ Import Router
import { GoviLinkService } from '../../../services/govi-link/govi-link.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-view-services-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './view-services-list.component.html',
  styleUrls: ['./view-services-list.component.css']
})
export class ViewServicesListComponent implements OnInit {
  officerServices: any[] = [];
  loading = true;
  searchTerm: string = '';

  constructor(
    private goviLinkService: GoviLinkService,
    private router: Router   // ✅ Inject Router
  ) {}

  ngOnInit() {
    this.goviLinkService.getAllOfficerServices().subscribe({
      next: (data) => {
        this.officerServices = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching services:', err);
        this.loading = false;
      }
    });
  }

  get filteredServices() {
    if (!this.searchTerm) return this.officerServices;
    return this.officerServices.filter(service =>
      service.englishName?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  onEditService(service: any) {
    // Navigate to edit page with the service id
    this.router.navigate(['/govi-link/action/edit-services', service.id]);
  }

  add() {
     this.router.navigate(['/govi-link/action/add-services']); }

  onViewService(service: any) {
  this.router.navigate(['/govi-link/action/edit-services', service.id], { queryParams: { view: true } }); // View mode
}
onDeleteService(service: any) {
  Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: `You are about to delete "${service.englishName}" service!`,
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
          // Remove the deleted service from the local list
          this.officerServices = this.officerServices.filter(
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
