import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import {
  CertificateCompanyService,
  CertificateCompany,
} from '../../../services/plant-care/certificate-company.service';
import { FormsModule } from '@angular/forms';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';

@Component({
  selector: 'app-view-company-list',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
    FormsModule,
  ],
  templateUrl: './view-company-list.component.html',
  styleUrls: ['./view-company-list.component.css'],
})
export class ViewCompanyListComponent implements OnInit {
  companies: CertificateCompany[] = [];
  isLoading = false;
  hasData: boolean = true;
  searchTerm: string = '';

  constructor(
    private companyService: CertificateCompanyService,
    private router: Router,
    private location: Location,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) {}

  ngOnInit() {
    this.fetchCompanies();
  }

  onSearch() {
    this.fetchCompanies();
  }

  offSearch() {
    this.searchTerm = '';
    this.fetchCompanies();
  }

  fetchCompanies() {
    this.isLoading = true;
    this.companyService.getAllCompanies(this.searchTerm).subscribe(
      (data) => {
        this.isLoading = false;
        this.companies = data.companies;
        this.hasData = this.companies.length > 0;
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching companies:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to fetch companies.',
          icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
      }
    );
  }

  onSearchChange() {
    this.fetchCompanies();
  }

  viewCompany(id: number | undefined) {
    if (!id) return;
    this.router.navigate([`/plant-care/action/view-company-details`, id]);
  }

  editCompany(id: number | undefined) {
    if (!id) return;
    this.router.navigate([`/plant-care/action/edit-company-details`, id]);
  }

  deleteCompany(id: number | undefined) {
    if (!id) return;

    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.companyService.deleteCompany(id).subscribe(
          (res) => {
            this.isLoading = false;
            Swal.fire({
              title: 'Deleted!',
              text: res.message,
              icon: 'success',
              customClass: {
                popup:
                  'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            });
            this.fetchCompanies();
          },
          (err) => {
            this.isLoading = false;
            Swal.fire({
              title: 'Error',
              text: 'Failed to delete company.',
              icon: 'error',
              customClass: {
                popup:
                  'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            });
          }
        );
      }
    });
  }

  addNew() {
    this.router.navigate(['/plant-care/action/add-company-details']);
  }

  onBack(): void {
    this.location.back();
  }
}
