import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { MarketPriceService } from '../../../services/market-price/market-price.service';
import { PlantcareUsersService } from '../../../services/plant-care/plantcare-users.service';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface UserErrorEntry {
  line: number;
  phone: string;
  nic: string;
  status: string;
}

interface DuplicationEntry {
  firstName: string;
  lastName: string;
  nic: string;
  phoneNumber: string;
}

@Component({
  selector: 'app-user-bulk-upload',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
    FormsModule,
  ],
  templateUrl: './user-bulk-upload.component.html',
  styleUrl: './user-bulk-upload.component.css',
})
export class UserBulkUploadComponent {
  selectedFile: any = null;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading = false;
  duplicateEntries: UserErrorEntry[] = [];

  // Check if dark mode is enabled
  private isDarkMode(): boolean {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ||
             document.body.classList.contains('dark') ||
             window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }

  constructor(
    private http: HttpClient,
    private plantcareUsersService: PlantcareUsersService,
    private router: Router
  ) { }

  back(): void {
    this.router.navigate(['steckholders/action/farmers']);
  }

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
      Swal.fire({
        icon: 'error',
        title: 'Invalid File Type',
        text: 'Please upload a CSV or XLSX file.',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-white dark:bg-[#363636] text-gray-800 dark:text-white',
          title: 'dark:text-white',
        }
      });
    }
  }

  onUpload(): void {
    if (!this.selectedFile) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'Please select a file to upload',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-white dark:bg-[#363636] text-gray-800 dark:text-white',
          title: 'dark:text-white',
        }
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.plantcareUsersService.uploadUserXlsxFile(formData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        
        // Log the response for debugging
        console.log('Backend Response:', response);
        
        // FIRST: Check for duplicate entries in Excel (internal duplication)
        if (response.duplicateData && response.duplicateData.length > 0) {
          this.handleDuplicateEntries(response.duplicateData);
        }
        // SECOND: Check for existing users in database (redundancy)
        else if (response.existingUsers && response.existingUsers.length > 0) {
          this.handleExistingUsers(response.existingUsers);
        }
        // THIRD: Check for successful upload
        else if (response.newUsersInserted > 0) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: `Successfully uploaded ${response.newUsersInserted} users!`,
            confirmButtonText: 'OK',
            customClass: {
              popup: 'bg-white dark:bg-[#363636] text-gray-800 dark:text-white',
              title: 'dark:text-white',
            }
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/steckholders/action/farmers']);
            }
          });
        }
        // FOURTH: Handle case where no data was uploaded
        else {
          Swal.fire({
            icon: 'info',
            title: 'No Data Processed',
            text: 'No new users were uploaded.',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'bg-white dark:bg-[#363636] text-gray-800 dark:text-white',
              title: 'dark:text-white',
            }
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/steckholders/action/farmers']);
            }
          });
        }
        
        this.selectedFile = null;
      },
      error: (error) => {
        this.isLoading = false;
        this.handleError(error);
      },
    });
  }

  // Helper method to handle duplicate entries
  private handleDuplicateEntries(duplicateData: any[]): void {
    // Check what format the backend is returning
    console.log('Duplicate Data Structure:', duplicateData);
    
    // Convert to DuplicationEntry format if needed
    const duplicateEntries: DuplicationEntry[] = duplicateData.map((entry: any, index: number) => {
      // Try different possible field names from backend
      return {
        firstName: entry.firstName || entry.firstname || entry['First Name'] || entry['FIRST NAME'] || entry['first_name'] || `Entry ${index + 1}`,
        lastName: entry.lastName || entry.lastname || entry['Last Name'] || entry['LAST NAME'] || entry['last_name'] || '',
        nic: entry.nic || entry.NIC || entry.NICnumber || entry['NIC Number'] || entry['NIC'] || entry['nic_number'] || '',
        phoneNumber: entry.phoneNumber || entry.phone || entry['Phone Number'] || entry['PHONE NUMBER'] || entry['Phone'] || entry['phone_number'] || ''
      };
    });
    
    this.downloadDuplicationExcel(duplicateEntries, 'duplicate_entries.xlsx');
    
    const isDarkMode = this.isDarkMode();
    
    Swal.fire({
      icon: 'warning',
      title: 'Error : Duplicate Entries Found in Excel Sheet!',
      html: isDarkMode 
        ? this.buildDuplicationDarkModeTable(duplicateEntries, `Add GoVi Care user  - ${this.selectedFile.name}`)
        : this.buildDuplicationLightModeTable(duplicateEntries, `Add GoVi Care user - ${this.selectedFile.name}`),
      width: '700px',
      showConfirmButton: true,
      confirmButtonText: 'Close & Go Back',
      customClass: {
        popup: isDarkMode ? '!bg-[#363636] !text-white !p-6' : '!bg-white !text-gray-800 !p-6',
        title: isDarkMode ? '!text-red-400 !font-bold !text-lg !mb-4' : '!text-red-600 !font-bold !text-lg !mb-4',
        htmlContainer: isDarkMode ? '!text-white !m-0 !p-0' : '!text-gray-800 !m-0 !p-0',
        confirmButton: isDarkMode ? '!bg-blue-500 !text-white !font-medium !py-2 !px-6 !rounded !mt-4 hover:!bg-blue-600' 
                                 : '!bg-blue-600 !text-white !font-medium !py-2 !px-6 !rounded !mt-4 hover:!bg-blue-700'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/steckholders/action/farmers']);
      }
    });
  }

  // Helper method to handle existing users
  private handleExistingUsers(existingUsers: any[]): void {
    // Convert to UserErrorEntry format
    const errorEntries: UserErrorEntry[] = existingUsers.map((user: any, index: number) => {
      let status = '';
      if (user.phoneNumber && user.NICnumber) {
        status = 'Phone number & NIC already exists';
      } else if (user.phoneNumber) {
        status = 'Phone number already exists';
      } else if (user.NICnumber) {
        status = 'NIC already exists';
      }
      
      return {
        line: index + 3,
        phone: user.phoneNumber || '',
        nic: user.NICnumber || '',
        status: status
      };
    });

    this.downloadErrorExcel(errorEntries, 'existing_users.xlsx');
    
    const isDarkMode = this.isDarkMode();
    
    Swal.fire({
      icon: 'warning',
      title: 'Error : User Redundancy!',
      html: isDarkMode 
        ? this.buildRedundancyDarkModeTable(errorEntries, `Add GoVi Care user - ${this.selectedFile.name}`)
        : this.buildRedundancyLightModeTable(errorEntries, `Add GoVi Care user - ${this.selectedFile.name}`),
      width: '700px',
      showConfirmButton: true,
      confirmButtonText: 'Close & Go Back',
      customClass: {
        popup: isDarkMode ? '!bg-[#363636] !text-white !p-6' : '!bg-white !text-gray-800 !p-6',
        title: isDarkMode ? '!text-red-400 !font-bold !text-lg !mb-4' : '!text-red-600 !font-bold !text-lg !mb-4',
        htmlContainer: isDarkMode ? '!text-white !m-0 !p-0' : '!text-gray-800 !m-0 !p-0',
        confirmButton: isDarkMode ? '!bg-blue-500 !text-white !font-medium !py-2 !px-6 !rounded !mt-4 hover:!bg-blue-600' 
                                 : '!bg-blue-600 !text-white !font-medium !py-2 !px-6 !rounded !mt-4 hover:!bg-blue-700'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/steckholders/action/farmers']);
      }
    });
  }

  // ========== User Redundancy Error (LINE, PHONE, NIC, STATUS) ==========

  private buildRedundancyLightModeTable(entries: UserErrorEntry[], fileName: string): string {
    return `
      <div style="font-family: Arial, sans-serif; color: #000;">
        <!-- Error message -->
        <p style="margin: 0 0 16px 0; color: #666; font-size: 14px;">
          Please note: These user profiles with redundancy errors were not uploaded.
        </p>
        
        <!-- File name -->
        <p style="margin: 0 0 8px 0; font-weight: bold; color: #000; font-size: 14px;">
          ${fileName}
        </p>
        
        <!-- Blank line -->
        <div style="height: 8px;"></div>
        
        <!-- Horizontal line -->
        <hr style="border: none; border-top: 1px solid #ccc; margin: 8px 0 16px 0;">
        
        <!-- Download message -->
        <p style="margin: 0 0 16px 0; text-align: right; color: #666; font-size: 14px;">
          File with existing users downloaded
        </p>
        
        <!-- Blank line -->
        <div style="height: 8px;"></div>
        
        <!-- Table headers -->
        <div style="margin-bottom: 8px; font-weight: bold; font-size: 14px;">
          <span style="display: inline-block; width: 60px; text-align: left;">LINE</span>
          <span style="display: inline-block; width: 120px; text-align: left;">PHONE</span>
          <span style="display: inline-block; width: 120px; text-align: left;">NIC</span>
          <span style="display: inline-block; width: 250px; text-align: left;">STATUS</span>
        </div>
        
        <!-- Blank line -->
        <div style="height: 4px;"></div>
        
        <!-- Table rows -->
        ${entries.map(entry => `
          <div style="margin-bottom: 6px; font-size: 14px;">
            <span style="display: inline-block; width: 60px; text-align: left;">
              <span style="color: #f59e0b; margin-right: 4px;">⚠</span>${entry.line}
            </span>
            <span style="display: inline-block; width: 120px; text-align: left;">${entry.phone}</span>
            <span style="display: inline-block; width: 120px; text-align: left;">${entry.nic}</span>
            <span style="display: inline-block; width: 250px; text-align: left;">${entry.status}</span>
          </div>
        `).join('')}
        
        <!-- Blank line -->
        <div style="height: 16px;"></div>
        
        <!-- Item count -->
        <p style="margin: 0; font-weight: bold; color: #000; font-size: 14px;">
          ${entries.length} items
        </p>
      </div>
    `;
  }

  private buildRedundancyDarkModeTable(entries: UserErrorEntry[], fileName: string): string {
    return `
      <div style="font-family: Arial, sans-serif; color: #e5e7eb;">
        <!-- Error message -->
        <p style="margin: 0 0 16px 0; color: #9ca3af; font-size: 14px;">
          Please note: These user profiles with redundancy errors were not uploaded.
        </p>
        
        <!-- File name -->
        <p style="margin: 0 0 8px 0; font-weight: bold; color: #e5e7eb; font-size: 14px;">
          ${fileName}
        </p>
        
        <!-- Blank line -->
        <div style="height: 8px;"></div>
        
        <!-- Horizontal line -->
        <hr style="border: none; border-top: 1px solid #4b5563; margin: 8px 0 16px 0;">
        
        <!-- Download message -->
        <p style="margin: 0 0 16px 0; text-align: right; color: #9ca3af; font-size: 14px;">
          File with existing users downloaded
        </p>
        
        <!-- Blank line -->
        <div style="height: 8px;"></div>
        
        <!-- Table headers -->
        <div style="margin-bottom: 8px; font-weight: bold; font-size: 14px; color: #d1d5db;">
          <span style="display: inline-block; width: 60px; text-align: left;">LINE</span>
          <span style="display: inline-block; width: 120px; text-align: left;">PHONE</span>
          <span style="display: inline-block; width: 120px; text-align: left;">NIC</span>
          <span style="display: inline-block; width: 250px; text-align: left;">STATUS</span>
        </div>
        
        <!-- Blank line -->
        <div style="height: 4px;"></div>
        
        <!-- Table rows -->
        ${entries.map(entry => `
          <div style="margin-bottom: 6px; font-size: 14px; color: #e5e7eb;">
            <span style="display: inline-block; width: 60px; text-align: left;">
              <span style="color: #fbbf24; margin-right: 4px;">⚠</span>${entry.line}
            </span>
            <span style="display: inline-block; width: 120px; text-align: left;">${entry.phone}</span>
            <span style="display: inline-block; width: 120px; text-align: left;">${entry.nic}</span>
            <span style="display: inline-block; width: 250px; text-align: left;">${entry.status}</span>
          </div>
        `).join('')}
        
        <!-- Blank line -->
        <div style="height: 16px;"></div>
        
        <!-- Item count -->
        <p style="margin: 0; font-weight: bold; color: #e5e7eb; font-size: 14px;">
          ${entries.length} items
        </p>
      </div>
    `;
  }

  // ========== Duplication Entries Error (FIRST NAME, LAST NAME, NIC, PHONE NUMBER) ==========

  private buildDuplicationLightModeTable(entries: DuplicationEntry[], fileName: string): string {
    return `
      <div style="font-family: Arial, sans-serif; color: #000;">
        <!-- Error message -->
        <p style="margin: 0 0 16px 0; color: #666; font-size: 14px;">
          Please note: These duplicate entries were found within the Excel file itself.
        </p>
        
        <!-- File name -->
        <p style="margin: 0 0 8px 0; font-weight: bold; color: #000; font-size: 14px;">
          ${fileName}
        </p>
        
        <!-- Blank line -->
        <div style="height: 8px;"></div>
        
        <!-- Horizontal line -->
        <hr style="border: none; border-top: 1px solid #ccc; margin: 8px 0 16px 0;">
        
        <!-- Download message -->
        <p style="margin: 0 0 16px 0; text-align: right; color: #666; font-size: 14px;">
          File with duplicate entries downloaded
        </p>
        
        <!-- Blank line -->
        <div style="height: 8px;"></div>
        
        <!-- Table headers -->
        <div style="margin-bottom: 8px; font-weight: bold; font-size: 14px;">
          <span style="display: inline-block; width: 120px; text-align: left;">FIRST NAME</span>
          <span style="display: inline-block; width: 120px; text-align: left;">LAST NAME</span>
          <span style="display: inline-block; width: 120px; text-align: left;">NIC</span>
          <span style="display: inline-block; width: 150px; text-align: left;">PHONE NUMBER</span>
        </div>
        
        <!-- Blank line -->
        <div style="height: 4px;"></div>
        
        <!-- Table rows -->
        ${entries.map(entry => `
          <div style="margin-bottom: 6px; font-size: 14px;">
            <span style="display: inline-block; width: 120px; text-align: left;">
              <span style="color: #f59e0b; margin-right: 4px;">⚠</span>${entry.firstName}
            </span>
            <span style="display: inline-block; width: 120px; text-align: left;">${entry.lastName}</span>
            <span style="display: inline-block; width: 120px; text-align: left;">${entry.nic}</span>
            <span style="display: inline-block; width: 150px; text-align: left;">${entry.phoneNumber}</span>
          </div>
        `).join('')}
        
        <!-- Blank line -->
        <div style="height: 16px;"></div>
        
        <!-- Item count -->
        <p style="margin: 0; font-weight: bold; color: #000; font-size: 14px;">
          ${entries.length} duplicate entries
        </p>
      </div>
    `;
  }

  private buildDuplicationDarkModeTable(entries: DuplicationEntry[], fileName: string): string {
    return `
      <div style="font-family: Arial, sans-serif; color: #e5e7eb;">
        <!-- Error message -->
        <p style="margin: 0 0 16px 0; color: #9ca3af; font-size: 14px;">
          Please note: These duplicate entries were found within the Excel file itself.
        </p>
        
        <!-- File name -->
        <p style="margin: 0 0 8px 0; font-weight: bold; color: #e5e7eb; font-size: 14px;">
          ${fileName}
        </p>
        
        <!-- Blank line -->
        <div style="height: 8px;"></div>
        
        <!-- Horizontal line -->
        <hr style="border: none; border-top: 1px solid #4b5563; margin: 8px 0 16px 0;">
        
        <!-- Download message -->
        <p style="margin: 0 0 16px 0; text-align: right; color: #9ca3af; font-size: 14px;">
          File with duplicate entries downloaded
        </p>
        
        <!-- Blank line -->
        <div style="height: 8px;"></div>
        
        <!-- Table headers -->
        <div style="margin-bottom: 8px; font-weight: bold; font-size: 14px; color: #d1d5db;">
          <span style="display: inline-block; width: 120px; text-align: left;">FIRST NAME</span>
          <span style="display: inline-block; width: 120px; text-align: left;">LAST NAME</span>
          <span style="display: inline-block; width: 120px; text-align: left;">NIC</span>
          <span style="display: inline-block; width: 150px; text-align: left;">PHONE NUMBER</span>
        </div>
        
        <!-- Blank line -->
        <div style="height: 4px;"></div>
        
        <!-- Table rows -->
        ${entries.map(entry => `
          <div style="margin-bottom: 6px; font-size: 14px; color: #e5e7eb;">
            <span style="display: inline-block; width: 120px; text-align: left;">
              <span style="color: #fbbf24; margin-right: 4px;">⚠</span>${entry.firstName}
            </span>
            <span style="display: inline-block; width: 120px; text-align: left;">${entry.lastName}</span>
            <span style="display: inline-block; width: 120px; text-align: left;">${entry.nic}</span>
            <span style="display: inline-block; width: 150px; text-align: left;">${entry.phoneNumber}</span>
          </div>
        `).join('')}
        
        <!-- Blank line -->
        <div style="height: 16px;"></div>
        
        <!-- Item count -->
        <p style="margin: 0; font-weight: bold; color: #e5e7eb; font-size: 14px;">
          ${entries.length} duplicate entries
        </p>
      </div>
    `;
  }

  private downloadErrorExcel(entries: UserErrorEntry[], fileName: string): void {
    try {
      const dataForExcel = entries.map(entry => ({
        'LINE': entry.line,
        'PHONE': entry.phone,
        'NIC': entry.nic,
        'STATUS': entry.status
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Existing Users');
      
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Failed to generate Excel file:', error);
    }
  }

  private downloadDuplicationExcel(entries: DuplicationEntry[], fileName: string): void {
    try {
      const dataForExcel = entries.map(entry => ({
        'FIRST NAME': entry.firstName,
        'LAST NAME': entry.lastName,
        'NIC': entry.nic,
        'PHONE NUMBER': entry.phoneNumber
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Duplicate Entries');
      
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Failed to generate Excel file:', error);
    }
  }

  private handleError(error: any): void {
    this.isLoading = false;
    this.selectedFile = null;

    let errorMessage = 'Failed to upload file. Please try again.';
    if (error.status === 400) {
      errorMessage = error.error?.error || 'Invalid file or data format.';
    } else if (error.status === 413) {
      errorMessage = 'File size too large. Please upload a smaller file.';
    }

    Swal.fire({
      icon: 'error',
      title: 'Upload Failed',
      text: errorMessage,
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-white dark:bg-[#363636] text-gray-800 dark:text-white',
        title: 'dark:text-white',
      }
    });
  }

  onCancel() {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after canceling!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'No, Keep Editing',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
      buttonsStyling: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/steckholders/action/farmers']);
      }
    });
  }
}