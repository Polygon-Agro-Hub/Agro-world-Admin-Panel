import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';
import { DropdownModule } from 'primeng/dropdown';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-retail-customeres',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    LoadingSpinnerComponent,
    DropdownModule,
  ],
  templateUrl: './view-retail-customeres.component.html',
  styleUrls: ['./view-retail-customeres.component.css'],
})
export class ViewRetailCustomeresComponent implements OnInit {
  customerObj: Customers[] = [];
  searchText: string = '';
  isPopupOpen: boolean = false;
  cusObjDetails: Customers = new Customers();
  hasData: boolean = false;
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  isLoading: boolean = true;
  copiedPhone = false;
  copiedEmail = false;
  showToast: boolean = false;

  // ─── Rating Filter ───
  selectedRatingFilter: string = '';

  // ─── Update Rating Popup ───
  isRatingPopupOpen: boolean = false;
  selectedCustomerForRating: Customers | null = null;
  selectedNewRating: string = '';
  isUpdatingRating: boolean = false;
  showRatingToast: boolean = false;

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

  constructor(
    private marketSrv: MarketPlaceService,
    private router: Router,
    public permissionService: PermissionService,
    public tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.fetchRetailCustomers();
  }

  back(): void {
    this.router.navigate(['/market/action']);
  }

  // ─────────────────────────────────────────
  //  Fetch
  // ─────────────────────────────────────────

  fetchRetailCustomers(
    page: number = this.page,
    limit: number = this.itemsPerPage,
    searchText: string = this.searchText,
    ratingFilter: string = this.selectedRatingFilter
  ) {
    this.isLoading = true;

    this.marketSrv
      .fetchAllRetailCustomers(page, limit, searchText, ratingFilter)
      .subscribe(
        (res) => {
          this.customerObj = res.items;
          this.totalItems = res.total;
          this.hasData = res.items.length > 0;
          this.isLoading = false;
        },
        (err) => {
          console.error('Error fetching customers', err);
          this.hasData = false;
          this.isLoading = false;
        }
      );
  }

  // ─────────────────────────────────────────
  //  Pagination / Search / Filter
  // ─────────────────────────────────────────

  onPageChange(event: number) {
    this.page = event;
    this.fetchRetailCustomers();
  }

  onSearch() {
    this.page = 1;
    this.fetchRetailCustomers();
  }

  offSearch() {
    this.searchText = '';
    this.page = 1;
    this.fetchRetailCustomers();
  }

  applyRatingFilter() {
    this.page = 1;
    this.fetchRetailCustomers();
  }

  // ─────────────────────────────────────────
  //  Customer Details Popup
  // ─────────────────────────────────────────

  detailsPop(obj: Customers) {
    this.isPopupOpen = true;
    this.cusObjDetails = obj;
  }

  // ─────────────────────────────────────────
  //  Update Rating Popup
  // ─────────────────────────────────────────

  openUpdateRatingPopup(customer: Customers) {
    this.selectedCustomerForRating = customer;
    this.selectedNewRating = customer.rateofCus ?? '';
    this.isRatingPopupOpen = true;
  }

  closeUpdateRatingPopup() {
    this.isRatingPopupOpen = false;
    this.selectedCustomerForRating = null;
    this.selectedNewRating = '';
  }

  submitUpdateRating() {
  if (!this.selectedCustomerForRating || !this.selectedNewRating) return;

  this.isUpdatingRating = true;

  this.marketSrv
    .updateCustomerRating(this.selectedCustomerForRating.id, this.selectedNewRating)
    .subscribe(
      () => {
        // Update the row in-place so the table refreshes instantly
        const target = this.customerObj.find(
          (c) => c.id === this.selectedCustomerForRating!.id
        );
        if (target) target.rateofCus = this.selectedNewRating;

        this.isUpdatingRating = false;
        this.closeUpdateRatingPopup();

        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Rating updated successfully!',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
      },
      (err) => {
        console.error('Error updating rating', err);
        this.isUpdatingRating = false;

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update rating. Please try again.',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
      }
    );
}

  // ─────────────────────────────────────────
  //  Helpers
  // ─────────────────────────────────────────

  /** Returns the star icon asset path for a given rating code */
  getRatingIcon(rating: string): string {
    const map: Record<string, string> = {
      VVIP: 'assets/images/ratings/VIP.png',
      VIP:  'assets/images/ratings/VIP.png',
      COR:  'assets/images/ratings/COR2.png',
      NOR:  'assets/images/ratings/NOR.png',
      VVP:  'assets/images/ratings/vvp.png',
    };
    return map[rating] ?? '';
  }

  /** Returns the human-readable label for a given rating code */
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

  copyToClipboard(text: string, type: 'phone' | 'email') {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'phone') {
        this.copiedPhone = true;
        setTimeout(() => (this.copiedPhone = false), 2000);
      } else {
        this.copiedEmail = true;
        setTimeout(() => (this.copiedEmail = false), 2000);
      }
    });
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
  rateofCus?: string;   // 'VVIP' | 'VIP' | 'COR' | 'NOR' | 'VVP'
}