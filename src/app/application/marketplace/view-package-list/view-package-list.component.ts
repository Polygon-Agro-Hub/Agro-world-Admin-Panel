import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { ViewPackageListService } from '../../../services/market-place/view-package-list.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from '../../../services/token/services/token.service';
import { response } from 'express';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-view-package-list',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, DropdownModule, FormsModule],
  templateUrl: './view-package-list.component.html',
  styleUrl: './view-package-list.component.css',
})
export class ViewPackageListComponent {
  viewPackageList: PackageList[] = [];
  isLoading = false;
  hasData: boolean = true;
  statusOptions = [
    { label: 'All', value: null },
    { label: 'Enabled', value: 'Enabled' },
    { label: 'Disabled', value: 'Disabled' },
  ];
  selectedStatus: any;

  constructor(
    private router: Router,
    private viewPackagesList: ViewPackageListService,
    private http: HttpClient,
    private tokenService: TokenService
  ) {}

  fetchAllPackages() {
    this.isLoading = true;
    this.viewPackagesList.getAllMarketplacePackages().subscribe(
      (response) => {
        console.log('Package list response:', response);
        // Flatten the packages array from all status groups
        this.viewPackageList = response.data.flatMap((group: any) =>
          group.packages.map((pkg: any) => ({
            ...pkg,
            groupStatus: group.status,
          }))
        );
        this.hasData = this.viewPackageList.length > 0;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching all Packages', error);
        this.isLoading = false;
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    );
  }

  ngOnInit() {
    this.fetchAllPackages(); // Removed pagination parameters
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  deletePackage(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this package? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        const token = this.tokenService.getToken();
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });

        this.http
          .delete(`${environment.API_URL}market-place/delete-packages/${id}`, {
            headers,
          })
          .subscribe({
            next: (response) => {
              this.isLoading = false;
              Swal.fire('Deleted!', 'The package has been deleted.', 'success');
              this.fetchAllPackages();
            },
            error: (error) => {
              this.isLoading = false;
              console.error('Error deleting package:', error);
              Swal.fire(
                'Error',
                'There was a problem deleting the package.',
                'error'
              );
            },
          });
      }
    });
  }

  get filteredPackages() {
    if (!this.selectedStatus) {
      return this.viewPackageList;
    }
    return this.viewPackageList.filter(
      (pkg) =>
        pkg.status === this.selectedStatus ||
        pkg.groupStatus === this.selectedStatus
    );
  }
}

class PackageList {
  id!: number;
  displayName!: string;
  image!: string;
  description!: string;
  total!: number;
  status!: string;
  discount!: number;
  subtotal!: number;
  createdAt!: string;
  groupStatus: any;
}
