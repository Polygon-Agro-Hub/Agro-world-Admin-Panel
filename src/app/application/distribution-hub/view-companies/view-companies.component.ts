import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';
import { Router } from '@angular/router';
import { DistributionHubService } from '../../../services/distribution-hub/distribution-hub.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-companies',
  standalone: true,
  imports: [LoadingSpinnerComponent, CommonModule, FormsModule],
  templateUrl: './view-companies.component.html',
  styleUrls: ['./view-companies.component.css'],
})
export class ViewCompaniesComponent implements OnInit {
  companies: CompanyDetails[] = [];
  isLoading = false;
  total: number | null = null;
  search: string = '';
  hasData = false;

  constructor(
    private distributionHubService: DistributionHubService,
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) { }

  ngOnInit() {
    this.fetchAllCompanys(); // Initial fetch
  }

  fetchAllCompanys() {
    this.isLoading = true;
    this.distributionHubService.getAllCompanyDetails(this.search.trim())
      .subscribe(
        (response: any) => {
          console.log('API Response:', response);
          this.isLoading = false;
          this.companies = response.results || [];
          this.total = response.total || 0;
          this.hasData = this.companies.length > 0;
        },
        (error) => {
          console.error('API Error:', error);
          this.isLoading = false;
          this.hasData = false;
        }
      );
  }

  searchPlantCareUsers() {
    console.log('Search triggered:', this.search);
    this.fetchAllCompanys();
  }

  clearSearch(): void {
    this.search = '';
    this.fetchAllCompanys();
  }

  editCompany(id: number) {
    this.router.navigate(['/distribution-hub/action/create-company'], {
      queryParams: { id, type: 'distribution' },
    });
  }

  viewCompany(id: number, isView: boolean) {
    this.router.navigate(['/distribution-hub/action//create-company'], {
      queryParams: { id, isView },
    });
  }

  viewCompanyHeadPortals(id: number, companyName: string) {
    console.log('id', id, 'companyName', companyName);
    this.router.navigate(
      ['/distribution-hub/action/view-distribution-company'],
      {
        queryParams: { id, companyName },
      }
    );
  }

  deleteCompany(id: number) {
    const token = this.tokenService.getToken();
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Unauthorized',
        text: 'No valid token found. Please log in again.',
      });
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this company? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.distributionHubService.deleteCompany(id).subscribe(
          () => {
            Swal.fire('Deleted!', 'The company has been deleted.', 'success');
            this.fetchAllCompanys();
          },
          () => {
            Swal.fire(
              'Error!',
              'There was an error deleting the company.',
              'error'
            );
          }
        );
      }
    });
  }

  back(): void {
    this.router.navigate(['/distribution-hub/action']);
  }

  add(): void {
    this.router
      .navigate(['/distribution-hub/action/create-company'], {
        queryParams: { type: 'distribution' },
      })
      .then(() => {
        this.isLoading = false;
      });
  }

  openImageInNewTab(imageUrl: string): void {
    if (imageUrl.startsWith('data:')) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
        <html>
          <head><title>Image Preview</title></head>
          <body style="margin:0">
            <img src="${imageUrl}" style="width:100%; height:100%" />
          </body>
        </html>
      `);
        newWindow.document.close();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Popup Blocked',
          text: 'Please allow popups for this site to view the image.',
        });
      }
    } else if (imageUrl.startsWith('http')) {
      window.open(imageUrl, '_blank');
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Image URL',
        text: 'Image URL is not valid. Cannot open in new tab.',
      });
    }
  }
}

class CompanyDetails {
  id!: number;
  companyId!: number;
  companyNameEnglish!: string;
  companyEmail!: string;
  status!: number;
  code1!: number;
  contact01!: number;
  code2!: number;
  contact02!: number;
  logo!: string;
  favicon!: string;
  centerOfficerName!: string;
  ownedCentersCount!: number;
  managerCount!: number;
  officerCount!: number;
}