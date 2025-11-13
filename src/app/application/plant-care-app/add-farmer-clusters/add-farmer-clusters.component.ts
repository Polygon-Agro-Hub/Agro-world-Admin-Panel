import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import {
  CertificateCompanyService,
  FarmerCluster,
  FarmerDetail,
  Certificate,
} from '../../../services/plant-care/certificate-company.service';

interface DuplicateEntry {
  NIC: string;
  regCode: string;
  rowNumber: number;
}

interface District {
  name: string;
  value: string;
}

@Component({
  selector: 'app-add-farmer-cluster',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
    FormsModule,
    DropdownModule,
  ],
  templateUrl: './add-farmer-clusters.component.html',
  styleUrl: './add-farmer-clusters.component.css',
})
export class AddFarmerClustersComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  selectedFile: File | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading = false;
  isInitializing = false;
  duplicateEntries: DuplicateEntry[] = [];
  clusterName: string = '';
  selectedDistrict: string = '';
  selectedCertificateId: number | null = null;
  certificates: Certificate[] = [];
  formSubmitted = false;

  districts: District[] = [
    { name: 'Ampara', value: 'Ampara' },
    { name: 'Anuradhapura', value: 'Anuradhapura' },
    { name: 'Badulla', value: 'Badulla' },
    { name: 'Batticaloa', value: 'Batticaloa' },
    { name: 'Colombo', value: 'Colombo' },
    { name: 'Galle', value: 'Galle' },
    { name: 'Gampaha', value: 'Gampaha' },
    { name: 'Hambantota', value: 'Hambantota' },
    { name: 'Jaffna', value: 'Jaffna' },
    { name: 'Kalutara', value: 'Kalutara' },
    { name: 'Kandy', value: 'Kandy' },
    { name: 'Kegalle', value: 'Kegalle' },
    { name: 'Kilinochchi', value: 'Kilinochchi' },
    { name: 'Kurunegala', value: 'Kurunegala' },
    { name: 'Mannar', value: 'Mannar' },
    { name: 'Matale', value: 'Matale' },
    { name: 'Matara', value: 'Matara' },
    { name: 'Monaragala', value: 'Monaragala' },
    { name: 'Mullaitivu', value: 'Mullaitivu' },
    { name: 'Nuwara Eliya', value: 'Nuwara Eliya' },
    { name: 'Polonnaruwa', value: 'Polonnaruwa' },
    { name: 'Puttalam', value: 'Puttalam' },
    { name: 'Rathnapura', value: 'Rathnapura' },
    { name: 'Trincomalee', value: 'Trincomalee' },
    { name: 'Vavuniya', value: 'Vavuniya' },
  ];

  constructor(
    private router: Router,
    private location: Location,
    private farmerClusterService: CertificateCompanyService
  ) {}

  ngOnInit(): void {
    this.loadCertificates();
  }

  private loadCertificates(): void {
    this.isInitializing = true;
    this.farmerClusterService.getFarmerClusterCertificates().subscribe({
      next: (response) => {
        this.isInitializing = false;
        if (response.status && response.data) {
          this.certificates = response.data;
        } else {
          this.showErrorPopup(
            'Certificate Load Error',
            'Failed to load certificates. Please try again.'
          );
        }
      },
      error: (error) => {
        this.isInitializing = false;
        console.error('Error loading certificates:', error);
        this.showErrorPopup(
          'Certificate Load Error',
          'Failed to load certificates. Please try again.'
        );
      },
    });
  }

  getSelectedCertificateName(): string {
    const selectedCert = this.certificates.find(
      (cert) => cert.id === this.selectedCertificateId
    );
    return selectedCert
      ? `${selectedCert.srtName} (${selectedCert.srtNumber})`
      : '';
  }

  private resetFileState(): void {
    this.selectedFile = null;
    this.duplicateEntries = [];
    this.errorMessage = '';
    this.successMessage = '';
    this.fileInput.nativeElement.value = '';
  }

  onBack(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after going back!',
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
      // this.checkDuplicatesImmediately(file);
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

        const farmerMap = new Map();
        const duplicates: DuplicateEntry[] = [];

        jsonData.forEach((row: any, index: number) => {
          const nic = this.extractNIC(row);
          const regCode = this.extractRegCode(row);

          if (nic && regCode) {
            const key = `${nic}-${regCode}`;
            if (farmerMap.has(key)) {
              duplicates.push({
                NIC: nic,
                regCode: regCode,
                rowNumber: index + 2,
              });
            } else {
              farmerMap.set(key, index);
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

    // Validate all required fields
    if (
      !this.selectedFile ||
      !this.clusterName.trim() ||
      !this.selectedDistrict ||
      !this.selectedCertificateId
    ) {
      if (!this.clusterName.trim()) {
        this.showErrorPopup(
          'Cluster Name Required',
          'Please enter a cluster name.'
        );
      }
      if (!this.selectedDistrict) {
        this.showErrorPopup('District Required', 'Please select a district.');
      }
      if (!this.selectedCertificateId) {
        this.showErrorPopup(
          'Certificate Required',
          'Please select a certificate.'
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

        // Extract farmers from the file and check for duplicates
        const farmerMap = new Map();
        const duplicates: DuplicateEntry[] = [];
        const farmers: FarmerDetail[] = [];

        jsonData.forEach((row: any, index: number) => {
          const nic = this.extractNIC(row);
          const regCode = this.extractRegCode(row);

          if (nic && regCode) {
            const key = `${nic}-${regCode}`;
            if (farmerMap.has(key)) {
              // This is a duplicate
              duplicates.push({
                NIC: nic,
                regCode: regCode,
                rowNumber: index + 2,
              });
            } else {
              // First time seeing this combination
              farmerMap.set(key, index);
              farmers.push({
                farmerNIC: nic,
                regCode: regCode,
              });
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

        if (farmers.length === 0) {
          this.isLoading = false;
          this.showErrorPopup(
            'No Valid Data Found',
            'The uploaded file does not contain any valid NIC and Registration code combinations.'
          );
          return;
        }

        // If no duplicates, proceed with API call
        const payload: FarmerCluster = {
          clusterName: this.clusterName.trim(),
          district: this.selectedDistrict,
          certificateId: this.selectedCertificateId!,
          farmers: farmers,
        };

        Swal.fire({
          icon: 'info',
          title: 'Are you sure?',
          text: 'Do you really want to create this cluster?',
          showCancelButton: true,
          confirmButtonText: 'Yes, Create',
          cancelButtonText: 'No, Cancel',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
          buttonsStyling: true,
        }).then((result) => {
          if (result.isConfirmed) {
            this.farmerClusterService.createFarmerCluster(payload).subscribe({
              next: (response) => {
                this.isLoading = false;
                this.showSuccessPopup(response);
                this.resetForm();
              },
              error: (error) => {
                this.isLoading = false;
                this.handleError(error);
              },
            });
          }
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
    const nic =
      row['NIC'] || row['nic'] || row['NIC Number'] || row['NICNumber'];
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

  private extractRegCode(row: any): string | null {
    // Try different possible column names for Registration Code
    const regCode =
      row['RegCode'] ||
      row['regcode'] ||
      row['Registration Code'] ||
      row['RegistrationCode'] ||
      row['Reg Code'];
    if (!regCode) {
      console.log('No Registration Code found in row:', row);
      return null;
    }

    // Convert to string and trim
    const regCodeString = String(regCode).trim();

    // Basic validation - Registration Code should not be empty
    if (!regCodeString) {
      return null;
    }

    return regCodeString;
  }

  private resetForm(): void {
    this.selectedFile = null;
    this.clusterName = '';
    this.selectedDistrict = '';
    this.selectedCertificateId = null;
    this.formSubmitted = false;
    this.fileInput.nativeElement.value = '';
  }

  private downloadDuplicateCSV(duplicates: DuplicateEntry[]): void {
    try {
      const headers = ['NIC', 'Farm ID'];

      // Force Excel to treat as text by prefixing each value with ="value"
      const csvContent = [
        headers.join(','), // header row
        ...duplicates.map(
          (entry) => `="` + entry.NIC + `",="` + entry.regCode + `"`
        ),
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

      // Force Excel to treat NIC column as text using ="value"
      const csvContent = [
        headers.join(','), // header row
        ...missingNICs.map((nic, index) => `${index + 1},="${nic}"`),
      ].join('\n');

      // Add BOM for better Excel compatibility (especially with Unicode)
      const bom = '\uFEFF';
      const blob = new Blob([bom + csvContent], {
        type: 'text/csv;charset=utf-8;',
      });

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

  private downloadMismatchedFarmersCSV(mismatchedFarmers: any[]): void {
    try {
      const headers = ['NIC', 'Registration Code'];

      // Force both columns to be text using ="value"
      const csvContent = [
        headers.join(','), // header row
        ...mismatchedFarmers.map(
          (farmer) => `="${farmer.farmerNIC}",="${farmer.regCode}"`
        ),
      ].join('\n');

      // Add BOM for better Excel compatibility
      const bom = '\uFEFF';
      const blob = new Blob([bom + csvContent], {
        type: 'text/csv;charset=utf-8;',
      });

      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `mismatched_farmers_${
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
        const closeButton = document.getElementById('closeDuplicatePopup');
        if (closeButton) {
          closeButton.addEventListener('click', () => {
            this.resetFileState();
            Swal.close();
          });
        }

        const downloadButton = document.getElementById(
          'downloadDuplicateCSVBtn'
        );
        if (downloadButton) {
          downloadButton.addEventListener('click', () => {
            this.downloadDuplicateCSV(this.duplicateEntries);
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
              Error : Duplicate Entries found in the CSV file!
            </h2>
          </div>
          <p class="text-gray-700 dark:text-gray-300 text-lg font-semibold mb-2">
            Please note: Cluster creation cannot proceed while duplicate data exists.
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
              class="text-[#3980C0] hover:text-blue-700 hover:underline cursor-pointer flex items-center gap-2 bg-transparent border-0">
              <i class="fa-regular fa-circle-check"></i>
              File with duplicated Farm IDs downloaded
            </button>
          </p>
        </div>
        <!-- Duplicates Table -->
        <div class="mb-6">
          <table class="w-full">
            <thead>
              <tr>
                <th></th>
                <th class="px-4 py-3 text-center text-gray-800 dark:text-gray-200">No</th>
                <th class="px-4 py-3 text-center text-gray-800 dark:text-gray-200">NIC</th>
                <th class="px-4 py-3 text-center text-gray-800 dark:text-gray-200">Farm ID</th>
              </tr>
            </thead>
            <tbody class="w-full border-collapse border border-gray-300 dark:border-gray-600">
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
                  <td class="border-b border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 font-mono">${
                    entry.regCode
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
          ${duplicates.length} items
        </p>

        <!-- Action Button -->
        <div class="text-center">
          <button
            id="closeDuplicatePopup"
            class="bg-[#74788D] hover:bg-gray-600 text-white py-3 px-8 rounded-full mt-10">
            Close & Go Back
          </button>
        </div>
      </div>
    `;
  }

  private showMismatchedFarmersErrorPopup(mismatchedFarmers: any[]): void {
    Swal.fire({
      html: this.generateMismatchedFarmersPopupHTML(mismatchedFarmers),
      showConfirmButton: false,
      width: '1000px',
      customClass: {
        popup: '!bg-white dark:!bg-gray-800 !text-gray-800 dark:!text-white',
        container: '!flex !items-center !justify-center',
      },
      didOpen: () => {
        const closeButton = document.getElementById('closeMismatchedPopup');
        if (closeButton) {
          closeButton.addEventListener('click', () => {
            this.resetFileState();
            Swal.close();
          });
        }

        const downloadButton = document.getElementById(
          'downloadMismatchedCSVBtn'
        );
        if (downloadButton) {
          downloadButton.addEventListener('click', () => {
            this.downloadMismatchedFarmersCSV(mismatchedFarmers);
          });
        }
      },
    });
  }

  private generateMismatchedFarmersPopupHTML(mismatchedFarmers: any[]): string {
    return `
    <div class="p-6 bg-white dark:bg-gray-800 rounded-lg max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="flex items-center justify-center mb-4">
          <h2 class="text-2xl">
            Error : Mis-matching Farm IDs found in the CSV file!
          </h2>
        </div>
        <p class="text-gray-700 dark:text-gray-300 text-lg font-semibold mb-2">
          Please Note: Cluster creation cannot proceed because the uploaded CSV file contains Farm IDs that do not belong to the mentioned farmers.
        </p>
      </div>

      <p class="text-gray-800 dark:text-gray-200 text-left mb-4">
        Add Farmer Clusters - ${this.selectedFile?.name || 'Unknown File'}
      </p>
      <hr class="border-gray-300 dark:border-gray-600"/>
      <div class="flex justify-end my-4">
        <button
          id="downloadMismatchedCSVBtn"
          class="text-[#3980C0] hover:text-blue-700 hover:underline cursor-pointer flex items-center gap-2 bg-transparent border-0">
              <i class="fa-regular fa-circle-check"></i>
          File with mis-matching Farm IDs downloaded
        </button>
      </div>

      <!-- Mismatched Farmers Table -->
      <div class="mb-6">
        <table class="w-full">
          <thead>
            <tr>
              <th></th>
              <th class="px-4 py-3 text-center text-gray-800 dark:text-gray-200">No</th>
              <th class="px-4 py-3 text-center text-gray-800 dark:text-gray-200">NIC</th>
              <th class="px-4 py-3 text-center text-gray-800 dark:text-gray-200">Registration Code</th>
            </tr>
          </thead>
          <tbody class="w-full border-collapse border border-gray-300 dark:border-gray-600">
            ${mismatchedFarmers
              .map(
                (farmer, index) => `
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-600">
                <td class="border-b border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">
                  <i class="fa-solid fa-triangle-exclamation text-red-800"></i>
                </td>
                <td class="border-b border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">${
                  index + 1
                }</td>
                <td class="border-b border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 font-mono">${
                  farmer.farmerNIC
                }</td>
                <td class="border-b border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 font-mono">${
                  farmer.regCode
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
        ${mismatchedFarmers.length} items
      </p>

      <!-- Action Button -->
      <div class="text-center">
        <button
          id="closeMismatchedPopup"
          class="bg-gray-500 hover:bg-gray-600 text-white py-3 px-8 rounded-full mt-10">
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
    }).then(() => {
      this.resetFileState();
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
      this.router.navigate(['/plant-care/action/view-farmer-clusters']);
    });
  }

  private handleError(error: any): void {
    this.isLoading = false;

    let errorMessage = 'Failed to upload file. Please try again.';

    if (error.error?.missingNICs) {
      const missingNICs = error.error.missingNICs;
      this.showMissingNicsErrorPopup(missingNICs);
      return;
    }

    if (error.error?.missingRegCodes) {
      // Handle the new response structure with missingRegCodeDetails
      const missingRegCodeDetails = error.error.missingRegCodeDetails || [];
      this.showMissingRegCodesErrorPopup(missingRegCodeDetails);
      return;
    }

    if (error.error?.mismatchedFarmers) {
      const mismatchedFarmers = error.error.mismatchedFarmers;
      this.showMismatchedFarmersErrorPopup(mismatchedFarmers);
      return;
    }

    // Only reset selectedFile for generic errors
    this.selectedFile = null;

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
        const closeButton = document.getElementById('closeMissingNicsPopup');
        if (closeButton) {
          closeButton.addEventListener('click', () => {
            this.resetFileState();
            Swal.close();
          });
        }

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
            Error : Unregistered Users found in the CSV file!
          </h2>
        </div>
        <p class="text-gray-700 dark:text-gray-300 text-lg font-semibold mb-2">
          Please note: Cluster creation cannot proceed while unregistered users exists.
        </p>
      </div>

      <p class="text-gray-800 dark:text-gray-200 text-left mb-4">
        Add Farmer Clusters - ${this.selectedFile?.name || 'Unknown File'}
      </p>
      <hr class="border-gray-300 dark:border-gray-600"/>
      <div class="flex justify-end my-4">
        <button
          id="downloadMissingNicsCSVBtn"
          class="text-[#3980C0] hover:text-blue-700 hover:underline cursor-pointer flex items-center gap-2 bg-transparent border-0">
          <i class="fa-regular fa-circle-check"></i>
          File with unregistered users downloaded
        </button>
      </div>

      <!-- Missing NICs Table -->
      <div class="mb-6">
        <table class="w-full">
          <thead>
            <tr>
              <th></th>
              <th class="px-4 py-3 text-center text-gray-800 dark:text-gray-200">No</th>
              <th class="px-4 py-3 text-center text-gray-800 dark:text-gray-200">NIC</th>
            </tr>
          </thead>
          <tbody class="w-full border-collapse border border-gray-300 dark:border-gray-600">
            ${missingNICs
              .map(
                (nic, index) => `
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-600">
                <td class="border-b border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">
                  <i class="fa-solid fa-triangle-exclamation text-red-800"></i>
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
        ${missingNICs.length} items
      </p>

      <!-- Action Button -->
      <div class="text-center">
        <button
          id="closeMissingNicsPopup"
          class="bg-gray-500 hover:bg-gray-600 text-white py-3 px-8 rounded-full mt-10">
          Close & Go Back
        </button>
      </div>
    </div>
  `;
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

  private showMissingRegCodesErrorPopup(missingRegCodeDetails: any[]): void {
    Swal.fire({
      html: this.generateMissingRegCodesPopupHTML(missingRegCodeDetails),
      showConfirmButton: false,
      width: '900px',
      customClass: {
        popup: '!bg-white dark:!bg-gray-800 !text-gray-800 dark:!text-white',
        container: '!flex !items-center !justify-center',
      },
      didOpen: () => {
        const closeButton = document.getElementById(
          'closeMissingRegCodesPopup'
        );
        if (closeButton) {
          closeButton.addEventListener('click', () => {
            this.resetFileState();
            Swal.close();
          });
        }

        const downloadButton = document.getElementById(
          'downloadMissingRegCodesCSVBtn'
        );
        if (downloadButton) {
          downloadButton.addEventListener('click', () => {
            this.downloadMissingRegCodesCSV(missingRegCodeDetails);
          });
        }
      },
    });
  }

  private generateMissingRegCodesPopupHTML(
    missingRegCodeDetails: any[]
  ): string {
    return `
    <div class="p-6 bg-white dark:bg-gray-800 rounded-lg max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="flex items-center justify-center mb-4">
          <h2 class="text-2xl">
            Error : Non existing Farm IDs found in the CSV file!
          </h2>
        </div>
        <p class="text-gray-700 dark:text-gray-300 text-lg font-semibold mb-2">
          Please Note: Cluster creation cannot proceed because the uploaded CSV file contains Farm IDs that do not exist in the system.
        </p>
      </div>

      <p class="text-gray-800 dark:text-gray-200 text-left mb-4">
        Add Farmer Clusters - ${this.selectedFile?.name || 'Unknown File'}
      </p>
      <hr class="border-gray-300 dark:border-gray-600"/>
      <div class="flex justify-end my-4">
        <button
          id="downloadMissingRegCodesCSVBtn"
          class="text-[#3980C0] hover:text-blue-700 hover:underline cursor-pointer flex items-center gap-2 bg-transparent border-0">
          <i class="fa-regular fa-circle-check"></i>
          File with non-existing Farm IDs downloaded
        </button>
      </div>

      <!-- Missing Registration Codes Table with NIC -->
      <div class="mb-6">
        <table class="w-full">
          <thead>
            <tr>
              <th></th>
              <th class="px-4 py-3 text-center text-gray-800 dark:text-gray-200">No</th>
              <th class="px-4 py-3 text-center text-gray-800 dark:text-gray-200">NIC</th>
              <th class="px-4 py-3 text-center text-gray-800 dark:text-gray-200">Farm ID</th>
            </tr>
          </thead>
          <tbody class="w-full border-collapse border border-gray-300 dark:border-gray-600">
            ${missingRegCodeDetails
              .map(
                (detail, index) => `
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-600">
                <td class="border-b border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">
                  <i class="fa-solid fa-triangle-exclamation text-red-800"></i>
                </td>
                <td class="border-b border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">${
                  index + 1
                }</td>
                <td class="border-b border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 font-mono">${
                  detail.farmerNIC
                }</td>
                <td class="border-b border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 font-mono">${
                  detail.regCode
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
        ${missingRegCodeDetails.length} items
      </p>

      <!-- Action Button -->
      <div class="text-center">
        <button
          id="closeMissingRegCodesPopup"
          class="bg-[#74788D] hover:bg-gray-600 text-white py-3 px-8 rounded-full mt-10">
          Close & Go Back
        </button>
      </div>
    </div>
  `;
  }

  private downloadMissingRegCodesCSV(missingRegCodes: string[]): void {
    try {
      const headers = ['No', 'Farm ID'];

      // Force Excel to treat Farm ID column as text using ="value"
      const csvContent = [
        headers.join(','), // header row
        ...missingRegCodes.map(
          (regCode, index) => `${index + 1},="${regCode}"`
        ),
      ].join('\n');

      // Add BOM for better Excel compatibility (especially with Unicode)
      const bom = '\uFEFF';
      const blob = new Blob([bom + csvContent], {
        type: 'text/csv;charset=utf-8;',
      });

      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `invalid_farm_ids_${
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
}
