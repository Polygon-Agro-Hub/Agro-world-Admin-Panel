import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CustomersService } from '../../../services/dash/customers.service';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { debounceTime, Subject } from 'rxjs';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';

interface Customers {
  id: number;
  cusId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  empId: string;
  created_at: string;
  totOrders: number;
  email: string;
  salesAgentFirstName: string;
  salesAgentLastName: string;
  buildingType: string;
  houseHouseNo: string;
  houseStreetName: string;
  houseCity: string;
  apartmentBuildingNo: string;
  apartmentBuildingName: string;
  apartmentUnitNo: string;
  apartmentHouseNo: string;
  apartmentStreetName: string;
  apartmentCity: string;
  apartmentFloorNo: string;
  title?: string;
}

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    FormsModule,
    NgxPaginationModule,
    RouterModule,
  ],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css'],
})
export class CustomersComponent implements OnInit {
  customers: Customers[] = [];
  filteredCustomers: Customers[] = [];
  isLoading = true;
  hasData: boolean = true;
  isPopupOpen = false;
  selectedCustomer: any = null;

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  searchText: string = '';
  copiedField: string | null = null;
  copyTimeout: any = null;

  private searchSubject = new Subject<string>();

  constructor(
    private customerService: CustomersService,
    private http: HttpClient,
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService,
  ) { }

  ngOnInit() {
    this.fetchAllCustomers();
  }

  openPopup(customer: any) {
    this.selectedCustomer = customer;
    this.isPopupOpen = true;
  }

  closePopup() {
    this.isPopupOpen = false;
    this.selectedCustomer = null;
  }

  back(): void {
    this.router.navigate(['/sales-dash']);
  }

  copyToClipboard(value: string | undefined, field: string) {
    if (!value) return;

    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
    }

    navigator.clipboard
      .writeText(value)
      .then(() => {
        this.copiedField = field;

        this.copyTimeout = setTimeout(() => {
          this.copiedField = null;
        }, 2000);
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Failed to copy. Please try again.',
        });
      });
  }

  fetchAllCustomers(
    page: number = this.page,
    limit: number = this.itemsPerPage
  ) {
    this.isLoading = true;
    this.customerService.getCustomers(page, limit, this.searchText).subscribe(
      (response: any) => {
        this.isLoading = false;
        this.customers = response.items || [];
        this.totalItems = response.total;
        this.filteredCustomers = [...this.customers];
        this.hasData = this.filteredCustomers.length > 0;
      },
      (error) => {
        console.error('Error fetching customers', error);
        this.isLoading = false;
        this.customers = [];
        this.filteredCustomers = [];
        this.hasData = false;
      }
    );
  }
  onSearchChange(searchText: string) {
    if (searchText.startsWith(' ')) {
      searchText = searchText.trimStart();
    }

    this.searchSubject.next(searchText);
  }

  onSearchClick() {
  this.searchText = this.searchText.trimStart();
  this.page = 1;
  this.fetchAllCustomers();
}


  private searchInCustomer(customer: Customers, searchText: string): boolean {
  const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
  const lowerSearch = searchText.toLowerCase();

  const fieldsToSearch = [
    customer.cusId?.toLowerCase(),
    fullName,
    customer.phoneNumber?.toLowerCase(),
    customer.empId?.toLowerCase()
  ];

  return fieldsToSearch.some((field) =>
    field?.includes(lowerSearch)
  );
}


 offSearch() {
  this.searchText = '';
  this.page = 1;
  this.fetchAllCustomers();
}

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllCustomers();
  }

  viewOrderDetails(id: number) {
    this.router.navigate(['/sales-dash/customers-orders', id]);
  }
}
