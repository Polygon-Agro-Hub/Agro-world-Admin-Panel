// customers.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CustomersService } from '../../../services/dash/customers.service';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { Subject } from 'rxjs';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { DropdownModule } from 'primeng/dropdown';
import { SalesAgentsService } from '../../../services/dash/sales-agents.service';

// ─────────────────────────────────────────────────────────────────────────────
//  Model
// ─────────────────────────────────────────────────────────────────────────────
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
  rateofCus?: string; // 'VVIP' | 'VIP' | 'COR' | 'NOR' | 'VVP'
}

// ─────────────────────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    FormsModule,
    NgxPaginationModule,
    RouterModule,
    DropdownModule,       // ← added for rating dropdowns
  ],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css'],
})
export class CustomersComponent implements OnInit {
  // ── Table data ─────────────────────────────────────────────────────────────
  customers: Customers[]         = [];
  filteredCustomers: Customers[] = [];
  isLoading                      = true;
  hasData                        = true;

  // ── Pagination / search ────────────────────────────────────────────────────
  page: number        = 1;
  totalItems: number  = 0;
  itemsPerPage        = 10;
  searchText          = '';

  // ── Details popup ──────────────────────────────────────────────────────────
  isPopupOpen      = false;
  selectedCustomer: Customers | null = null;

  // ── Copy-to-clipboard ─────────────────────────────────────────────────────
  copiedField: string | null = null;
  copyTimeout: any           = null;

  // ── Rating filter (header bar) ────────────────────────────────────────────
  selectedRatingFilter = '';
  selectedAgentFilter: number | string = '';
  agentFilterOptions: Array<{ label: string; value: number }> = [];

  // ── Update-rating popup ───────────────────────────────────────────────────
  isRatingPopupOpen            = false;
  selectedCustomerForRating: Customers | null = null;
  selectedNewRating            = '';
  isUpdatingRating             = false;
  showRatingToast              = false;

    /** Options shown in the filter dropdown (header bar) */
  ratingFilterOptions = [
    { label: 'X 2 Stars', value: 'VVIP', icon: 'assets/images/ratings/VIP.png' },
    { label: 'X 1 Star',   value: 'VIP',  icon: 'assets/images/ratings/VIP.png'  },
    { label: 'X 1 Star',   value: 'COR',  icon: 'assets/images/ratings/COR2.png' },
    { label: 'X 1 Star',   value: 'NOR',  icon: 'assets/images/ratings/NOR.png'  },
    { label: 'X 1 Star',   value: 'VVP',  icon: 'assets/images/ratings/vvp.png'  },
  ];

  /** Options shown inside the Update Ratings popup dropdown */
  ratingUpdateOptions = [
    { label: 'X 2 Stars', value: 'VVIP' },
    { label: 'X 1 Star',   value: 'VIP'  },
    { label: 'X 1 Star',   value: 'COR'  },
    { label: 'X 1 Star',   value: 'NOR'  },
    { label: 'X 1 Star',   value: 'VVP'  },
  ];

  private searchSubject = new Subject<string>();

  constructor(
    private customerService: CustomersService,
    private http: HttpClient,
    private router: Router,
    private salesAgentsService: SalesAgentsService,
    public tokenService: TokenService,
    public permissionService: PermissionService,
  ) {}

