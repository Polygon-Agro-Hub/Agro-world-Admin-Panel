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

@Component({
  selector: 'app-view-collective-officer-profile',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './view-collective-officer-profile.component.html',
  styleUrl: './view-collective-officer-profile.component.css',
})
export class ViewCollectiveOfficerProfileComponent {
  officerObj: CollectionOfficer = new CollectionOfficer();
  officerId!: number;
  showDisclaimView = false;
  isLoading = false;
  empHeader: string = '';
  isGeneratingPDF = false;

  constructor(
    private route: ActivatedRoute,
    private collectionService: CollectionService,
    private collectionOfficerService: CollectionOfficerService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.officerId = this.route.snapshot.params['id'];
    this.fetchOfficerById(this.officerId);
    
  }

  getRoleHeading() {
  // Normalize the jobRole to handle both "Center" and "Centre" spellings
  const normalizedRole = this.officerObj.jobRole?.replace('Center', 'Centre') || '';
  
  switch (normalizedRole) {
    case 'Customer Officer':
      this.empHeader = 'CUO';
      break;
    case 'Collection Centre Manager':
      this.empHeader = 'CCM';
      break;
    case 'Collection Centre Head':
      this.empHeader = 'CCH';
      break;
    case 'Collection Officer':
      this.empHeader = 'COO';
      break;
    case 'Distribution Centre Manager':
      this.empHeader = 'DCM';
      break;
    case 'Distribution Officer':
      this.empHeader = 'DIO';
      break;
    case 'Driver':
      this.empHeader = 'DVR';
      break;
    default:
      this.empHeader = '';
  }
}

fetchOfficerById(id: number) {
  this.isLoading = true;
  this.collectionService
    .fetchAllCollectionOfficerProfile(id)
    .subscribe((res: any) => {
      console.log("this is data", res);
      
      this.isLoading = false;
      this.officerObj = res.officerData.collectionOfficer;

      this.officerObj.claimStatus = this.officerObj.claimStatus;
      this.getRoleHeading();
    });
    
}


  goBack() {
  window.history.back();
}

  viewOfficerTarget(officerId: number) {
    this.router.navigate([
      `/steckholders/action/collective-officer/view-officer-targets/${officerId}`,
    ]);
  }

  async generatePDF() {
  this.isGeneratingPDF = true;

  // Initialize jsPDF with A4 size
  const doc = new jsPDF('p', 'mm', 'a4');
  const margin = 10;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Detect dark mode
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Define colors based on theme
  const colors = {
    background: '#FFFFFF', // White background for the page
    textPrimary: isDarkMode ? '#ffffff' : '#030308',
    textSecondary: isDarkMode ? '#cccccc' : '#000000',
    border: '#F5F5F5', // Light gray for section backgrounds
    footerText: '#646464',
  };

  // Set white background for the entire page
  doc.setFillColor(colors.background);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Helper function to check for empty, null, or undefined values
  const getValueOrNA = (value: string | null | undefined): string => {
    return value ? value : 'N/A';
  };

  const getValueOrNAforInsOrLiscNo = (value: number | null | undefined): string => {
    return value !== null && value !== undefined ? value.toString() : 'N/A';
  };

  let y = margin;
  const hasImage = !!this.officerObj.image;

  // Header Section with Image
  if (hasImage) {
    const loadImageAsBase64 = (url: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          const reader = new FileReader();
          reader.onloadend = function () {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(xhr.response);
        };
        xhr.onerror = function () {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          };
          img.onerror = function () {
            resolve('');
          };
          img.src = url;
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.setRequestHeader('Accept', 'image/png;image/*');
        try {
          xhr.send();
        } catch (error) {
          reject(error);
        }
      });
    };

