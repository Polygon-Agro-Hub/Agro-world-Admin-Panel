import { Component } from '@angular/core';
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
  styleUrl: './view-companies.component.css',
})
export class ViewCompaniesComponent {
  companies: CompanyDetails[] = [];
  isLoading = false;
  total: number | null = null;
  private token = this.tokenService.getToken();
  search: string = '';

  constructor(
    private distributionHubService: DistributionHubService,
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) {}

  ngOnInit() {
    this.fetchAllCompanys();
  }

  fetchAllCompanys() {
    this.isLoading = true;
    this.distributionHubService.getAllCompanyDetails(this.search).subscribe(
      (response: any) => {
        console.log('this is the responce', response);

        this.isLoading = false;
        this.companies = response.results;
        this.total = response.total;
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  searchPlantCareUsers() {
    this.fetchAllCompanys();
  }

  clearSearch(): void {
    this.search = '';
    this.fetchAllCompanys();
  }

  editCompany(id: number) {
    this.router.navigate(['/collection-hub/create-company'], {
      queryParams: { id },
    });
  }

  viewCompany(id: number, isView: boolean) {
    this.router.navigate(['/collection-hub/create-company'], {
      queryParams: { id, isView },
    });
  }

  viewCompanyHeadPortals(id: number, companyName: string) {
    this.router.navigate(['/collection-hub/view-company-head'], {
      queryParams: { id, companyName },
    });
  }

  deleteCompany(id: number) {
    const token = this.tokenService.getToken();
    if (!token) {
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
    this.router.navigate(['/collection-hub']);
  }

  add(): void {
    this.router.navigate(['/collection-hub/create-company']);
  }
}

class CompanyDetails {
  id!: number;
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
