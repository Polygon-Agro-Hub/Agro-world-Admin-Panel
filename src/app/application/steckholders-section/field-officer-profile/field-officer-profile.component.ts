import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectionService } from '../../../services/collection.service';
import { CollectionOfficerService } from '../../../services/collection-officer/collection-officer.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { PlantcareUsersService } from '../../../services/plant-care/plantcare-users.service';
import { TokenService } from '../../../services/token/services/token.service';

@Component({
  selector: 'app-field-officer-profile',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './field-officer-profile.component.html',
  styleUrl: './field-officer-profile.component.css'
})
export class FieldOfficerProfileComponent {

  officerObj: FieldOfficer = new FieldOfficer();
  officerId!: number;
  isLoading = false;
  isGeneratingPDF = false;

  constructor(
    private route: ActivatedRoute,
    private collectionService: CollectionService,
    private collectionOfficerService: CollectionOfficerService,
    private plantcareService: PlantcareUsersService,
    private router: Router,
    private location: Location,
    private tokenService: TokenService
  ) { }

  ngOnInit(): void {
    this.officerId = this.route.snapshot.params['id'];
    this.fetchOfficerById(this.officerId);
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }


  fetchOfficerById(id: number) {
    this.isLoading = true;
    this.plantcareService
      .fetchAllfieldOfficerProfile(id)
      .subscribe((res: any) => {
        console.log("this is data", res);

        this.isLoading = false;
        this.officerObj = res.officerData.fieldOfficer;
      });
  }


  goBack() {
    window.history.back();
  }

  // viewOfficerTarget(officerId: number) {
  //   this.router.navigate([
  //     `/steckholders/action/collective-officer/view-officer-targets/${officerId}`,
  //   ]);
  // }


  openImage(url: string): void {
    if (url) {
      window.open(url, '_blank'); // Opens image in a new tab
    }
  }

  editFieldOfficer(id: number) {
    this.navigatePath(
      `/steckholders/action/edit-field-officer/${id}`
    );
  }

