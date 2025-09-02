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
  title?: string; // Optional to handle title in popup
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
    private router: Router
  ) {
    this.searchSubject.pipe(debounceTime(300)).subscribe((searchText) => {
      this.filterCustomers(searchText);
    });
  }

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
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after going back!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Go Back',
      cancelButtonText: 'No, Stay Here',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
      buttonsStyling: true,
    }).then((result) => {
      if (result.isConfirmed) {
       this.router.navigate(['/sales-dash']);
      }
    });
  }

  copyToClipboard(value: string | undefined, field: string) {
    if (!value) return;

    // Clear any existing timeout
    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
    }

    navigator.clipboard
      .writeText(value)
      .then(() => {
        this.copiedField = field;

        // Reset the copied field after 2 seconds
        this.copyTimeout = setTimeout(() => {
          this.copiedField = null;
        }, 2000);
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
        // Optional: You can still show an error if you want
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
    this.customerService.getCustomers(page, limit, '').subscribe(
      (response: any) => {
        this.isLoading = false;
        this.customers = response.items || [];
        this.totalItems = response.totalItems || this.customers.length;
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
    console.log('Input starts with a space');
    // Optionally clean it
    searchText = searchText.trimStart();
  }

  this.searchSubject.next(searchText);
}

onSearchClick() {
  const trimmedSearch = this.searchText.trimStart();
  this.filterCustomers(trimmedSearch);
}


  filterCustomers(searchText: string) {
    const loweredSearch = searchText.trim().toLowerCase();
    if (!loweredSearch) {
      this.filteredCustomers = [...this.customers];
    } else {
      this.filteredCustomers = this.customers.filter((customer) =>
        this.searchInCustomer(customer, loweredSearch)
      );
    }
    this.hasData = this.filteredCustomers.length > 0;
    this.page = 1;
    this.totalItems = this.filteredCustomers.length;
  }

  private searchInCustomer(customer: Customers, searchText: string): boolean {
  const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();

  const fieldsToSearch = [
    customer.cusId,                // Customer ID
    fullName,                       // Customer Name
    customer.phoneNumber,           // Contact
    customer.empId                  // Agent ID
  ];

  return fieldsToSearch.some((field) =>
    field?.toLowerCase().includes(searchText)
  );
}


  offSearch() {
    this.searchText = '';
    this.filterCustomers('');
  }

  onPageChange(event: number) {
    this.page = event;
  }

  viewOrderDetails(id: number) {
    this.router.navigate(['/sales-dash/customers-orders', id]);
  }
}