    const appendCacheBuster = (url: string) => {
      if (!url) return '';
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}t=${new Date().getTime()}`;
    };

    const img = new Image();
    const modifiedFarmerUrl = appendCacheBuster(this.officerObj.image);
    img.src = await loadImageAsBase64(modifiedFarmerUrl);

    const imgDiameter = 35;
    const imgRadius = imgDiameter / 2;
    const imgX = margin;
    const imgY = y;

    // Draw circular border
    doc.setDrawColor(colors.border);
    doc.setFillColor(colors.background);
    doc.circle(imgX + imgRadius, imgY + imgRadius, imgRadius, 'FD');
    doc.saveGraphicsState();
    doc.circle(imgX + imgRadius, imgY + imgRadius, imgRadius, 'S');
    doc.clip();
    doc.addImage(img, 'JPEG', imgX, imgY, imgDiameter, imgDiameter);
    doc.restoreGraphicsState();
  }

  const detailsX = hasImage ? margin + 50 : margin;

  // Header Text
  doc.setFontSize(12);
  doc.setTextColor(colors.textPrimary);
  doc.setFont("Inter", "bold");
  doc.text(
    `${getValueOrNA(this.officerObj.firstNameEnglish)} ${getValueOrNA(this.officerObj.lastNameEnglish)}`,
    detailsX,
    y + 10
  );
  y += 7;

  let empType = '';
  const normalizedRole = this.officerObj.jobRole?.replace('Center', 'Centre') || '';
  switch (normalizedRole) {
    case 'Customer Officer':
      empType = 'Customer Officer';
      break;
    case 'Collection Centre Manager':
      empType = 'Collection Centre Manager';
      break;
    case 'Collection Centre Head':
      empType = 'Collection Centre Head';
      break;
    case 'Collection Officer':
      empType = 'Collection Officer';
      break;
    case 'Distribution Centre Manager':
      empType = 'Distribution Centre Manager';
      break;
    case 'Distribution Officer':
      empType = 'Distribution Officer';
      break;
    case 'Driver':
      empType = 'Driver';
      break;
    default:
      empType = getValueOrNA(this.officerObj.jobRole);
  }

  let empId = this.officerObj.empId || '';
  let empCodeText = this.empHeader ? `${this.empHeader}${empId}` : empId;

  doc.setFont("Inter", "bold");
  doc.setTextColor(colors.textPrimary);
  doc.text(getValueOrNA(empCodeText), detailsX, y + 10);
  y += 7;

  // Center Name (if exists)
  if (this.officerObj.centerRegCode) {
    doc.setFont("Inter", "normal");
    doc.setTextColor(colors.textSecondary);
    doc.text(getValueOrNA(this.officerObj.centerRegCode), detailsX, y + 10);
    y += 7;
  }

  // Only show company name, remove the city line
  doc.setFont("Inter", "normal");
  doc.setTextColor(colors.textSecondary);
  doc.text(getValueOrNA(this.officerObj.companyNameEnglish), detailsX, y + 10);
  
  // Add extra space between profile section and Personal Information section
  y += 25; // Increased from 20 to 25 for more spacing

  // Improved page break check function
  const checkNewPage = (requiredHeight: number) => {
    if (y + requiredHeight > pageHeight - margin - 10) { // Added buffer of 10mm
      doc.addPage();
      y = margin;
      // Set background for new page
      doc.setFillColor(colors.background);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      return true; // Return true if new page was added
    }
    return false; // Return false if no new page was needed
  };

  // Personal Information Section
  const personalInfoHeight = 70;
  checkNewPage(personalInfoHeight);
  
  doc.setFontSize(16);
  doc.setFont("Inter", "bold");
  doc.setTextColor(colors.textPrimary);
  doc.text('Personal Information', margin + 2, y);
  y += 10;

  doc.setFontSize(10);
  const leftColumnX = margin + 2;
  const rightColumnX = margin + 90;

  doc.setFont("Inter", "normal");
  doc.setTextColor(colors.textSecondary);
  doc.text('First Name', leftColumnX, y);
  doc.setFont("Inter", "bold");
  doc.setTextColor(colors.textPrimary);
  doc.text(getValueOrNA(this.officerObj.firstNameEnglish), leftColumnX, y + 7);
  doc.setFont("Inter", "normal");
  doc.setTextColor(colors.textSecondary);
  doc.text('NIC Number', leftColumnX, y + 21);
  doc.setFont("Inter", "bold");
  doc.setTextColor(colors.textPrimary);
  doc.text(getValueOrNA(this.officerObj.nic), leftColumnX, y + 28);
  doc.setFont("Inter", "normal");
  doc.setTextColor(colors.textSecondary);
  doc.text('Mobile Number - 1', leftColumnX, y + 42);
  doc.setFont("Inter", "bold");
  doc.setTextColor(colors.textPrimary);
  doc.text(
    this.officerObj.phoneNumber01
      ? `${getValueOrNA(this.officerObj.phoneCode01)} ${getValueOrNA(this.officerObj.phoneNumber01)}`
      : 'N/A',
    leftColumnX,
    y + 49
  );

  doc.setFont("Inter", "normal");
  doc.setTextColor(colors.textSecondary);
  doc.text('Last Name', rightColumnX, y);
  doc.setFont("Inter", "bold");
  doc.setTextColor(colors.textPrimary);
  doc.text(getValueOrNA(this.officerObj.lastNameEnglish), rightColumnX, y + 7);
  doc.setFont("Inter", "normal");
  doc.setTextColor(colors.textSecondary);
  doc.text('Email', rightColumnX, y + 21);
  doc.setFont("Inter", "bold");
  doc.setTextColor(colors.textPrimary);
  doc.text(getValueOrNA(this.officerObj.email), rightColumnX, y + 28);
  doc.setFont("Inter", "normal");
  doc.setTextColor(colors.textSecondary);
  doc.text('Mobile Number - 2', rightColumnX, y + 42);
  doc.setFont("Inter", "bold");
  doc.setTextColor(colors.textPrimary);
  doc.text(
    this.officerObj.phoneNumber02
      ? `${getValueOrNA(this.officerObj.phoneCode02)} ${getValueOrNA(this.officerObj.phoneNumber02)}`
      : '-',
    rightColumnX,
    y + 49
  );

  y += 70;

  // Address Details Section
  const addressDetailsHeight = 70;
  checkNewPage(addressDetailsHeight);
  
  doc.setFontSize(16);
  doc.setFont("Inter", "bold");
  doc.setTextColor(colors.textPrimary);
  doc.text('Address Details', margin + 2, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont("Inter", "normal");
  doc.setTextColor(colors.textSecondary);
  doc.text('House / Plot Number', leftColumnX, y);
  doc.setFont("Inter", "bold");
  doc.setTextColor(colors.textPrimary);
  doc.text(getValueOrNA(this.officerObj.houseNumber), leftColumnX, y + 7);
  doc.setFont("Inter", "normal");
  doc.setTextColor(colors.textSecondary);
  doc.text('City', leftColumnX, y + 21);
  doc.setFont("Inter", "bold");
  doc.setTextColor(colors.textPrimary);
  doc.text(getValueOrNA(this.officerObj.city), leftColumnX, y + 28);
  doc.setFont("Inter", "normal");
  doc.setTextColor(colors.textSecondary);
  doc.text('Province', leftColumnX, y + 42);
  doc.setFont("Inter", "bold");
  doc.setTextColor(colors.textPrimary);
  doc.text(getValueOrNA(this.officerObj.province), leftColumnX, y + 49);

  doc.setFont("Inter", "normal");
  doc.setTextColor(colors.textSecondary);
  doc.text('Street Name', rightColumnX, y);
  doc.setFont("Inter", "bold");
  doc.setTextColor(colors.textPrimary);
  doc.text(getValueOrNA(this.officerObj.streetName), rightColumnX, y + 7);
  doc.setFont("Inter", "normal");
  doc.setTextColor(colors.textSecondary);
  doc.text('Country', rightColumnX, y + 21);
  doc.setFont("Inter", "bold");
  doc.setTextColor(colors.textPrimary);
  doc.text(getValueOrNA(this.officerObj.country), rightColumnX, y + 28);
  doc.setFont("Inter", "normal");
  doc.setTextColor(colors.textSecondary);
  doc.text('District', rightColumnX, y + 42);
  doc.setFont("Inter", "bold");
  doc.setTextColor(colors.textPrimary);
  doc.text(getValueOrNA(this.officerObj.district), rightColumnX, y + 49);

  y += 70;

  // Bank Details Section
  const bankDetailsHeight = 50;
  checkNewPage(bankDetailsHeight);
  
  doc.setFontSize(16);
  doc.setFont("Inter", "bold");
  doc.setTextColor(colors.textPrimary);
  doc.text('Bank Details', margin + 2, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont("Inter", "normal");
  doc.setTextColor(colors.textSecondary);
  doc.text("Account Holder's Name", leftColumnX, y);
  doc.setFont("Inter", "bold");
  doc.setTextColor(colors.textPrimary);
  doc.text(getValueOrNA(this.officerObj.accHolderName), leftColumnX, y + 7);
  doc.setFont("Inter", "normal");
  doc.setTextColor(colors.textSecondary);
  doc.text('Bank Name', leftColumnX, y + 21);
  doc.setFont("Inter", "bold");
  doc.setTextColor(colors.textPrimary);
  doc.text(getValueOrNA(this.officerObj.bankName), leftColumnX, y + 28);

  doc.setFont("Inter", "normal");
  doc.setTextColor(colors.textSecondary);
  doc.text('Account Number', rightColumnX, y);
  doc.setFont("Inter", "bold");
  doc.setTextColor(colors.textPrimary);
  doc.text(getValueOrNA(this.officerObj.accNumber), rightColumnX, y + 7);
  doc.setFont("Inter", "normal");
  doc.setTextColor(colors.textSecondary);
  doc.text('Branch Name', rightColumnX, y + 21);
  doc.setFont("Inter", "bold");
  doc.setTextColor(colors.textPrimary);
  doc.text(getValueOrNA(this.officerObj.branchName), rightColumnX, y + 28);

  y += 50;

  // Footer - ALWAYS on first page, no page break check
  // Simply place it at the bottom of the first page
  doc.setFontSize(10);
  doc.setFont("Inter", "normal");
  doc.setTextColor(colors.footerText);
  doc.text(
    `This report is generated on ${new Date().toLocaleDateString()}, at ${new Date().toLocaleTimeString()}.`,
    margin,
    pageHeight - margin
  );

  // Save PDF
  const fileName = `${getValueOrNA(empCodeText)} - ${getValueOrNA(this.officerObj.firstNameEnglish)} ${getValueOrNA(this.officerObj.lastNameEnglish)}.pdf`;
  doc.save(fileName);
  this.isGeneratingPDF = false;
}

  confirmDisclaim(id: number) {
    this.collectionOfficerService.disclaimOfficer(id).subscribe(
      (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Officer Disclaimed successfully!',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          },
        });

        this.showDisclaimView = false;
        this.location.back();
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to Disclaim the Officer!',
          confirmButtonText: 'Try Again',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          },
        });
      }
    );
  }

  cancelDisclaim() {
    this.showDisclaimView = false;
  }

  toggleDisclaimView() {
    this.showDisclaimView = !this.showDisclaimView;
  }

  isAgroworldCompany(): boolean {
    return (
      this.officerObj.companyNameEnglish?.toLowerCase() ===
        'polygon holdings private limited' && this.officerObj.status === 'Approved'
    );
  }
}

class CollectionOfficer {
  id!: number;
  firstNameEnglish!: string;
  lastNameEnglish!: string;
  phoneNumber01!: string;
  phoneNumber02!: string;
  phoneCode01!: string;
  phoneCode02!: string;
  image!: string;
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
  companyNameEnglish!: string;
  centerName!: string;
  status!: string;
  claimStatus!: number;
  licNo?: number;
  licFrontImg?: string;
  licBackImg?: string;
  insNo?: number;
  insFrontImg?: string;
  insBackImg?: string;
  vRegNo?: string;
  vType?: string;
  vCapacity?: number;
  vehFrontImg?: string;
  vehBackImg?: string;
  vehSideImgA?: string;
  vehSideImgB?: string;
  distributedCenterName!: string;
  fullEmpId!: string;
  centerRegCode!: string;
}