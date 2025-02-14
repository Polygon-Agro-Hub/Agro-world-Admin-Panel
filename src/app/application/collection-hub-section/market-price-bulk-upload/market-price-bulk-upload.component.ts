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
    FormsModule  
  ],
  templateUrl: './market-price-bulk-upload.component.html',
  styleUrls: ['./market-price-bulk-upload.component.css']
})
export class MarketPriceBulkUploadComponent {
  isLoading = false;
  selectedFile: File | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  xlName: string = ''; // to store XLSX name
  // createdBy: string = ''; // to store creator's name
  date: string = ''; // to store date
  startTime: string = ''; // to store start time
  endTime: string = ''; // to store end time
  createdBy : any= localStorage.getItem('userId:');
  
  constructor(private http: HttpClient, private marketPriceService: MarketPriceService, private router:Router) {}

 

  // Handle file selection via file input
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.validateFile(file);
  }

  // Handle dragover event
  onDragOver(event: any): void {
    event.preventDefault(); // Prevent the default behavior of opening the file
    event.stopPropagation();
  }

  // Handle dragleave event
  onDragLeave(event: any): void {
    event.preventDefault();
    event.stopPropagation();
  }

  // Handle file drop
  onDrop(event: any): void {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files[0];
    this.validateFile(file);
  }

  // Validate the file type and set it for upload
  validateFile(file: File): void {
    const allowedExtensions = ['.csv', '.xlsx'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension && allowedExtensions.includes(`.${fileExtension}`)) {
      this.selectedFile = file;
      this.errorMessage = '';
    } else {
      this.errorMessage = 'Invalid file type. Please upload a CSV or XLSX file.';
      this.selectedFile = null;
    }
  }

  // Upload the selected file to the backend
  onUpload(): void {
    if (this.selectedFile) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = new FormData();
      formData.append('xlName', this.selectedFile.name);
      formData.append('createdBy', this.createdBy);
      formData.append('file', this.selectedFile);

      // Send the file to the backend
    
      this.marketPriceService.bulkUploadingMarketPrice(formData).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.successMessage = 'File uploaded successfully!';
          console.log('Response:', response);
          this.selectedFile = null; // Clear the selected file after upload
          this.date='';
          this.startTime='';
          this.endTime='';
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'File uploaded successfully!',
            confirmButtonText: 'OK'
          }).then((result)=>{
            if(result.isConfirmed){
              this.router.navigate(['/admin/market-place/view-current-price'])
            }
          });
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error.error;
          console.error('Upload error:', error);
          if (this.selectedFile) {
            this.selectedFile = null;
          }if(this.date){
            this.date='';
          }if(this.startTime){
            this.startTime='';
          }if(this.endTime){
            this.endTime='';
          }
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: this.errorMessage,
            confirmButtonText: 'OK'
          });
        }
      });
    } else {
      this.errorMessage = 'No file selected. Please select a file to upload.';
      if (this.selectedFile) {
        this.selectedFile = null;
      }if(this.date){
        this.date='';
      }if(this.startTime){
        this.startTime='';
      }if(this.endTime){
        this.endTime='';
      }
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: this.errorMessage,
        confirmButtonText: 'OK'
      });
    }
  }

  onCancel(): void {
    if (this.selectedFile) {
      this.selectedFile = null;
    }if(this.date){
      this.date='';
    }if(this.startTime){
      this.startTime='';
    }if(this.endTime){
      this.endTime='';
    }
  }
}
