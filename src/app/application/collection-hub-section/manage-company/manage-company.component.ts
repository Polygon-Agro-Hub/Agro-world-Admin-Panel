import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { TokenService } from '../../../services/token/services/token.service';
import { FormsModule } from '@angular/forms';
import { PermissionService } from '../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-manage-company',
  standalone: true,
  imports: [LoadingSpinnerComponent, CommonModule, FormsModule],
  templateUrl: './manage-company.component.html',
  styleUrl: './manage-company.component.css',
})
export class ManageCompanyComponent {
  companies: CompanyDetails[] = [];
  isLoading = false;
  total: number | null = null;
  search: string = '';
  hasData = false;
  urlSegment: string = '';

  constructor(
    private companyService: CollectionCenterService,
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService,
  ) {}

  ngOnInit() {
    this.fetchAllCompanys();
    this.urlSegment = this.router.url
      .split('/')
      .filter((segment) => segment.length > 0)[0];
  }

  fetchAllCompanys() {
    this.isLoading = true;
    this.companyService.getAllCompanyDetails(this.search).subscribe(
      (response: any) => {
        this.isLoading = false;
        this.companies = response.results;
        this.total = response.total;
        this.hasData = this.companies.length > 0;
      },
      () => {
        this.isLoading = false;
        this.hasData = false;
      },
    );
  }

  searchPlantCareUsers(): void {
    this.search = this.search?.trim() || '';
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
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#dc2626',
    }).then((result) => {
      if (result.isConfirmed) {
        this.companyService.deleteCompany(id).subscribe(
          () => {
            Swal.fire({
              title: 'Deleted!',
              text: 'The company has been deleted.',
              icon: 'success',
              customClass: {
                popup:
                  'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold',
              },
              confirmButtonColor: '#2563eb',
            });
            this.fetchAllCompanys();
          },
          () => {
            Swal.fire({
              title: 'Error!',
              text: 'There was an error deleting the company.',
              icon: 'error',
              customClass: {
                popup:
                  'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold',
              },
              confirmButtonColor: '#2563eb',
            });
          },
        );
      }
    });
  }

  back(): void {
    window.history.back();
  }

  add(): void {
    this.router.navigate(['/collection-hub/create-company']);
  }
}

class CompanyDetails {
  id!: number;
  companyName!: string;
  companyEmail!: string;
  status!: number;
  jobRole!: string;
  numOfHead!: number;
  numOfManagers!: number;
  numOfOfficers!: number;
  numOfCustomerOfficers!: number;
  numOfCenters!: number;
  oicConCode1!: string;
  oicConCode2!: string;
  oicConNum1!: string;
  oicConNum2!: string;
  userName!: string;
}
