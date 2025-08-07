import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environment/environment';
import Swal from 'sweetalert2';
import { CropCalendarService } from '../../../services/plant-care/crop-calendar.service';
import { MarketPriceService } from '../../../services/market-price/market-price.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-market-price-bulk-upload',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
    FormsModule,
  ],
  templateUrl: './market-price-bulk-upload.component.html',
  styleUrls: ['./market-price-bulk-upload.component.css'],
})
export class MarketPriceBulkUploadComponent {
  isLoading = false;
  selectedFile: File | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  xlName: string = '';
  date: string = '';
  startTime: string = '';
  endTime: string = '';
  createdBy: any = localStorage.getItem('userId:');

  constructor(
    private http: HttpClient,
    private marketPriceService: MarketPriceService,
    private router: Router
  ) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.validateFile(file);
  }

  onDragOver(event: any): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: any): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: any): void {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files[0];
    this.validateFile(file);
  }

  validateFile(file: File): void {
    const allowedExtensions = ['.csv', '.xlsx'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension && allowedExtensions.includes(`.${fileExtension}`)) {
      this.selectedFile = file;
      this.errorMessage = '';
    } else {
      this.errorMessage =
        'Invalid file type. Please upload a CSV or XLSX file.';
      this.selectedFile = null;
    }
  }

  onUpload(): void {
    if (this.selectedFile) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = new FormData();
      formData.append('xlName', this.selectedFile.name);
      formData.append('createdBy', this.createdBy);
      formData.append('file', this.selectedFile);

      this.marketPriceService.bulkUploadingMarketPrice(formData).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'File uploaded successfully!';
          this.selectedFile = null;
          this.date = '';
          this.startTime = '';
          this.endTime = '';
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'File uploaded successfully!',
            confirmButtonText: 'OK',
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/market-place/view-current-price']);
            }
          });
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error.error;
          this.selectedFile = null;
          this.date = '';
          this.startTime = '';
          this.endTime = '';
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: this.errorMessage,
            confirmButtonText: 'OK',
          });
        },
      });
    } else {
      this.errorMessage = 'No file selected. Please select a file to upload.';
      this.selectedFile = null;
      this.date = '';
      this.startTime = '';
      this.endTime = '';
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: this.errorMessage,
        confirmButtonText: 'OK',
      });
    }
  }



  onCancel() {
  Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: 'All entered data will be lost!',
    showCancelButton: true,
    confirmButtonText: 'Yes, Reset',
    cancelButtonText: 'No, Keep Editing',
  }).then((result) => {
    if (result.isConfirmed) {
     this.router.navigate(['/collection-hub']);

    }
  });
}


  back(): void {
  Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: 'You may lose the added data after going back!',
    showCancelButton: true,
    confirmButtonText: 'Yes, Go Back',
    cancelButtonText: 'No, Stay Here',
  }).then((result) => {
    if (result.isConfirmed) {
    this.router.navigate(['/collection-hub']);
    }
  });
}



}