  deleteFieldOfficer(id: number) {
    const token = this.tokenService.getToken();
    if (!token) return;

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this Field Officer? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
        confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700',
        cancelButton: 'bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 ml-2'
      },
      buttonsStyling: false, // let Tailwind handle button styling
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.plantcareService.deleteFieldOfficer(id).subscribe(
          (data) => {
            this.isLoading = false;
            if (data.status) {
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'The Field Officer has been deleted.',
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold',
                  confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
                },
                buttonsStyling: false
              });
              this.router.navigate(['/steckholders/action']);
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'There was an error deleting the Field Officer.',
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold',
                  confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
                },
                buttonsStyling: false
              });
            }
          },
          () => {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'There was an error deleting the Field Officer.',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold',
                confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
              },
              buttonsStyling: false
            });
          }
        );
      }
    });
  }

  async generatePDF() {
    this.isGeneratingPDF = true;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const borderPadding = 10;
      let yPos = margin + borderPadding;

      // Add outermost border
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

      // Try to add profile image if available
      if (this.officerObj.image) {
        try {
          const imgData = await this.loadImage(this.officerObj.image);

          // Add profile image
          pdf.addImage(imgData, 'JPEG', margin, yPos, 30, 30);

          // Officer details next to image
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(18);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${this.officerObj.firstName} ${this.officerObj.lastName}`, margin + 35, yPos + 8);

          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`${this.officerObj.jobRole} - ${this.officerObj.empId}`, margin + 35, yPos + 16);
          pdf.text(this.officerObj.companyName || '', margin + 35, yPos + 23);

          yPos += 40;
        } catch (error) {
          console.error('Image loading error:', error);
          // Fallback if image loading fails
          this.createHeaderWithoutImage(pdf, pageWidth, margin, yPos);
          yPos += 35;
        }
      } else {
        this.createHeaderWithoutImage(pdf, pageWidth, margin, yPos);
        yPos += 35;
      }

      // Reset text color for body
      pdf.setTextColor(0, 0, 0);

      // Section: Personal Information
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Personal Information', margin, yPos);
      yPos += 8;

      // Personal info fields in 2 columns
      const colWidth = (pageWidth - 2 * margin - 10) / 2;
      pdf.setFontSize(9);

      // First Name
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.text('First Name', margin, yPos);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text(this.officerObj.firstName || '-', margin, yPos + 4);

      // Last Name
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Last Name', margin + colWidth, yPos);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text(this.officerObj.lastName || '-', margin + colWidth, yPos + 4);
      yPos += 12;

      // NIC Number
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text('NIC Number', margin, yPos);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text(this.officerObj.nic || '-', margin, yPos + 4);

      // Email
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Email', margin + colWidth, yPos);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      const emailLines = pdf.splitTextToSize(this.officerObj.email || '-', colWidth - 5);
      pdf.text(emailLines, margin + colWidth, yPos + 4);
      yPos += 12;

      // Mobile Number 1
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Mobile Number - 1', margin, yPos);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${this.officerObj.phoneCode01 || ''} ${this.officerObj.phoneNumber01 || '-'}`, margin, yPos + 4);

      // Mobile Number 2
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Mobile Number - 2', margin + colWidth, yPos);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      const phone2 = this.officerObj.phoneNumber02
        ? `${this.officerObj.phoneCode02 || ''} ${this.officerObj.phoneNumber02}`
        : '-';
      pdf.text(phone2, margin + colWidth, yPos + 4);
      yPos += 12;

      // Districts
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Districts', margin, yPos);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      const districts = this.officerObj.assignDistricts?.join(', ') || '-';
      const districtLines = pdf.splitTextToSize(districts, colWidth - 5);
      pdf.text(districtLines, margin, yPos + 4);

      // Preferred Language
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Preferred Language', margin + colWidth, yPos);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text(this.officerObj.language || '-', margin + colWidth, yPos + 4);
      yPos += 12;

      // Employee Type (if exists)
      if (this.officerObj.employeeType) {
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.text('Employee Type', margin, yPos);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'bold');
        pdf.text(this.officerObj.employeeType || '-', margin, yPos + 4);

        // Status
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.text('Status', margin + colWidth, yPos);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'bold');
        pdf.text(this.officerObj.status || '-', margin + colWidth, yPos + 4);
        yPos += 12;
      }

      yPos += 3;

      // Section: Address Details
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Address Details', margin, yPos);
      yPos += 8;

      pdf.setFontSize(9);
      // House Number
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text('House / Plot Number', margin, yPos);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text(this.officerObj.houseNumber || '-', margin, yPos + 4);

      // Street Name
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Street Name', margin + colWidth, yPos);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text(this.officerObj.streetName || '-', margin + colWidth, yPos + 4);
      yPos += 12;

      // City
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text('City', margin, yPos);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text(this.officerObj.city || '-', margin, yPos + 4);

      // Country
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Country', margin + colWidth, yPos);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text(this.officerObj.country || '-', margin + colWidth, yPos + 4);
      yPos += 12;

      // Province
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Province', margin, yPos);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text(this.officerObj.province || '-', margin, yPos + 4);

      // District
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text('District', margin + colWidth, yPos);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text(this.officerObj.district || '-', margin + colWidth, yPos + 4);
      yPos += 15;

      // Check if we need a new page
      if (yPos > pageHeight - 70) {
        pdf.addPage();
        yPos = margin;
      }

      // Section: Bank Details
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Bank Details', margin, yPos);
      yPos += 8;

      pdf.setFontSize(9);
      // Account Holder Name
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text("Account Holder's Name", margin, yPos);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text(this.officerObj.accHolderName || '-', margin, yPos + 4);

      // Account Number
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Account Number', margin + colWidth, yPos);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text(this.officerObj.accNumber || '-', margin + colWidth, yPos + 4);
      yPos += 12;

      // Bank Name
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Bank Name', margin, yPos);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text(this.officerObj.bankName || '-', margin, yPos + 4);

      // Branch Name
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Branch Name', margin + colWidth, yPos);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text(this.officerObj.branchName || '-', margin + colWidth, yPos + 4);
      yPos += 12;

      // Commission Amount
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Commission Amount', margin, yPos);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`LKR ${this.officerObj.comAmount || '-'}`, margin, yPos + 4);
      yPos += 15;

      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'italic');
  
      // Save the PDF
      const fileName = `${this.officerObj.empId} - ${this.officerObj.firstName} ${this.officerObj.lastName}.pdf`;
      pdf.save(fileName);

      this.isGeneratingPDF = false;

      // Success notification
      Swal.fire({
        icon: 'success',
        title: 'PDF Generated!',
        text: 'The profile has been downloaded successfully.',
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        }
      });
    } catch (error) {
      this.isGeneratingPDF = false;
      console.error('Error generating PDF:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to generate PDF. Please try again.',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        }
      });
    }
  }

  // Helper method to create header without image
  private createHeaderWithoutImage(pdf: any, pageWidth: number, margin: number, yPos: number) {
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${this.officerObj.firstName} ${this.officerObj.lastName}`, margin, yPos);

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${this.officerObj.jobRole} - ${this.officerObj.empId}`, margin, yPos + 8);
    pdf.text(this.officerObj.companyName || '', margin, yPos + 15);
  }

  // Helper method to load images
  private loadImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
            resolve(dataUrl);
          } else {
            reject(new Error('Could not get canvas context'));
          }
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = (error) => {
        console.error('Image load error:', error);
        reject(error);
      };

      // Add timestamp to prevent caching issues
      img.src = url.includes('?') ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`;
    });
  }
}



class FieldOfficer {
  id!: number;
  firstName!: string;
  lastName!: string;
  phoneNumber01!: string;
  phoneNumber02!: string;
  phoneCode01!: string;
  phoneCode02!: string;
  image!: string;
  frontNic!: string;
  backNic!: string;
  backPassbook!: string;
  contract!: string;
  nic!: string;
  email!: string;
  houseNumber!: string;
  streetName!: string;
  city!: string;
  district!: string;
  province!: string;
  country!: string;
  empId!: string;
  jobRole!: string;
  accHolderName!: string;
  accNumber!: string;
  bankName!: string;
  branchName!: string;
  companyName!: string;
  status!: string;
  assignDistricts: [] = [];
  comAmount!: string;
  language!: string;
  employeeType!: string;
}

