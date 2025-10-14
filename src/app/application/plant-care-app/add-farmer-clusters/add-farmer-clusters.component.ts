import { Component, ViewChild, ElementRef } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import {
  CertificateCompanyService,
  CreateFarmerClusterPayload,
} from '../../../services/plant-care/certificate-company.service';

interface DuplicateEntry {
  NIC: string;
  rowNumber: number;
}

@Component({
  selector: 'app-add-farmer-cluster',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
    FormsModule,
  ],
  templateUrl: './add-farmer-clusters.component.html',
  styleUrl: './add-farmer-clusters.component.css',
})
export class AddFarmerClustersComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;

  selectedFile: File | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading = false;
  duplicateEntries: DuplicateEntry[] = [];
  clusterName: string = '';
  formSubmitted = false;

  constructor(
    private router: Router,
    private location: Location,
    private farmerClusterService: CertificateCompanyService
  ) {}

  onBack(): void {
    this.location.back();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.validateFile(file);
  }

  onDragOver(event: any): void {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
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
      this.checkDuplicatesImmediately(file);
    } else {
      this.errorMessage =
        'Invalid file type. Please upload a CSV or XLSX file.';
      this.selectedFile = null;
      this.showErrorPopup(
        'Invalid File Type',
        'Please upload a CSV or XLSX file.'
      );
    }
  }

  private checkDuplicatesImmediately(file: File): void {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const nicMap = new Map();
        const duplicates: DuplicateEntry[] = [];

        jsonData.forEach((row: any, index: number) => {
          const nic = this.extractNIC(row);
          if (nic) {
            if (nicMap.has(nic)) {
              duplicates.push({
                NIC: nic,
                rowNumber: index + 2,
              });
            } else {
              nicMap.set(nic, index);
            }
          }
        });

        if (duplicates.length > 0) {
          this.duplicateEntries = duplicates;
          this.showDuplicateErrorPopup(duplicates);
        }
      } catch (error) {
        console.error('Error processing file:', error);
        this.showErrorPopup(
          'File Error',
          'Failed to process the file. Please check the file format.'
        );
      }
    };

    reader.onerror = () => {
      this.showErrorPopup(
        'File Error',
        'Error reading the file. Please try again.'
      );
    };

    reader.readAsArrayBuffer(file);
  }

  onUpload(): void {
    this.formSubmitted = true;

    if (!this.selectedFile || !this.clusterName.trim()) {
      if (!this.clusterName.trim()) {
        this.showErrorPopup(
          'Cluster Name Required',
          'Please enter a cluster name.'
        );
      }
      if (!this.selectedFile) {
        this.showErrorPopup('File Required', 'Please select a file to upload.');
      }
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Extract NICs from the file and check for duplicates
        const nicMap = new Map();
        const duplicates: DuplicateEntry[] = [];
        const uniqueNICs: string[] = [];

        jsonData.forEach((row: any, index: number) => {
          const nic = this.extractNIC(row);

          if (nic) {
            if (nicMap.has(nic)) {
              // This is a duplicate
              duplicates.push({
                NIC: nic,
                rowNumber: index + 2,
              });
            } else {
              // First time seeing this NIC
              nicMap.set(nic, index);
              uniqueNICs.push(nic);
            }
          }
        });

        if (duplicates.length > 0) {
          this.isLoading = false;
          this.duplicateEntries = duplicates;
          this.downloadDuplicateCSV(duplicates);
          this.showDuplicateErrorPopup(duplicates);
          return;
        }

        if (uniqueNICs.length === 0) {
          this.isLoading = false;
          this.showErrorPopup(
            'No NICs Found',
            'The uploaded file does not contain any valid NIC numbers.'
          );
          return;
        }

        // If no duplicates, proceed with API call
        const payload: CreateFarmerClusterPayload = {
          clusterName: this.clusterName.trim(),
          farmerNICs: uniqueNICs,
        };

        this.farmerClusterService.createFarmerCluster(payload).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.showSuccessPopup(response);
            this.selectedFile = null;
            this.clusterName = '';
            this.formSubmitted = false;
            this.fileInput.nativeElement.value = '';
          },
          error: (error) => {
            this.isLoading = false;
            this.handleError(error);
          },
        });
      } catch (error) {
        this.isLoading = false;
        console.error('Error processing file:', error);
        this.handleError(
          new Error('Failed to process the file. Please check the file format.')
        );
      }
    };

    reader.onerror = () => {
      this.isLoading = false;
      this.handleError(new Error('Error reading the file. Please try again.'));
    };

    reader.readAsArrayBuffer(this.selectedFile);
  }

  private extractNIC(row: any): string | null {
    // Try different possible column names for NIC
    const nic = row['NIC'] || row['nic'];
    if (!nic) {
      console.log('No NIC found in row:', row);
      return null;
    }

    // Convert to string and trim
    const nicString = String(nic).trim();

    // Basic validation - NIC should not be empty
    if (!nicString) {
      return null;
    }

    return nicString;
  }

  private downloadDuplicateCSV(duplicates: DuplicateEntry[]): void {
    try {
      const headers = ['NIC'];
      const csvContent = [
        headers.join(','),
        ...duplicates.map((entry, index) => `"${entry.NIC}"`),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `duplicate_entries_${
          this.selectedFile?.name.replace(/\.[^/.]+$/, '') || 'file'
        }.csv`
      );
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate CSV file:', error);
    }
  }

  private downloadMissingNicsCSV(missingNICs: string[]): void {
    try {
      const headers = ['No', 'NIC'];
      const csvContent = [
        headers.join(','),
        ...missingNICs.map((nic, index) => `${index + 1},"${nic}"`),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `unregistered_users_${
          this.selectedFile?.name.replace(/\.[^/.]+$/, '') || 'file'
        }.csv`
      );
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate CSV file:', error);
    }
  }

  private showDuplicateErrorPopup(duplicates: DuplicateEntry[]): void {
    Swal.fire({
      html: this.generateDuplicatePopupHTML(duplicates),
      showConfirmButton: false,
      width: '900px',
      customClass: {
        popup: '!bg-white dark:!bg-gray-800 !text-gray-800 dark:!text-white',
        container: '!flex !items-center !justify-center',
      },
      didOpen: () => {
        // Add event listener for the close button
        const closeButton = document.getElementById('closeDuplicatePopup');
        if (closeButton) {
          closeButton.addEventListener('click', () => {
            this.selectedFile = null;
            this.fileInput.nativeElement.value = '';
            Swal.close();
          });
        }

        // Add event listener for the download button
        const downloadButton = document.getElementById(
          'downloadDuplicateCSVBtn'
        );
        if (downloadButton) {
          downloadButton.addEventListener('click', () => {
            this.downloadDuplicateCSV(duplicates);
          });
        }
      },
    });
  }

  private generateDuplicatePopupHTML(duplicates: DuplicateEntry[]): string {
    return `
      <div class="p-6 bg-white dark:bg-gray-800 rounded-lg max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-6">
          <div class="flex items-center justify-center mb-4">
            <h2 class="text-2xl">
              Error : Duplication Entries found in the CSV file!
            </h2>
          </div>
          <p class="text-gray-700 dark:text-gray-300 text-lg font-semibold mb-2">
            Please note: Cluster creation cannot proceed while redundant data exists.
          </p>
        </div>

        <p class="text-gray-800 dark:text-gray-200 text-left mb-4">
          Add Farmer Clusters - ${this.selectedFile?.name || 'Unknown File'}
        </p>
        <hr class="border-gray-300 dark:border-gray-600"/>
        <div class="flex justify-end my-4">
          <p class="text-gray-600 dark:text-gray-400 text-center mt-1">
            <button
              id="downloadDuplicateCSVBtn"
              class="text-blue-500 hover:text-blue-700 hover:underline cursor-pointer font-semibold flex items-center gap-2 bg-transparent border-0">
              <i class="fa-solid fa-download mr-1"></i>
              File with duplicated users downloaded
            </button>
          </p>
        </div>
        <!-- Duplicates Table -->
        <div class="mb-6">
          <table class="w-full border-collapse border border-gray-300 dark:border-gray-600">
            <thead>
              <tr class="bg-gray-100 dark:bg-gray-700">
                <th></th>
                <th class=" px-4 py-3 text-center text-gray-800 dark:text-gray-200">No</th>
                <th class=" px-4 py-3 text-center text-gray-800 dark:text-gray-200">NIC</th>
              </tr>
            </thead>
            <tbody>
              ${duplicates
                .map(
                  (entry, index) => `
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-600">
                <td class="border-b border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">
                   <i class="fa-solid fa-triangle-exclamation text-red-800"></i>
                  </td>
                  <td class="border-b border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">${
                    index + 1
                  }</td>
                  <td class="border-b border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 font-mono">${
                    entry.NIC
                  }</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <!-- Summary -->
        <p class="text-left font-semibold">
          ${duplicates.length} item${duplicates.length > 1 ? 's' : ''}
        </p>

        <!-- Action Button -->
        <div class="text-center">
          <button
            id="closeDuplicatePopup"
            class="bg-gray-500 hover:bg-gary-600 text-white py-3 px-8 rounded-xl mt-10">
            Close & Go Back
          </button>
        </div>
      </div>
    `;
  }

  private showMissingNicsErrorPopup(missingNICs: string[]): void {
    Swal.fire({
      html: this.generateMissingNicsPopupHTML(missingNICs),
      showConfirmButton: false,
      width: '800px',
      customClass: {
        popup: '!bg-white dark:!bg-gray-800 !text-gray-800 dark:!text-white',
        container: '!flex !items-center !justify-center',
      },
      didOpen: () => {
        // Close button event listener
        const closeButton = document.getElementById('closeMissingNicsPopup');
        if (closeButton) {
          closeButton.addEventListener('click', () => {
            this.selectedFile = null;
            this.fileInput.nativeElement.value = '';
            Swal.close();
          });
        }

        // Download button event listener
        const downloadButton = document.getElementById(
          'downloadMissingNicsCSVBtn'
        );
        if (downloadButton) {
          downloadButton.addEventListener('click', () => {
            this.downloadMissingNicsCSV(missingNICs);
          });
        }
      },
    });
  }

  private generateMissingNicsPopupHTML(missingNICs: string[]): string {
    return `
    <div class="p-6 bg-white dark:bg-gray-800 rounded-lg max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="flex items-center justify-center mb-4">
          <h2 class="text-2xl">
            Error : Unregistered Users Found!
          </h2>
        </div>
        <p class="text-gray-700 dark:text-gray-300 text-lg font-semibold mb-2">
          Please note: Cluster creation cannot proceed with unregistered users.
        </p>
      </div>

      <p class="text-gray-800 dark:text-gray-200 text-left mb-4">
        Add Farmer Clusters - ${this.selectedFile?.name || 'Unknown File'}
      </p>
      <hr class="border-gray-300 dark:border-gray-600"/>
      <div class="flex justify-end my-4">
        <button
          id="downloadMissingNicsCSVBtn"
          class="text-blue-500 hover:text-blue-700 hover:underline cursor-pointer font-semibold flex items-center gap-2 bg-transparent border-0">
          <i class="fa-solid fa-download"></i>
          Download Unregistered Users CSV
        </button>
      </div>

      <!-- Missing NICs Table -->
      <div class="mb-6">
        <table class="w-full border-collapse border border-gray-300 dark:border-gray-600">
          <thead>
            <tr class="bg-gray-100 dark:bg-gray-700">
              <th></th>
              <th class="px-4 py-3 text-center text-gray-800 dark:text-gray-200">No</th>
              <th class="px-4 py-3 text-center text-gray-800 dark:text-gray-200">NIC</th>
            </tr>
          </thead>
          <tbody>
            ${missingNICs
              .map(
                (nic, index) => `
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-600">
                <td class="border-b border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">
                  <i class="fa-solid fa-user-xmark text-red-800"></i>
                </td>
                <td class="border-b border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">${
                  index + 1
                }</td>
                <td class="border-b border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 font-mono">${nic}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <!-- Summary -->
      <p class="text-left font-semibold">
        ${missingNICs.length} unregistered user${
      missingNICs.length > 1 ? 's' : ''
    }
      </p>

      <!-- Action Button -->
      <div class="text-center">
        <button
          id="closeMissingNicsPopup"
          class="bg-gray-500 hover:bg-gray-600 text-white py-3 px-8 rounded-xl mt-10">
          Close & Go Back
        </button>
      </div>
    </div>
  `;
  }

  private showErrorPopup(title: string, text: string): void {
    Swal.fire({
      icon: 'warning',
      title: title,
      text: text,
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    });
  }

  private showSuccessPopup(response: any): void {
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: response.message || 'Farmer cluster created successfully.',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    }).then(() => {
      this.router.navigate(['/plant-care/action/manage-farmer-clusters']);
    });
  }

  private handleError(error: any): void {
    this.isLoading = false;
    this.selectedFile = null;

    let errorMessage = 'Failed to upload file. Please try again.';

    if (error.error?.missingNICs) {
      const missingNICs = error.error.missingNICs;
      this.showMissingNicsErrorPopup(missingNICs);
      return;
    }

    if (error.status === 400) {
      errorMessage = error.error?.message || 'Invalid file or data format.';
    } else if (error.status === 413) {
      errorMessage = 'File size too large. Please upload a smaller file.';
    }

    Swal.fire({
      icon: 'error',
      title: 'Upload Failed',
      text: errorMessage,
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    });
  }

  onCancel(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after canceling!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'No, Keep Editing',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
      buttonsStyling: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.location.back();
      }
    });
  }
}
