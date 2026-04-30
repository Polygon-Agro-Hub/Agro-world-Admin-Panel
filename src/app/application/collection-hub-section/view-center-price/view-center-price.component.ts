import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import Swal from 'sweetalert2';
import { MarketPriceService } from '../../../services/market-price/market-price.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-view-center-price',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
    DropdownModule,
    FormsModule,
  ],
  templateUrl: './view-center-price.component.html',
  styleUrl: './view-center-price.component.css',
})
export class ViewCenterPriceComponent {
  centerId!: any;
  companyId!: any;
  centerName!: any;
  Cname!: any;
  isLoading = false;
  currentDate: string;
  market: MarketPrice[] = [];
  selectedCrop: Crop | null = null;
  crops!: Crop[];

  selectedGrade: Viraity | null = null;
  grades!: Viraity[];

  page: number = 1;
  totalItems: number = 0;
  searchNIC: string = '';
  search: string = '';

  lastUploadDate: string = '';
  lastUploadTime: string = '';
  lastUploadBy: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private marketSrv: MarketPriceService,
    private location: Location,
  ) {
    this.currentDate = new Date().toLocaleDateString();
  }

  ngOnInit(): void {
    this.centerId = this.route.snapshot.params['centerId'];
    this.companyId = this.route.snapshot.params['companyId'];
    this.centerName = this.route.snapshot.params['centerName'];

    this.Cname = this.route.snapshot.queryParams['Cname'];
    console.log('Cname from query params:', this.Cname);

    this.route.queryParams.subscribe((params) => {
      this.Cname = params['Cname'];
      console.log('Cname updated:', this.Cname);
    });

    this.fetchAllMarketPrices();
    this.getAllCrops();

    this.grades = [
      { id: '1', Vgrade: 'A' },
      { id: '2', Vgrade: 'B' },
      { id: '3', Vgrade: 'C' },
    ];
  }

  fetchAllMarketPrices() {
    this.isLoading = true;

    const cropId = this.selectedCrop?.id || '';
    const grade = this.selectedGrade?.Vgrade || '';

    this.marketSrv
      .getAllMarketPriceAgro(
        cropId,
        grade,
        this.searchNIC,
        this.centerId,
        this.companyId,
      )
      .subscribe(
        (res) => {
          this.isLoading = false;
          this.market = res.results;
          this.totalItems = res.total;

          this.extractLastUploadInfo(res.results);
        },
        (error) => {
          console.error('Error fetching market price:', error);
          this.isLoading = false;
          Swal.fire(
            'Error!',
            'There was an error fetching market prices.',
            'error',
          );
        },
      );
  }

  extractLastUploadInfo(marketData: MarketPrice[]) {
    let latestDate: Date | null = null;
    let latestUserName: string = '';
    marketData.forEach((item) => {
      if (item.updateAt) {
        const itemDate = new Date(item.updateAt);
        if (!latestDate || itemDate > latestDate) {
          latestDate = itemDate;
          latestUserName = item.userName || 'System';
        }
      }
    });
    if (marketData && marketData.length > 0) {
      const validDates = marketData
        .filter((item) => item.updateAt)
        .map((item) => new Date(item.updateAt));

      if (validDates.length > 0) {
        const latestDate = new Date(
          Math.max(...validDates.map((date) => date.getTime())),
        );

        const year = latestDate.getFullYear();
        const month = String(latestDate.getMonth() + 1).padStart(2, '0');
        const day = String(latestDate.getDate()).padStart(2, '0');
        this.lastUploadDate = `${year}/${month}/${day}`;

        let hours = latestDate.getHours();
        const minutes = String(latestDate.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const formattedHours = String(hours).padStart(2, '0');
        this.lastUploadTime = `${formattedHours}.${minutes} ${ampm}`;
      }
    }

    this.lastUploadBy = latestUserName;
  }

  getAllCrops() {
    this.marketSrv.getAllCropName().subscribe(
      (res) => {
        this.crops = res;
      },
      (error) => {
        console.error('Error fetching crops:', error);
        Swal.fire('Error!', 'There was an error fetching crops.', 'error');
      },
    );
  }

  applyFiltersCrop() {
    this.fetchAllMarketPrices();
  }

  applyFiltersGrade() {
    this.fetchAllMarketPrices();
  }

  searchPlantCareUsers() {
    this.page = 1;
    this.fetchAllMarketPrices();
  }

  clearSearch(): void {
    this.searchNIC = '';
    this.fetchAllMarketPrices();
  }

  back(): void {
    this.location.back();
  }

  get hasData(): boolean {
    return this.market && this.market.length > 0;
  }

  preventLeadingSpace(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    if (event.key === ' ' && input.selectionStart === 0) {
      event.preventDefault();
    }
  }
}

class MarketPrice {
  id!: string;
  cropName!: string;
  varietyName!: string;
  grade!: string;
  price!: string;
  updatedPrice!: string;
  date!: string;
  startTime!: Date;
  endTime!: Date;
  updateAt!: string;
  updatedBy?: string;
  userName?: string;
}

class Crop {
  id!: string;
  cropNameEnglish!: string;
}

class Viraity {
  id!: string;
  Vgrade!: string;
}
