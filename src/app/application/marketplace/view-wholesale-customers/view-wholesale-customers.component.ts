import { Component, OnInit } from '@angular/core';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-view-wholesale-customers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    LoadingSpinnerComponent,
    DropdownModule,
  ],
  templateUrl: './view-wholesale-customers.component.html',
  styleUrl: './view-wholesale-customers.component.css',
})
export class ViewWholesaleCustomersComponent implements OnInit {
  customerObj: Customers[] = [];
  searchText: string = '';
  isPopupOpen: boolean = false;
  cusObjDetails: Customers = new Customers();

  hasData: boolean = false;
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  isLoading = true;

  // ─── Copy helpers ───
  copiedEmail: string = '';
  copiedPhone: string = '';
  copiedPhone1: string = '';
  showToast: boolean = false;

  // ─── Rating Filter ───
  selectedRatingFilter: string = '';

  // ─── Update Rating Popup ───
  isRatingPopupOpen: boolean = false;
  selectedCustomerForRating: Customers | null = null;
  selectedNewRating: string = '';
  isUpdatingRating: boolean = false;
  showRatingToast: boolean = false;

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

  constructor(
    private marketSrv: MarketPlaceService,
    private router: Router,
    public permissionService: PermissionService,
    public tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.fetchWholesaleCustomers();
  }

  goBack(): void {
    this.router.navigate(['/market/action']);
  }

  // ─────────────────────────────────────────
  //  Fetch
  // ─────────────────────────────────────────

  fetchWholesaleCustomers(
    page: number = this.page,
    limit: number = this.itemsPerPage,
    searchText: string = this.searchText,
    ratingFilter: string = this.selectedRatingFilter
  ) {
    this.isLoading = true;
    this.marketSrv
      .fetchAllWholesaleCustomers(page, limit, searchText, ratingFilter)
      .subscribe(
        (res) => {
          this.customerObj = res.items;
          this.totalItems  = res.total;
          this.hasData     = res.items.length > 0;
          this.isLoading   = false;
        },
        (err) => {
          console.error('Error fetching wholesale customers', err);
          this.hasData   = false;
          this.isLoading = false;
        }
      );
  }

  // ─────────────────────────────────────────
  //  Pagination / Search / Filter
  // ─────────────────────────────────────────

  onPageChange(event: number) {
    this.page = event;
    this.fetchWholesaleCustomers();
  }

  onSearch() {
    this.page = 1;
    this.fetchWholesaleCustomers();
  }

  offSearch() {
    this.searchText = '';
    this.page = 1;
    this.fetchWholesaleCustomers();
  }

  applyRatingFilter() {
    this.page = 1;
    this.fetchWholesaleCustomers();
  }

  // ─────────────────────────────────────────
  //  Customer Details Popup
  // ─────────────────────────────────────────

  detailsPop(obj: Customers) {
    this.isPopupOpen  = true;
    this.cusObjDetails = obj;
  }

  // ─────────────────────────────────────────
  //  Update Rating Popup
  // ─────────────────────────────────────────

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

    this.marketSrv
      .updateWholesaleCustomerRating(
        this.selectedCustomerForRating.id,
        this.selectedNewRating
      )
      .subscribe(
        () => {
          // Update the row in-place so the table refreshes instantly
          const target = this.customerObj.find(
            (c) => c.id === this.selectedCustomerForRating!.id
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
        }
      );
  }

  // ─────────────────────────────────────────
  //  Helpers
  // ─────────────────────────────────────────

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
      VVIP: 'VVIP',
      VIP:  'VIP',
      COR:  'COR',
      NOR:  'NOR',
      VVP:  'VVP',
    };
    return map[rating] ?? rating;
  }

  copyToClipboard(text: string, type: 'email' | 'phone' | 'phone1') {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        if (type === 'email') {
          this.copiedEmail = text;
          setTimeout(() => (this.copiedEmail = ''), 2000);
        } else if (type === 'phone') {
          this.copiedPhone = text;
          setTimeout(() => (this.copiedPhone = ''), 2000);
        } else {
          this.copiedPhone1 = text;
          setTimeout(() => (this.copiedPhone1 = ''), 2000);
        }
      })
      .catch((err) => console.error('Failed to copy:', err));
  }

  viewOrderDetails(id: string) {
    this.router.navigate(['/market/action/view-order-details', id]);
  }

  trimLeadingSpaces() {
    if (this.searchText?.startsWith(' ')) {
      this.searchText = this.searchText.trimStart();
    }
  }

  checkLeadingSpace(event: any): boolean {
    if (!this.searchText || this.searchText.length === 0) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  preventLeadingSpace(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    if (event.key === ' ' && input.selectionStart === 0) {
      event.preventDefault();
    }
  }
}

// ─────────────────────────────────────────
//  Model
// ─────────────────────────────────────────

class Customers {
  id!: string;
  title!: string;
  firstName!: string;
  lastName!: string;
  phoneCode!: string;
  phoneNumber!: string;
  totalOrders!: number;
  cusId!: string;
  created_at!: string;
  email!: string;
  buildingType!: string;
  houseNo!: string;
  streetName!: string;
  city!: string;
  buildingNo!: string;
  buildingName!: string;
  unitNo!: string;
  floorNo!: string;
  AparthouseNo!: string;
  ApartstreetName!: string;
  Apartcity!: string;
  companyName!: string;
  companyPhoneCode!: string;
  companyPhone!: string;
  rateofCus?: string; 
}