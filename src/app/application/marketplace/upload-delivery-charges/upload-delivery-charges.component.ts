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
  ) { }

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
    if (file) {
      this.validateFile(file);
    }
    event.target.value = '';
  }

  validateFile(file: File): void {
    const allowedExtensions = ['.csv', '.xlsx'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension && allowedExtensions.includes(`.${fileExtension}`)) {
      this.errorMessage = '';
      this.checkDuplicates(file);
    } else {
      this.errorMessage = 'Invalid file type. Please upload a CSV or XLSX file.';
      this.selectedFile = null;
      Swal.fire({
        icon: 'error',
        title: 'Invalid File Type',
        text: 'Please upload a CSV or XLSX file.',
        confirmButtonText: 'OK',
      });
    }
  }

  private checkDuplicates(file: File): void {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const firstRow = XLSX.utils.decode_range(sheet['!ref'] as string).s.r;
        const rows: any[] = XLSX.utils.sheet_to_json(sheet, { blankrows: true });

        const seen = new Map<string, number>();
        const duplicates: string[] = [];

        rows.forEach((row, index) => {
          const city = row['City']?.toString().trim();
          if (!city) return; 

          const key = city.toLowerCase();
          const rowNumber = firstRow + index + 2;

          if (seen.has(key)) {
            duplicates.push(`${city} - row ${seen.get(key)} & row ${rowNumber}`);
          } else {
            seen.set(key, rowNumber);
          }
        });

        if (duplicates.length > 0) {
          this.selectedFile = null;

          const list = duplicates
            .slice(0, 10)
            .map((d) => `<li>${d}</li>`)
            .join('');
          const more =
            duplicates.length > 10
              ? `<p>...and ${duplicates.length - 10} more</p>`
              : '';

          Swal.fire({
            icon: 'warning',
            title: 'Duplicate Cities Found',
            html: `<p style="padding: 10px;">Please remove the duplicate rows and upload again.</p>
                  <ul style="text-align:left; list-style-type: disc; padding-left: 40px; margin: 0;">${list}</ul>${more}`,
            confirmButtonText: 'OK',
            confirmButtonColor: '#3980C0',
          });
          return;
        }

        this.selectedFile = file;
      } catch (err) {
        this.selectedFile = null;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Could not read the file. Please check the file and try again.',
          confirmButtonText: 'OK',
        });
      }
    };

    reader.readAsArrayBuffer(file);
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

        // Create the success message based on the response
        let successHtml = `<p>${response.message}</p>`;

        if (response.inserted > 0) {
          successHtml += `<p>New records inserted: ${response.inserted}</p>`;
        }

        if (response.updated > 0) {
          successHtml += `<p>Existing records updated: ${response.updated}</p>`;
        }

        if (response.duplicates > 0) {
          successHtml += `<p>Duplicate records skipped: ${response.duplicates}</p>`;
        }

        // If no operations were performed (all duplicates)
        if (response.inserted === 0 && response.updated === 0 && response.duplicates > 0) {
          successHtml = `<p>All cities in the file already exist with the same charges.</p>
                       <p>Duplicate records skipped: ${response.duplicates}</p>`;
        }

        Swal.fire({
          title: 'Success!',
          html: successHtml,
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

        let errorMessage = error.message || 'Failed to upload delivery charges';

        // Handle specific error cases
        if (error.message.includes('Excel file is empty')) {
          errorMessage = 'The uploaded Excel file is empty.';
        } else if (error.message.includes('must contain')) {
          errorMessage = 'The Excel file must contain "City Name" and "Charge (Rs.)" columns.';
        } else if (error.message.includes('No valid data')) {
          errorMessage = 'The Excel file contains no valid data to process.';
        }

        Swal.fire({
          title: 'Error!',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3980C0',
        });
      },
    });
  }
}
