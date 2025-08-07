// import { Component } from '@angular/core';
// import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
// import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import Swal from 'sweetalert2';
// import { TokenService } from '../../../services/token/services/token.service';
// import { FormsModule } from '@angular/forms';
// import { PermissionService } from '../../../services/roles-permission/permission.service';

// @Component({
//   selector: 'app-manage-company',
//   standalone: true,
//   imports: [LoadingSpinnerComponent, CommonModule, FormsModule],
//   templateUrl: './manage-company.component.html',
//   styleUrl: './manage-company.component.css',
// })
// export class ManageCompanyComponent {
//   companies: CompanyDetails[] = [];
//   isLoading = false;
//   total: number | null = null;
//   private token = this.tokenService.getToken();
//   search: string = '';

//   constructor(
//     private companyService: CollectionCenterService,
//     private router: Router,
//     public tokenService: TokenService,
//     public permissionService: PermissionService
//   ) {}

//   ngOnInit() {
//     this.fetchAllCompanys();
//   }

//   fetchAllCompanys() {
//     this.isLoading = true;
//     this.companyService.getAllCompanyDetails(this.search).subscribe(
//       (response: any) => {
//         this.isLoading = false;
//         this.companies = response.results;
//         this.total = response.total;
//       },
//       () => {
//         this.isLoading = false;
//       }
//     );
//   }

//   searchPlantCareUsers() {
//     this.fetchAllCompanys();
//   }

//   clearSearch(): void {
//     this.search = '';
//     this.fetchAllCompanys();
//   }

//   editCompany(id: number) {
//     this.router.navigate(['/collection-hub/create-company'], {
//       queryParams: { id },
//     });
//   }

//   viewCompany(id: number, isView: boolean) {
//     this.router.navigate(['/collection-hub/create-company'], {
//       queryParams: { id, isView },
//     });
//   }

//   viewCompanyHeadPortals(id: number, companyName: string) {
//     this.router.navigate(['/collection-hub/view-company-head'], {
//       queryParams: { id, companyName },
//     });
//   }

//   deleteCompany(id: number) {
//     const token = this.tokenService.getToken();
//     if (!token) {
//       return;
//     }

//     Swal.fire({
//       title: 'Are you sure?',
//       text: 'Do you really want to delete this company? This action cannot be undone.',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#3085d6',
//       cancelButtonColor: '#d33',
//       confirmButtonText: 'Yes, delete it!',
//       cancelButtonText: 'Cancel',
//     }).then((result) => {
//       if (result.isConfirmed) {
//         this.companyService.deleteCompany(id).subscribe(
//           () => {
//             Swal.fire('Deleted!', 'The company has been deleted.', 'success');
//             this.fetchAllCompanys();
//           },
//           () => {
//             Swal.fire(
//               'Error!',
//               'There was an error deleting the company.',
//               'error'
//             );
//           }
//         );
//       }
//     });
//   }

//   back(): void {
//     this.router.navigate(['/collection-hub']);
//   }

//   add(): void {
//     this.router.navigate(['/collection-hub/create-company']);
//   }
// }

// class CompanyDetails {
//   id!: number;
//   companyName!: string;
//   companyEmail!: string;
//   status!: number;
//   jobRole!: string;
//   numOfHead!: number;
//   numOfManagers!: number;
//   numOfOfficers!: number;
//   numOfCustomerOfficers!: number;
//   numOfCenters!: number;
// }
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
  hasData=false;

  constructor(
    private companyService: CollectionCenterService,
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) {}

  ngOnInit() {
    this.fetchAllCompanys();
  }

  fetchAllCompanys() {
    this.isLoading = true;
    this.companyService.getAllCompanyDetails(this.search).subscribe(
      (response: any) => {
        this.isLoading = false;
        this.companies = response.results;
        this.total = response.total;
        this.hasData = this.companies.length >0;

      },
      () => {
        this.isLoading = false;
        this.hasData=false;
      }
    );
  }

  searchPlantCareUsers(): void {
    this.search = this.search?.trim() || ''
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
        this.companyService.deleteCompany(id).subscribe(
          () => {
            Swal.fire('Deleted!', 'The company has been deleted.', 'success');
            this.fetchAllCompanys();
          },
          () => {
            Swal.fire('Error!', 'There was an error deleting the company.', 'error');
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
  companyName!: string;
  companyEmail!: string;
  status!: number;
  jobRole!: string;
  numOfHead!: number;
  numOfManagers!: number;
  numOfOfficers!: number;
  numOfCustomerOfficers!: number;
  numOfCenters!: number;
}
