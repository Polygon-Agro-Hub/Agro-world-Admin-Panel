import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { ViewPackageListService } from '../../../services/market-place/view-package-list.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from '../../../services/token/services/token.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { environment } from '../../../environment/environment';
import { CalendarModule } from 'primeng/calendar';

interface PackageList {
  id: number;
  adminUser: string;
  displayName: string;
  image: string;
  description: string;
  total: number;
  status: string;
  discount: number;
  subtotal: number;
  defineDate: string;
  createdAt: string;
  groupStatus: any;
}

@Component({
  selector: 'app-view-package-list',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, DropdownModule, FormsModule,CalendarModule],
  templateUrl: './view-package-list.component.html',
  styleUrl: './view-package-list.component.css',
})
export class ViewPackageListComponent implements OnInit {
  date: Date | null = null;
  viewPackageList: PackageList[] = [];
  isLoading = false;
  hasData: boolean = true;
  lastDefinedDates: { [key: number]: string } = {};
  statusOptions = [
    { label: 'All', value: null },
    { label: 'Enabled', value: 'Enabled' },
    { label: 'Disabled', value: 'Disabled' },
  ];
  selectedStatus: any;
  searchtext: string = '';

  isPopupVisible: boolean = false;
  popUpStatus: string = '';
  popUpId!:number;
  

  constructor(
    private router: Router,
    private viewPackagesList: ViewPackageListService,
    private http: HttpClient,
    private tokenService: TokenService
  ) {}

  ngOnInit() {
    this.fetchAllPackages();
  }

  back(): void {
    this.router.navigate(['/market/action']);
  }

  fetchAllPackages(searchText: string = this.searchtext, date?: Date | null) {
    this.isLoading = true;
    // Trim the search string to remove leading/trailing spaces
    const trimmedSearch = searchText.trim();
    let dateString = '';
    if (date instanceof Date && !isNaN(date.getTime())) {
      // Format as yyyy-mm-dd in local time
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      dateString = `${year}-${month}-${day}`;
    }
    this.viewPackagesList.getAllMarketplacePackages(trimmedSearch, dateString).subscribe(
      (response) => {
        console.log('Package list response:', response);
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
        Swal.fire({title: 'Unauthorized', text: 'Please log in again.', icon: 'error',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        },}
          );
          this.router.navigate(['/login']);
        } else {
            Swal.fire({title: 'Error', text: 'Failed to fetch packages.', icon: 'error', 
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
            }}
          );
        }
      }
    );
  }
  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  editPackage(id: number) {
    this.router.navigate([`/market/action/edit-packages/${id}`]);
  }

  viewPackage(id: number) {
    this.router.navigate([`/market/action/view-package-details/${id}`]);
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
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
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
              Swal.fire({title: 'Deleted', text: 'The package has been deleted.', icon: 'success', 
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
            }})
              this.fetchAllPackages();
            },
            error: (error) => {
              this.isLoading = false;
              console.error('Error deleting package:', error);
              Swal.fire(
                {title: 'Error',
                text: 'There was a problem deleting the package.',
                icon: 'error',
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold',
                }}
                
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

onSearch() {
    this.searchtext = this.searchtext.trim(); // Trim leading/trailing spaces
    if (!this.searchtext) {
      
      Swal.fire(
        {title: 'Info',
        text: 'Please enter a valid search term.',
        icon: 'info',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        }}
        
      );
      return;
    }
    this.fetchAllPackages(this.searchtext, this.date);
  }

  offSearch() {
    this.searchtext = '';
    this.fetchAllPackages('', this.date);
  }

  clearDateFilter() {
    this.date = null;
    this.fetchAllPackages(this.searchtext);
  }

  viewDefinePackage(id: number) {
    this.router.navigate([`/market/action/define-package-view`], {
      queryParams: { id },
    });
  }

  viewDefinePackageDate(id: number) {
    console.log('Navigating to history with package ID:', id); // Debugging
    this.router.navigate([`/market/action/view-package-history`], {
      queryParams: { id },
    });
  }

  dateFilter() {
    if (this.date instanceof Date && !isNaN(this.date.getTime())) {
      this.isLoading = true;
      const year = this.date.getFullYear();
      const month = (this.date.getMonth() + 1).toString().padStart(2, '0');
      const day = this.date.getDate().toString().padStart(2, '0');
      let dateString = `${year}-${month}-${day}`;
      this.viewPackagesList
        .getAllMarketplacePackages(this.searchtext, dateString)
        .subscribe(
          (response) => {
            console.log('Filtered package list response:', response);
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
            console.error('Error filtering packages by date', error);
            this.isLoading = false;
            if (error.status === 401) {
              this.router.navigate(['/login']);
            }
          }
        );
    } else {
      this.fetchAllPackages();
    }
  }

  disablePopup(pkg:any){
    this.isPopupVisible= true;
    this.popUpStatus = pkg.status === 'Enabled' ? 'Disabled' : 'Enabled';
    this.popUpId = pkg.id;
  }

  changeStatus(){
    this.viewPackagesList.changePackageStatus({id:this.popUpId, status:this.popUpStatus}).subscribe(
      (res)=>{
        if(res.status){
          
          Swal.fire(
            {title: 'Success',
            text: 'Package status updated successfully',
            icon: 'success',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
            }}
            
          );
          this.isPopupVisible = false;
          this.popUpStatus = '';
          this.fetchAllPackages();
        }else{
          
          Swal.fire(
            {title: 'Error',
            text: 'Failed to update package status',
            icon: 'error',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
            }}
            
          );
        }
      }
    )
  }
}