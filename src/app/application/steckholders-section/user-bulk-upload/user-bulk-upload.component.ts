import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";
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

interface ExistingUser {
 
  firstName: string;
  lastName: string;
  phoneNumber: string;
  NICnumber: string;
}

@Component({
  selector: 'app-user-bulk-upload',
  standalone: true,
  imports: [  CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
    FormsModule ],
  templateUrl: './user-bulk-upload.component.html',
  styleUrl: './user-bulk-upload.component.css'
})
export class UserBulkUploadComponent {
  selectedFile: File | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading = false;
   existingUsers: ExistingUser[] = [];
   duplicateEntries: ExistingUser[] = [];
   
  constructor(private http: HttpClient, private plantcareUsersService: PlantcareUsersService, private router: Router) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.validateFile(file);
  }


  onDragOver(event: any): void {
    event.preventDefault(); // Prevent the default behavior of opening the file
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
      this.errorMessage = 'Invalid file type. Please upload a CSV or XLSX file.';
      this.selectedFile = null;
      Swal.fire({
        icon: 'error',
        title: 'Invalid File Type',
        text: 'Please upload a CSV or XLSX file.',
        confirmButtonText: 'OK'
      })
    }
  }

 
  


  onUpload(): void {
    if (!this.selectedFile) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'Please select a file to upload',
        confirmButtonText: 'OK'
      });
      return;
    }
  
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
  
    // Read the file to check for duplicates before uploading
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
        // Check for duplicates
        const phoneNumbers = new Map();
        const nicNumbers = new Map();
        const duplicates: ExistingUser[] = [];
  
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          const phoneNumber = String((row as { [key: string]: any })['Phone Number']);
          const nicNumber = String((row as { [key: string]: any })['NIC Number']);

          const firstName = String((row as { [key: string]: any })['First Name']);
          const lastName = String((row as { [key: string]: any })['Last Name']);

          // Check for duplicate phone numbers
          if (phoneNumbers.has(phoneNumber)) {
            duplicates.push({
              firstName,
              lastName,
              phoneNumber,
              NICnumber: nicNumber
            });
          } else {
            phoneNumbers.set(phoneNumber, i);
          }
  
          // Check for duplicate NIC numbers
          if (nicNumbers.has(nicNumber)) {
            // Only add if not already added due to phone number
            if (!duplicates.some(d => d.phoneNumber === phoneNumber && d.NICnumber === nicNumber)) {
              duplicates.push({
                firstName,
                lastName,
                phoneNumber,
                NICnumber: nicNumber
              });
            }
          } else {
            nicNumbers.set(nicNumber, i);
          }
        }
  
        // If duplicates are found, show them and stop the upload
        if (duplicates.length > 0) {
          this.isLoading = false;
          this.downloadExcel(duplicates, 'duplicate_entries.xlsx');
          
          Swal.fire({
            icon: 'warning',
            title: 'Duplicate Entries Found!',
            html: `
              <p>Please note: Your file contains duplicate NIC numbers or phone numbers.</p>
              <br/>
              <p style="text-align: left;">Add Plant Care Users - ${this.selectedFile!.name}</p>
              
              <br/>
              <hr></hr>
              <br/>
              <p style="text-align: right;">File with duplicate entries downloaded.</p>
              <br/>
              <table border="1" style="width: 100%; text-align: left; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">First Name</th>
                    <th style="padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">Last Name</th>
                    <th style="padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">Phone Number</th>
                    <th style="padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">NIC number</th>
                  </tr>
                </thead>
                <tbody>
                  ${duplicates.map(user => `
                    <tr>
                      <td style="padding: 8px; border: 1px solid #ddd;">${user.firstName}</td>
                      <td style="padding: 8px; border: 1px solid #ddd;">${user.lastName}</td>
                      <td style="padding: 8px; border: 1px solid #ddd;">${user.phoneNumber}</td>
                      <td style="padding: 8px; border: 1px solid #ddd;">${user.NICnumber}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <br/>
              <p style="text-align: left;">Found <b>${duplicates.length}</b> duplicate entries.</p>
              <p style="text-align: left;">Please fix duplicates and upload again.</p>
            `,
            width: '80%',
            confirmButtonText: 'Close',
          });
          
          return;
        }
  
        // If no duplicates found, proceed with the upload
        const formData = new FormData();
        formData.append('file', this.selectedFile!);
        
        this.plantcareUsersService.uploadUserXlsxFile(formData).subscribe({
          next: (response: any) => {
            this.isLoading = false;
        
            if (response.existingUsers && response.existingUsers.length > 0) {
              // Download existing users as an Excel file
              this.downloadExcel(response.existingUsers, 'existing_users.xlsx');
              this.existingUsers = response.existingUsers;
        
              Swal.fire({
                icon: 'warning',
                title: 'User Redundancy!',
                html: `
                <p>Please note: These user profiles with redundancy errors were not uploaded.<p>
                 <br/>
                <p style="text-align: left;">Add Plant Care Users - ${this.selectedFile!.name}<p/>
                  
                  <br/>
                  <hr></hr>
                  <br/>
                  <p style="text-align: right;">File with existing users downloaded.</p>
                  <br/>
                  <table border="1" style="width: 100%; text-align: left; border-collapse: collapse;">
                    <thead>
                      <tr>
                        <th style="padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">First Name</th>
                        <th style="padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">Last Name</th>
                        <th style="padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">Phone Number</th>
                        <th style="padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">NIC number</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${this.existingUsers.map(user => `
                        <tr>
                          <td style="padding: 8px; border: 1px solid #ddd;">${user.firstName}</td>
                          <td style="padding: 8px; border: 1px solid #ddd;">${user.lastName}</td>
                           <td style="padding: 8px; border: 1px solid #ddd;">${user.phoneNumber}</td>
                          <td style="padding: 8px; border: 1px solid #ddd;">${user.NICnumber}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                  <br/>
                  <p style="text-align: left;">Successfully added <b>${response.newUsersInserted}</b> new users.</p>
                  <p style="text-align: left;">Found <b>${response.existingUsers.length}</b> existing users:</p>
                  
                `,
                width: '80%',
                confirmButtonText: 'Close & Go Back',
              });
              
            } else if(response.existingUsers){
    
              this.downloadExcel(response.duplicateEntries, 'duplication_entries.xlsx');
              this.duplicateEntries = response.duplicateEntries;
    
              Swal.fire({
                icon: 'warning',
                title: 'Duplication Entries!',
                html: `
                <p>Please note: These user profiles with redundancy errors were not uploaded.<p>
                 <br/>
                <p style="text-align: left;">Add Plant Care Users - ${this.selectedFile!.name}<p/>
                  
                  <br/>
                  <hr></hr>
                  <br/>
                  <p style="text-align: right;">File with duplicate entries users downloaded.</p>
                  <br/>
                  <table border="1" style="width: 100%; text-align: left; border-collapse: collapse;">
                    <thead>
                      <tr>
                        <th style="padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">First Name</th>
                        <th style="padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">Last Name</th>
                        <th style="padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">Phone Number</th>
                        <th style="padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">NIC number</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${this.duplicateEntries.map(user => `
                        <tr>
                          <td style="padding: 8px; border: 1px solid #ddd;">${user.firstName}</td>
                          <td style="padding: 8px; border: 1px solid #ddd;">${user.lastName}</td>
                           <td style="padding: 8px; border: 1px solid #ddd;">${user.phoneNumber}</td>
                          <td style="padding: 8px; border: 1px solid #ddd;">${user.NICnumber}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                  <br/>
                  <p style="text-align: left;">Successfully added <b>${response.newUsersInserted}</b> new users.</p>
                  <p style="text-align: left;">Found <b>${response.duplicateEntries.length}</b> existing users:</p>
                  
                `,
                width: '80%',
                confirmButtonText: 'Close & Go Back',
              });
    
    
            } else {
              Swal.fire({
                icon: 'success',
                title: 'Success',
                text: `Successfully uploaded ${response.rowsAffected} users!`,
                confirmButtonText: 'OK'
              });
            }
      
            this.selectedFile = null;
            this.router.navigate(['/steckholders/action/farmers']);
          },
          error: (error) => {
            this.downloadExcel(error.existingUsers, 'existing_users.xlsx');
            console.error('hii 1');
            this.handleError(error);
          }
        });
      } catch (error) {
        this.isLoading = false;
        console.error('Error reading file:', error);
        this.handleError(new Error('Failed to process the file. Please check the file format.'));
      }
    };
  
    reader.onerror = () => {
      this.isLoading = false;
      this.handleError(new Error('Error reading the file. Please try again.'));
    };
  
    reader.readAsArrayBuffer(this.selectedFile);
  }


/**
 * Utility function to create and download an Excel file.
 * @param data The data to be written to the Excel file.
 * @param fileName The name of the file to download.
 */

  private downloadExcel(data: any[], fileName: string): void {
    try {
      const worksheet = XLSX.utils.json_to_sheet(data); // Convert JSON to Excel sheet
      const workbook = XLSX.utils.book_new(); // Create a new workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Existing Users'); // Append the sheet to the workbook
  
      // Generate a Blob from the workbook
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array'
      });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
  console.log('hi')
      // Use FileSaver to download the file
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Error generating Excel file:', error);
      console.error('hii 2');
      this.handleError(new Error('Failed to generate Excel file'));
    }
  }




  // private handleFileDownload(arrayBuffer: ArrayBuffer): void {
  //   try {
  //     // Convert ArrayBuffer to Blob
  //     const blob = new Blob([arrayBuffer], {
  //       type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  //     });

  //     // Create download link
  //     const url = window.URL.createObjectURL(blob);
  //     const link = document.createElement('a');
  //     link.href = url;
  //     link.download = 'existing_users.xlsx';
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //     window.URL.revokeObjectURL(url);

  //     // Show success message after download
  //     Swal.fire({
  //       icon: 'success',
  //       title: 'Download Complete',
  //       text: 'The file with existing users has been downloaded.',
  //       confirmButtonText: 'OK'
  //     });
  //   } catch (error) {
  //     console.error('Error downloading file:', error);
  //     this.handleError(new Error('Failed to download file'));
  //   }
  // }


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
      confirmButtonText: 'OK'
    });

    console.error('Upload error:', error);
  }





  onCancel(): void {
    if (this.selectedFile) {
      this.selectedFile = null;
    }
  }
}
