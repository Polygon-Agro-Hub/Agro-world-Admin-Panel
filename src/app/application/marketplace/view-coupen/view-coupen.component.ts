import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';

@Component({
  selector: 'app-view-coupen',
  standalone: true,
  imports: [
    CommonModule,
    NgxPaginationModule,
    DropdownModule,
    FormsModule,
    CalendarModule,
    LoadingSpinnerComponent
  ],
  providers: [DatePipe],
  templateUrl: './view-coupen.component.html',
  styleUrl: './view-coupen.component.css'
})
export class ViewCoupenComponent implements OnInit {
  isLoading = true;
  coupenObj!: Coupen[];
  hasData: boolean = true;
  checkDelete: boolean = false;

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;


  constructor(private marketSrv: MarketPlaceService) {

  }

  ngOnInit(): void {
    this.fetchAllCoupon()
  }

  fetchAllCoupon(page: number = 1, limit: number = this.itemsPerPage) {
    this.marketSrv.getAllCoupen(page, limit).subscribe(
      (res) => {
        if (res.items.length > 0) {
          this.hasData = false
        }
        this.coupenObj = res.items;
        this.totalItems = res.total;
        this.isLoading = false;

      }
    )


  }

  searchPlantCareUsers() {

  }

  clearSearch() {

  }


  onPageChange(event: number) {
    this.page = event;
    this.fetchAllCoupon(this.page, this.itemsPerPage);
  }

}

class Coupen {
  id!: number
  code!: string
  type!: string
  percentage!: number
  status!: string
  checkLimit!: string
  startDate!: string
  endDate!: string
  createdAt!: string
}
