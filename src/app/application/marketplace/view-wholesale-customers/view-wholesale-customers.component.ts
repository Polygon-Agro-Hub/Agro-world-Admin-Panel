import { Component, OnInit } from '@angular/core';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-view-wholesale-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, LoadingSpinnerComponent],
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

  constructor(private marketSrv: MarketPlaceService, private router: Router) { }

  ngOnInit(): void {
    this.fetchWholesaleCustomers();
  }

  goBack(): void {
    this.router.navigate(['/market/action']);
  }

  fetchWholesaleCustomers(
    page: number = this.page,
    limit: number = this.itemsPerPage,
    searchText: string = this.searchText
  ) {
    this.isLoading = true;
    this.marketSrv
      .fetchAllWholesaleCustomers(page, limit, searchText)
      .subscribe((res) => {
        console.log(res);
        this.customerObj = res.items;
        this.totalItems = res.total;
        this.isLoading = false;
        this.hasData = res.total > 0 ? true : false;
      });
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchWholesaleCustomers();
  }

  onSearch() {
    this.fetchWholesaleCustomers();
  }

  offSearch() {
    this.searchText = '';
    this.fetchWholesaleCustomers();
  }

  detailsPop(Obj: Customers) {
    console.log('customer popup');

    this.isPopupOpen = true;
    this.cusObjDetails = Obj;
  }

  // In your component class
  copiedEmail: string = '';
  copiedPhone: string = '';
  copiedPhone1: string = '';

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
      .catch((err) => {
        console.error('Failed to copy:', err);
      });
  }
  viewOrderDetails(id: string) {
    this.router.navigate(['/market/action/view-order-details', id]);
  }

  trimLeadingSpaces() {
    if (this.searchText && this.searchText.startsWith(' ')) {
      this.searchText = this.searchText.trimStart();
    }
  }
}

class Customers {
  id!: string;
  title!:string;
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
}
