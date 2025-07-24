import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';
import { Router } from '@angular/router';
import { DistributionHubService } from '../../../services/distribution-hub/distribution-hub.service';
import { Subject, Subscription } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
} from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-companies',
  standalone: true,
  imports: [LoadingSpinnerComponent, CommonModule, FormsModule],
  templateUrl: './view-companies.component.html',
  styleUrls: ['./view-companies.component.css'],
})
export class ViewCompaniesComponent implements OnInit, OnDestroy {
  companies: CompanyDetails[] = [];
  isLoading = false;
  total: number | null = null;
  search: string = '';
  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription | null = null;

  constructor(
    private distributionHubService: DistributionHubService,
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) {}

  ngOnInit() {
    this.setupSearch();
    this.fetchAllCompanys(); // Initial fetch
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  private setupSearch() {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(300), // Wait 300ms after typing stops (adjust if needed)
        distinctUntilChanged((prev, curr) => prev.trim() === curr.trim()), // Ignore if trimmed search term is unchanged
        tap((term) => console.log('Search term after debounce:', term)), // Debug: Log search term
        switchMap((searchTerm: string) => {
          this.isLoading = true;
          console.log('Fetching companies for term:', searchTerm); // Debug: Log API call
          return this.distributionHubService.getAllCompanyDetails(
            searchTerm.trim()
          );
        })
      )
      .subscribe(
        (response: any) => {
          console.log('API Response:', response); // Debug: Log response
          this.isLoading = false;
          this.companies = response.results || [];
          this.total = response.total || 0;
          if (!this.companies.length && this.search.trim()) {
            Swal.fire({
              icon: 'info',
              title: 'No Results',
              text: 'No companies found matching your search criteria.',
            });
          }
        },
        (error) => {
          console.error('API Error:', error); // Debug: Log error
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to fetch companies. Please try again later.',
          });
        }
      );
  }

  fetchAllCompanys() {
    this.searchSubject.next(this.search); // Trigger search with current term
  }

  searchPlantCareUsers() {
    console.log('Search triggered:', this.search); // Debug: Log manual search
    this.searchSubject.next(this.search);
  }

  clearSearch(): void {
    this.search = '';
    this.searchSubject.next(''); // Trigger fetch with empty search
  }

  editCompany(id: number) {
    this.router.navigate(['/distribution-hub/action/create-company'], {
      queryParams: { id, type: 'distribution' },
    });
  }

  viewCompany(id: number, isView: boolean) {
    this.router.navigate(['/collection-hub/create-company'], {
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
            window.location.reload();
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
    // this.router.navigate(['/distribution-hub/action/create-company']);
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
      // Open a blank tab first
      const newWindow = window.open();
      if (newWindow) {
        // Write HTML to display the image
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
