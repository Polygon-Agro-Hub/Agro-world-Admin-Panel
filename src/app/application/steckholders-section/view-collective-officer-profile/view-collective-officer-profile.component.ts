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
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';

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
  urlSegment: string = '';

  constructor(
    private route: ActivatedRoute,
    private collectionService: CollectionService,
    private collectionOfficerService: CollectionOfficerService,
    private router: Router,
    private location: Location,
    public tokenService: TokenService,
    public permissionService: PermissionService,
  ) { }

  ngOnInit(): void {
    this.officerId = this.route.snapshot.params['id'];
    this.fetchOfficerById(this.officerId);
    this.urlSegment = this.router.url.split('/').filter(segment => segment.length > 0)[0];

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

        console.log('officerObj', this.officerObj)

        this.officerObj.claimStatus = this.officerObj.claimStatus;
        this.getRoleHeading();
      });

  }


  goBack() {
      window.history.back();
    }

  deleteFieldOfficer(id: number) {
    // Show confirmation dialog before deleting
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.collectionService.deleteOfficer(id).subscribe(
          (response) => {
            this.isLoading = false;
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Officer has been deleted successfully.',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold',
              },
            }).then(() => {
              // Navigate back or to a different page after deletion
              this.router.navigate(['/steckholders/action/collective-officer']);
            });
          },
          (error) => {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'Failed to delete officer. Please try again.',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold',
              },
            });
          }
        );
      }
    });
  }

  editFieldOfficer(id: number) {
    // Navigate to edit page with the officer ID
    this.router.navigate([`/steckholders/action/view-distribution-officers/update-distribution-officer/${id}`]);
  }

  viewOfficerTarget(officerId: number) {
    this.router.navigate([
      `/steckholders/action/collective-officer/view-officer-targets/${officerId}`,
    ]);
  }

  async generatePDF() {
    this.isGeneratingPDF = true;

    const iconBase64 = 'data:image/png;base64,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';
    // Initialize jsPDF with A4 size
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Detect dark mode
    const isDarkMode = document.documentElement.classList.contains('dark');
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

    if (this.officerObj.distributedCenterRegCode) {
      doc.setFont("Inter", "normal");
      doc.setTextColor(colors.textSecondary);
      doc.text(getValueOrNA(this.officerObj.distributedCenterRegCode), detailsX, y + 10);
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

    // Driving Details Section
    const driverDetailsHeight = 50;
    checkNewPage(driverDetailsHeight);

    doc.setFontSize(16);
    doc.setFont("Inter", "bold");
    doc.setTextColor(colors.textPrimary);
    doc.text('Driving Details', margin + 2, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont("Inter", "normal");
    doc.setTextColor(colors.textSecondary);
    doc.text("Driving License ID", leftColumnX, y);
    doc.setFont("Inter", "bold");
    doc.setTextColor(colors.textPrimary);
    doc.text(getValueOrNA(String(this.officerObj.licNo)), leftColumnX, y + 7);
    doc.setFont("Inter", "normal");
    doc.setTextColor(colors.textSecondary);
    doc.text("License's Front Image", leftColumnX, y + 21);

    doc.addImage(iconBase64, 'PNG', leftColumnX, y + 24, 9, 9);

    if (this.officerObj.licFrontImg) {
      doc.link(leftColumnX, y + 24, 9, 9, { url: this.officerObj.licFrontImg });
    }


    //  doc.setFont("Inter", "normal");
    //  doc.setTextColor(colors.textSecondary);
    //  doc.text('Account Number', rightColumnX, y);
    //  doc.setFont("Inter", "bold");
    //  doc.setTextColor(colors.textPrimary);
    //  doc.text(getValueOrNA(this.officerObj.accNumber), rightColumnX, y + 7);
    doc.setFont("Inter", "normal");
    doc.setTextColor(colors.textSecondary);
    doc.text("License's Back Image", rightColumnX, y + 21);
    doc.addImage(iconBase64, 'PNG', rightColumnX, y + 24, 9, 9);

    if (this.officerObj.licBackImg) {
      doc.link(rightColumnX, y + 24, 9, 9, { url: this.officerObj.licBackImg });
    }

    y += 50;

    // Driving Details Section
    const insuerenceDetailsHeight = 50;
    checkNewPage(insuerenceDetailsHeight);

    doc.setFontSize(16);
    doc.setFont("Inter", "bold");
    doc.setTextColor(colors.textPrimary);
    doc.text('Vehicle Insurance Details', margin + 2, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont("Inter", "normal");
    doc.setTextColor(colors.textSecondary);
    doc.text("Vehicle Insurance Number", leftColumnX, y);
    doc.setFont("Inter", "bold");
    doc.setTextColor(colors.textPrimary);
    doc.text(getValueOrNA(String(this.officerObj.insNo)), leftColumnX, y + 7);
    doc.setFont("Inter", "normal");
    doc.setTextColor(colors.textSecondary);
    doc.text("Insurance's Front Image", leftColumnX, y + 21);

    doc.addImage(iconBase64, 'PNG', leftColumnX, y + 24, 9, 9);

    if (this.officerObj.insFrontImg) {
      doc.link(leftColumnX, y + 24, 9, 9, { url: this.officerObj.insFrontImg });
    }


    doc.setFont("Inter", "normal");
    doc.setTextColor(colors.textSecondary);
    doc.text('Insurance Expire Date', rightColumnX, y);
    doc.setFont("Inter", "bold");
    doc.setTextColor(colors.textPrimary);
    doc.text(getValueOrNA(String(this.officerObj.insExpDate.split("T")[0])), rightColumnX, y + 7);
    doc.setFont("Inter", "normal");
    doc.setTextColor(colors.textSecondary);
    doc.text("Insurance's Back Image", rightColumnX, y + 21);
    doc.addImage(iconBase64, 'PNG', rightColumnX, y + 24, 9, 9);

    if (this.officerObj.insBackImg) {
      doc.link(rightColumnX, y + 24, 9, 9, { url: this.officerObj.insBackImg });
    }

    y += 50;

    // Driving Details Section
    const vehicleDetailsHeight = 100;
    checkNewPage(vehicleDetailsHeight);

    doc.setFontSize(16);
    doc.setFont("Inter", "bold");
    doc.setTextColor(colors.textPrimary);
    doc.text('Vehicle Details', margin + 2, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont("Inter", "normal");
    doc.setTextColor(colors.textSecondary);
    doc.text("Vehicle Registration Number", leftColumnX, y);
    doc.setFont("Inter", "bold");
    doc.setTextColor(colors.textPrimary);
    doc.text(getValueOrNA(String(this.officerObj.vRegNo)), leftColumnX, y + 7);
    doc.setFont("Inter", "normal");
    doc.setTextColor(colors.textSecondary);
    doc.text("Vehicle Type", leftColumnX, y + 21);
    doc.setFont("Inter", "bold");
    doc.setTextColor(colors.textPrimary);
    doc.text(getValueOrNA(String(this.officerObj.vType)), leftColumnX, y + 28);

    doc.setFontSize(10);
    doc.setFont("Inter", "normal");
    doc.setTextColor(colors.textSecondary);
    doc.text("Vehicle’s Front Image", leftColumnX, y + 44);

    doc.addImage(iconBase64, 'PNG', leftColumnX, y + 48, 9, 9);

    if (this.officerObj.vehFrontImg) {
      doc.link(leftColumnX, y + 48, 9, 9, { url: this.officerObj.vehFrontImg });
    }

    doc.setFont("Inter", "normal");
    doc.setTextColor(colors.textSecondary);
    doc.text("Vehicle’s Side Image - 1", leftColumnX, y + 70);

    doc.addImage(iconBase64, 'PNG', leftColumnX, y + 74, 9, 9);

    if (this.officerObj.vehSideImgA) {
      doc.link(leftColumnX, y + 74, 9, 9, { url: this.officerObj.vehSideImgA });
    }


    doc.setFontSize(10);
    doc.setFont("Inter", "normal");
    doc.setTextColor(colors.textSecondary);
    doc.text("Vehicle’s Back Image", rightColumnX, y + 44);

    doc.addImage(iconBase64, 'PNG', rightColumnX, y + 48, 9, 9);

    if (this.officerObj.vehBackImg) {
      doc.link(rightColumnX, y + 48, 9, 9, { url: this.officerObj.vehBackImg });
    }

    doc.setFont("Inter", "normal");
    doc.setTextColor(colors.textSecondary);
    doc.text("Vehicle’s Side Image - 2", rightColumnX, y + 70);

    doc.addImage(iconBase64, 'PNG', rightColumnX, y + 74, 9, 9);

    if (this.officerObj.vehSideImgB) {
      doc.link(rightColumnX, y + 74, 9, 9, { url: this.officerObj.vehSideImgB });
    }

    //  doc.setFont("Inter", "normal");
    //  doc.setTextColor(colors.textSecondary);
    //  doc.text('Vehicle Capacity', rightColumnX, y);
    //  doc.setFont("Inter", "bold");
    //  doc.setTextColor(colors.textPrimary);
    //  doc.text(getValueOrNA(String(this.officerObj.vCapacity)), rightColumnX, y + 7);
    //  doc.setFont("Inter", "normal");
    //  doc.setTextColor(colors.textSecondary);
    //  doc.text("Vehicle Capacity", rightColumnX, y + 21);
    //  doc.setFont("Inter", "bold");
    //  doc.setTextColor(colors.textPrimary);
    //  doc.text(getValueOrNA(String(this.officerObj.vCapacity)), rightColumnX, y + 28);




    doc.setFont("Inter", "normal");
    doc.setTextColor(colors.textSecondary);
    doc.text('Insurance Expire Date', rightColumnX, y + 21);
    doc.setFont("Inter", "bold");
    doc.setTextColor(colors.textPrimary);
    doc.text(getValueOrNA(String(this.officerObj.insExpDate.split("T")[0])), rightColumnX, y + 28);
    //  doc.setFont("Inter", "normal");
    //  doc.setTextColor(colors.textSecondary);
    //  doc.text("Insurance's Back Image", rightColumnX, y + 21);
    //  doc.addImage(iconBase64, 'PNG', rightColumnX, y + 24, 9, 9);

    //     if (this.officerObj.insBackImg) {
    //       doc.link(rightColumnX, y + 24, 9, 9, { url: this.officerObj.insBackImg });
    //     }

    y += 100;

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
  distributedCenterRegCode!: string;
  fullEmpId!: string;
  centerRegCode!: string;
  insExpDate!: string;
}