import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { MarketPriceService } from '../../../services/plant-care/market-price.service';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";

interface MarketPriceItem {
  id: number;
  titleEnglish: string;
  titleSinhala: string;
  titleTamil: string;
  descriptionEnglish: string;
  descriptionSinhala: string;
  descriptionTamil: string;
  image: string;
  status: string;
  price: string;
  createdAt: string;
}

interface Status {
  name: string;
  code: string;
}

@Component({
  selector: 'app-manage-market-price',
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
  templateUrl: './manage-market-price.component.html',
  styleUrl: './manage-market-price.component.css',
  template: `
    <!-- Your existing table markup -->
    <pagination-controls
      (pageChange)="onPageChange($event)"
      [totalItems]="totalItems"
      [itemsPerPage]="itemsPerPage"
    >
    </pagination-controls>
  `,
})
export class ManageMarketPriceComponent implements OnInit {
  marketPriceItems: MarketPriceItem[] = [];
  isPopupVisible = false;
  isLoading = true;
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  status: Status[] | undefined;
  selectedStatus: Status | undefined;
  date: Date | undefined;
  statusFilter: any = '';
  createdDateFilter: string = '';
  hasData: boolean = true;  

  constructor(private marketPriceService: MarketPriceService, private router: Router) {}

  ngOnInit() {
    this.fetchAllMarketPrice(this.page, this.itemsPerPage);
    this.status = [
      { name: 'Published', code: 'Published' },
      { name: 'Draft', code: 'Draft' }
    ];
  }

  fetchAllMarketPrice(page: number = 1, limit: number = this.itemsPerPage) {
    this.isLoading = true;

    this.marketPriceService.getAllMarketPrices(page, limit, this.statusFilter?.code, this.createdDateFilter)
      .subscribe(
        (response) => {
          this.marketPriceItems = response.items;
          this.hasData = this.marketPriceItems.length > 0;
          this.totalItems = response.total;
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching market prices:', error);
          this.isLoading = false;
        }
      );
  }

  deleteMarketPrice(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this market price item? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.marketPriceService.deleteMarketPrice(id).subscribe(
          () => {
            Swal.fire('Deleted!', 'The market price item has been deleted.', 'success');
            this.fetchAllMarketPrice();
          },
          (error) => {
            console.error('Error deleting market price:', error);
            Swal.fire('Error!', 'There was an error deleting the market price item.', 'error');
          }
        );
      }
    });
  }

  editNews(id: number) {
    this.router.navigate(['/plant-care/create-market-price'], { queryParams: { id } });
  }

  openPopup(id: number) {
    this.isPopupVisible = true;
    this.marketPriceService.getMarketPriceById(id).subscribe(
      (data) => {
        if (Array.isArray(data) && data.length > 0) {
          this.marketPriceItems = data; // Directly assign the array
        } 
        console.log(this.marketPriceItems);
      },
      (error) => {
        console.error('Error fetching market price:', error);
        if (error.status === 401) {
          // Handle unauthorized access (e.g., redirect to login)
        }
      }
    );
  }

  closePopup() {
    this.isPopupVisible = false;
    this.fetchAllMarketPrice();
  }

  updateStatus(id: number) {
    this.marketPriceService.updateMarketPriceStatus(id).subscribe(
      () => {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Status updated successfully!',
        });
        this.fetchAllMarketPrice();
      },
      (error) => {
        console.error('Error updating status', error);
        Swal.fire({
          icon: 'error',
          title: 'Unsuccess',
          text: 'Error updating status',
        });
      }
    );
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllMarketPrice(this.page, this.itemsPerPage); // Include itemsPerPage
  }

  applyFilters() {
    this.fetchAllMarketPrice(1, this.itemsPerPage);
  }
}
