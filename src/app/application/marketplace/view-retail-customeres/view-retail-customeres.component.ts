import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-view-retail-customeres',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, LoadingSpinnerComponent],
  templateUrl: './view-retail-customeres.component.html',
  styleUrls: ['./view-retail-customeres.component.css'],
})
export class ViewRetailCustomeresComponent implements OnInit {
  customerObj: Customers[] = [];
  searchText: string = '';
  isPopupOpen: boolean = false;
  cusObjDetails: Customers = new Customers();
  hasData: boolean = true;
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  isLoading: boolean = true;
  copiedEmail: string = '';
  copiedPhone: string = '';
  showToast: boolean = false; // New property for toast visibility

  constructor(private marketSrv: MarketPlaceService, private router: Router) {}

  ngOnInit(): void {
    this.fetchRetailCustomers();
  }

  goBack(): void {
    this.router.navigate(['/market/action']);
  }

  fetchRetailCustomers(
    page: number = this.page,
    limit: number = this.itemsPerPage,
    searchText: string = this.searchText
  ) {
    this.isLoading = true;

    this.marketSrv
      .fetchAllRetailCustomers(page, limit, searchText)
      .subscribe(
        (res) => {
          console.log(res);
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

  onPageChange(event: number) {
    this.page = event;
    this.fetchRetailCustomers();
  }

  onSearch() {
    this.page = 1; // Reset to first page on search
    this.fetchRetailCustomers();
  }

  offSearch() {
    this.searchText = '';
    this.page = 1; // Reset to first page on clear search
    this.fetchRetailCustomers();
  }

  detailsPop(Obj: Customers) {
    console.log('customer popup');
    this.isPopupOpen = true;
    this.cusObjDetails = Obj;
  }

  copyToClipboard(text: string, type: 'email' | 'phone') {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        if (type === 'email') {
          this.copiedEmail = text;
        } else {
          this.copiedPhone = text;
        }
        // Show toast
        this.showToast = true;
        // Hide toast after 2 seconds
        setTimeout(() => {
          this.showToast = false;
          if (type === 'email') {
            this.copiedEmail = '';
          } else {
            this.copiedPhone = '';
          }
        }, 2000);
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
      });
  }

  viewOrderDetails(id: string) {
    this.router.navigate(['/market/action/view-order-details', id]);
  }
}

class Customers {
  id!: string;
  firstName!: string;
  lastName!: string;
  phoneCode!: string;
  phoneNumber!: string;
  totalOrders!: string;
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
}