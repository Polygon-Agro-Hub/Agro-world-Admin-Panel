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
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  hasData: boolean = true;

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

  fetchCompanies(page: number = 1, limit: number = this.itemsPerPage) {
    this.page = page;
    this.isLoading = true;

    this.companyService.getAllCompaniesWithPagination(page, limit).subscribe(
      (data) => {
        this.isLoading = false;
        this.companies = data.companies;
        this.hasData = this.companies.length > 0;
        this.totalItems = data.total;
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching companies:', error);
        Swal.fire('Error', 'Failed to fetch companies.', 'error');
      }
    );
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchCompanies(this.page, this.itemsPerPage);
  }

  viewCompany(id: number | undefined) {
    if (id === undefined) {
      console.error('Company ID is undefined');
      return;
    }
    // TODO: Implement view functionality
    console.log('View company:', id);
  }

  editCompany(id: number | undefined) {
    if (id === undefined) {
      console.error('Company ID is undefined');
      return;
    }
    // TODO: Implement edit functionality
    console.log('Edit company:', id);
  }

  deleteCompany(id: number | undefined) {
    if (id === undefined) {
      console.error('Company ID is undefined');
      return;
    }
    // TODO: Implement delete functionality
    console.log('Delete company:', id);
  }

  addNew() {
    this.router.navigate(['/plant-care/action/add-company-details']);
  }

  onBack(): void {
    this.location.back();
  }
}