  ngOnInit() {
    this.fetchAllCustomers();
    this.fetchApprovedAgents();
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  Fetch
  // ─────────────────────────────────────────────────────────────────────────

  fetchAllCustomers(
    page: number  = this.page,
    limit: number = this.itemsPerPage,
  ) {
    this.isLoading = true;

    this.customerService
      .getCustomers(
        page,
        limit,
        this.searchText,
        this.selectedRatingFilter,
        this.selectedAgentFilter,
      )
      .subscribe(
        (response: any) => {
          this.isLoading         = false;
          this.customers         = response.items || [];
          this.totalItems        = response.total;
          this.filteredCustomers = [...this.customers];
          this.hasData           = this.filteredCustomers.length > 0;
        },
        (error) => {
          console.error('Error fetching customers', error);
          this.isLoading         = false;
          this.customers         = [];
          this.filteredCustomers = [];
          this.hasData           = false;
        },
      );
  }

  fetchApprovedAgents() {
    this.salesAgentsService.getAllSalesAgents(1, 1000, '', 'Approved').subscribe(
      (response: any) => {
        this.agentFilterOptions = (response.items || [])
          .map((agent: any) => ({
            label: `${agent.empId} - ${agent.firstName} ${agent.lastName}`,
            value: agent.id,
          }))
          .sort(
            (
              firstAgent: { label: string; value: number },
              secondAgent: { label: string; value: number },
            ) =>
            firstAgent.label.localeCompare(secondAgent.label, undefined, {
              numeric: true,
            }),
          );
      },
      (error) => console.error('Error fetching approved sales agents', error),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  Pagination / Search / Rating Filter
  // ─────────────────────────────────────────────────────────────────────────

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllCustomers();
  }

  onSearchChange(searchText: string) {
    if (searchText.startsWith(' ')) searchText = searchText.trimStart();
    this.searchSubject.next(searchText);
  }

  onSearchClick() {
    this.searchText = this.searchText.trimStart();
    this.page       = 1;
    this.fetchAllCustomers();
  }

  offSearch() {
    this.searchText = '';
    this.page       = 1;
    this.fetchAllCustomers();
  }

  applyRatingFilter() {
    this.page = 1;
    this.fetchAllCustomers();
  }

  applyAgentFilter() {
    this.page = 1;
    this.fetchAllCustomers();
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  Customer Details Popup
  // ─────────────────────────────────────────────────────────────────────────

  openPopup(customer: Customers) {
    this.selectedCustomer = customer;
    this.isPopupOpen      = true;
  }

  closePopup() {
    this.isPopupOpen      = false;
    this.selectedCustomer = null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  Update-Rating Popup
  // ─────────────────────────────────────────────────────────────────────────

  openUpdateRatingPopup(customer: Customers) {
    this.selectedCustomerForRating = customer;
    this.selectedNewRating         = customer.rateofCus ?? '';
    this.isRatingPopupOpen         = true;
  }

  closeUpdateRatingPopup() {
    this.isRatingPopupOpen         = false;
    this.selectedCustomerForRating = null;
    this.selectedNewRating         = '';
  }

  submitUpdateRating() {
    if (!this.selectedCustomerForRating || !this.selectedNewRating) return;

    this.isUpdatingRating = true;

    this.customerService
      .updateDashCustomerRating(
        this.selectedCustomerForRating.id,
        this.selectedNewRating,
      )
      .subscribe(
        () => {
          // Update the row in-place so the table refreshes instantly
          const target = this.filteredCustomers.find(
            (c) => c.id === this.selectedCustomerForRating!.id,
          );
          if (target) target.rateofCus = this.selectedNewRating;

          this.isUpdatingRating = false;
          this.closeUpdateRatingPopup();

          this.showRatingToast = true;
          setTimeout(() => (this.showRatingToast = false), 3000);
        },
        (err) => {
          console.error('Error updating rating', err);
          this.isUpdatingRating = false;
        },
      );
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  Helpers
  // ─────────────────────────────────────────────────────────────────────────

  back() {
    this.router.navigate(['/sales-dash']);
  }

  viewOrderDetails(id: number) {
    this.router.navigate(['/sales-dash/customers-orders', id]);
  }

  /** Returns the star-icon asset path for a given rating code */
  getRatingIcon(rating: string): string {
    const map: Record<string, string> = {
      VVIP: 'assets/images/ratings/VVIP.png',
      VIP:  'assets/images/ratings/VIP.png',
      COR:  'assets/images/ratings/COR2.png',
      NOR:  'assets/images/ratings/NOR.png',
      VVP:  'assets/images/ratings/vvp.png',
    };
    return map[rating] ?? '';
  }

  getRatingLabel(rating: string): string {
    const map: Record<string, string> = {
      VVIP: 'X 2 Stars',
      VIP:  'X 1 Star',
      COR:  'X 1 Star',
      NOR:  'X 1 Star',
      VVP:  'X 1 Star',
    };
    return map[rating] ?? rating;
  }

  copyToClipboard(value: string | undefined, field: string) {
    if (!value) return;
    if (this.copyTimeout) clearTimeout(this.copyTimeout);

    navigator.clipboard.writeText(value).then(
      () => {
        this.copiedField  = field;
        this.copyTimeout  = setTimeout(() => (this.copiedField = null), 2000);
      },
      (err) => {
        console.error('Failed to copy:', err);
        Swal.fire({ icon: 'error', title: 'Oops!', text: 'Failed to copy. Please try again.' });
      },
    );
  }

  private searchInCustomer(customer: Customers, searchText: string): boolean {
    const fullName    = `${customer.firstName} ${customer.lastName}`.toLowerCase();
    const lowerSearch = searchText.toLowerCase();
    return [customer.cusId, fullName, customer.phoneNumber, customer.empId]
      .some((f) => f?.toLowerCase().includes(lowerSearch));
  }
}