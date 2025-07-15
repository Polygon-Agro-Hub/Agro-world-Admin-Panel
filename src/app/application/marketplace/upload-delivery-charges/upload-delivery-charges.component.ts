import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { saveAs } from 'file-saver';
import { Location } from '@angular/common';

@Component({
  selector: 'app-upload-delivery-charges',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './upload-delivery-charges.component.html',
  styleUrl: './upload-delivery-charges.component.css',
})
export class UploadDeliveryChargesComponent {
  selectedFile: File | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading = false;

  constructor(
    private router: Router,
    private uploadservice: MarketPlaceService,
    private location: Location
  ) {}

  back(): void {
    this.location.back();
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

  onFileSelected(event: any): void {
    const file = event.target.files[0];
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
      Swal.fire({
        icon: 'error',
        title: 'Invalid File Type',
        text: 'Please upload a CSV or XLSX file.',
        confirmButtonText: 'OK',
      });
    }
  }

  onCancel(): void {
    if (this.selectedFile) {
      this.selectedFile = null;
    }
  }

  onSave(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a file first';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.uploadservice.uploadDeliveryCharges(this.selectedFile).subscribe({
      next: (response) => {
        this.isLoading = false;
        Swal.fire({
          title: 'Success!',
          html: `
            <p>${response.message}</p>
            <p>Inserted: ${response.data.inserted}</p>
            <p>Duplicates skipped: ${response.data.duplicates}</p>
          `,
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3980C0',
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/market/action/view-delivery-charges']);
          }
        });
        this.selectedFile = null;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Upload error:', error);
        Swal.fire({
          title: 'Error!',
          text: error.message || 'Failed to upload delivery charges',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3980C0',
        });
      },
    });
  }
}
