import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-market-price-bulk-upload',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule
  ],
  templateUrl: './market-price-bulk-upload.component.html',
  styleUrl: './market-price-bulk-upload.component.css'
})
export class MarketPriceBulkUploadComponent {
  isLoading = false;

}
