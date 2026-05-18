import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StakeholderService } from '../../../services/stakeholder/stakeholder.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';

@Component({
  selector: 'app-govi-shop-preview-shop',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './govi-shop-preview-shop.component.html',
  styleUrl: './govi-shop-preview-shop.component.css'
})
export class GoviShopPreviewShopComponent {
  officerObj: GoViShop = new GoViShop();
  shopId!: number;
  showDisclaimView = false;
  isLoading = false;
  empHeader: string = '';
  isGeneratingPDF = false;
  urlSegment: string = '';

  isModalOpen = false;
  modalTitle = '';
  modalImage = '';
  scale = 1;
  
  // Pan functionality
  isPanning = false;
  startX = 0;
  startY = 0;
  translateX = 0;
  translateY = 0;

  watermarkTiles = Array(20).fill(null);

  approveView: boolean = false;
  rejectView: boolean = false;

  isRejectPopUp: boolean = false;
  text: string = ''
  textAreaTouched: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private goviShopService: StakeholderService,
    private router: Router,
    private location: Location,
    public tokenService: TokenService,
    public permissionService: PermissionService,
  ) { }

  ngOnInit(): void {
    this.scrollToTop();
    this.shopId = this.route.snapshot.params['id'];
    const segments = this.router.url
    .split('/')
    .filter(segment => segment.length > 0);

    this.urlSegment = segments[segments.length - 3];
    this.fetchShopById(this.shopId);
    console.log('urlSegment', this.urlSegment)
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Use 'auto' for instant scroll
    });
  }

  fetchShopById(id: number) {
    this.isLoading = true;
    this.goviShopService
      .getShopById(id)
      .subscribe((res: any) => {
        console.log("this is data", res);

        this.isLoading = false;
        this.officerObj = res.data;

        console.log('officerObj', this.officerObj)
      });

  }

  goBack() {
    this.location.back();
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

  cancelDisclaim() {
    this.showDisclaimView = false;
  }

  toggleDisclaimView() {
    this.showDisclaimView = !this.showDisclaimView;
  }

  // deleteOfficer(jobRole: string) {
  //   const token = this.tokenService.getToken();
  //   if (!token) return;

  //   Swal.fire({
  //     title: 'Are you sure?',
  //     text: `Do you really want to delete this ${jobRole}? This action cannot be undone.`,
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'Yes, delete it!',
  //     cancelButtonText: 'Cancel',
  //     customClass: {
  //       popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
  //       title: 'font-semibold',
  //       confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700',
  //       cancelButton: 'bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 ml-2'
  //     },
  //     buttonsStyling: false, // let Tailwind handle button styling
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       this.isLoading = true;
  //       this.collectionService.deleteOfficer(this.officerId).subscribe(
  //         (data) => {
  //           this.isLoading = false;
  //           if (data.status) {
  //             Swal.fire({
  //               icon: 'success',
  //               title: 'Deleted!',
  //               text: `The ${jobRole} has been deleted.`,
  //               customClass: {
  //                 popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
  //                 title: 'font-semibold',
  //                 confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
  //               },
  //               buttonsStyling: false
  //             });
  //             this.location.back();
  //           } else {
  //             Swal.fire({
  //               icon: 'error',
  //               title: 'Error!',
  //               text: `There was an error deleting the ${jobRole}.`,
  //               customClass: {
  //                 popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
  //                 title: 'font-semibold',
  //                 confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
  //               },
  //               buttonsStyling: false
  //             });
  //           }
  //         },
  //         () => {
  //           this.isLoading = false;
  //           Swal.fire({
  //             icon: 'error',
  //             title: 'Error!',
  //             text: `There was an error deleting the ${jobRole}.`,
  //             customClass: {
  //               popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
  //               title: 'font-semibold',
  //               confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
  //             },
  //             buttonsStyling: false
  //           });
  //         }
  //       );
  //     }
  //   });
  // }

  editOfficer() {
    // if (jobRole === 'Driver') {
    //   // this.router.navigate([`/steckholders/action/drivers/edit-driver/${id}`]);
    // }
  }

  deleteOfficer() {

  }
  
  openModal(logo: string): void {
    // if (!this.idInfo) return;
    this.isLoading = true;

    this.scale = 1;
    this.isModalOpen = true;

    if (this.officerObj.shopType === 'No Formal Registration (Request NIC)') {
      this.modalTitle = 'NIC Front & Back Images';
    } else {
      this.modalTitle = 'BR Image';
    }

    
    this.modalImage = logo
    this.isLoading = false;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.modalImage = '';
    this.scale = 1;
    this.resetPan();
  }

  zoomIn(): void {
    this.scale += 0.1;
  }

  zoomOut(): void {
    if (this.scale > 0.5) {
      this.scale -= 0.1;
    }
  }

  // Pan (drag) functionality
  onMouseDown(event: MouseEvent): void {
    if (this.scale > 1) {
      this.isPanning = true;
      this.startX = event.clientX - this.translateX;
      this.startY = event.clientY - this.translateY;
      event.preventDefault();
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (this.isPanning && this.scale > 1) {
      this.translateX = event.clientX - this.startX;
      this.translateY = event.clientY - this.startY;
    }
  }

  onMouseUp(): void {
    this.isPanning = false;
  }

  onMouseLeave(): void {
    this.isPanning = false;
  }

  resetPan(): void {
    this.translateX = 0;
    this.translateY = 0;
    this.isPanning = false;
  }

  getImageTransform(): string {
    return `scale(${this.scale}) translate(${this.translateX / this.scale}px, ${this.translateY / this.scale}px)`;
  }

  openApproveView() {
    this.approveView = true;
  }

  openRejectView() {
    this.rejectView = true;
  }

  closeApproveView() {
    this.approveView = false;
  }

  closeRejectView() {
    this.rejectView = false;
    this.textAreaTouched = false;
    this.text='';
  }

  confirmApprove(): void {
    this.isLoading = true;
    this.approveView = false;
    this.goviShopService
      .approveGoviShop(this.shopId)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            Swal.fire({
              title: 'Success!',
              text: 'GoViShop Approved successfully',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: 'bg-white dark:bg-tileBlack text-black dark:text-white rounded-lg pt-2',
                title: 'font-semibold text-lg',
                confirmButton: 'px-6 py-2 rounded-md',
                cancelButton: 'px-6 py-2 rounded-md',
              },
            }).then(() => {
              this.fetchShopById(this.shopId);
            });
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error Approving GoViShop:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to Approve GoViShop',
            icon: 'error',
            confirmButtonColor: '#C40D0D',
            customClass: {
              popup: 'bg-white dark:bg-tileBlack text-black dark:text-white rounded-lg pt-2',
              title: 'font-semibold text-lg',
              confirmButton: 'px-6 py-2 rounded-md',
              cancelButton: 'px-6 py-2 rounded-md',
            },
          });
        },
      });
  }

  confirmReject(): void {
    this.textAreaTouched = true;

    if (!this.text) {
      return;
    }
    this.rejectView = false;
    this.isLoading = true;
    this.goviShopService
      .rejectGoviShop(this.shopId, this.text)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.status) {
            Swal.fire({
              title: 'Success!',
              text: 'GoViShop rejected successfully',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: 'bg-white dark:bg-tileBlack text-black dark:text-white rounded-lg pt-2',
                title: 'font-semibold text-lg',
                confirmButton: 'px-6 py-2 rounded-md',
                cancelButton: 'px-6 py-2 rounded-md',
              }, 
            }).then(() => {
              this.fetchShopById(this.shopId);
            });
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error rejecting GoViShop:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to reject GoViShop',
            icon: 'error',
            confirmButtonColor: '#C40D0D',
            customClass: {
              popup: 'bg-white dark:bg-tileBlack text-black dark:text-white rounded-lg pt-2',
              title: 'font-semibold text-lg',
              confirmButton: 'px-6 py-2 rounded-md',
              cancelButton: 'px-6 py-2 rounded-md',
            },
          });

          this.rejectView = false;
        },
      });
  }

  onTextareaClick() {
    this.textAreaTouched = true;
  }

  // confirmDisclaim(id: number) {
  //   this.collectionOfficerService.disclaimOfficer(id).subscribe(
  //     (response) => {
  //       Swal.fire({
  //         icon: 'success',
  //         title: 'Success',
  //         text: 'Officer Disclaimed successfully!',
  //         confirmButtonText: 'OK',
  //         customClass: {
  //           popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
  //           title: 'font-semibold',
  //         },
  //       });

  //       this.showDisclaimView = false;
  //       this.location.back();
  //     },
  //     (error) => {
  //       Swal.fire({
  //         icon: 'error',
  //         title: 'Error',
  //         text: 'Failed to Disclaim the Officer!',
  //         confirmButtonText: 'Try Again',
  //         customClass: {
  //           popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
  //           title: 'font-semibold',
  //         },
  //       });
  //     }
  //   );
  // }


  // async generatePDF() {
  //   this.isGeneratingPDF = true;

  //   const iconBase64 = 'data:image/png;base64,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';
  //   // Initialize jsPDF with A4 size
  //   const doc = new jsPDF('p', 'mm', 'a4');
  //   const margin = 10;
  //   const pageWidth = doc.internal.pageSize.getWidth();
  //   const pageHeight = doc.internal.pageSize.getHeight();

  //   // Detect dark mode
  //   const isDarkMode = document.documentElement.classList.contains('dark');

  //   // Define colors based on theme
  //   const colors = {
  //     background: '#FFFFFF',
  //     textPrimary: isDarkMode ? '#ffffff' : '#030308',
  //     textSecondary: isDarkMode ? '#cccccc' : '#000000',
  //     border: '#F5F5F5',
  //     footerText: '#646464',
  //   };

  //   // Set white background for the entire page
  //   doc.setFillColor(colors.background);
  //   doc.rect(0, 0, pageWidth, pageHeight, 'F');

  //   // Helper function to check for empty, null, or undefined values
  //   const getValueOrNA = (value: string | null | undefined): string => {
  //     return value ? value : 'N/A';
  //   };

  //   const getValueOrNAforInsOrLiscNo = (value: number | null | undefined): string => {
  //     return value !== null && value !== undefined ? value.toString() : 'N/A';
  //   };

  //   function loadImageAsBase64(url: string): Promise<string> {
  //     return new Promise((resolve, reject) => {
  //       const xhr = new XMLHttpRequest();
  //       xhr.onload = function () {
  //         const reader = new FileReader();
  //         reader.onloadend = function () {
  //           resolve(reader.result as string);
  //         };
  //         reader.readAsDataURL(xhr.response);
  //       };
  //       xhr.onerror = function () {
  //         const img = new Image();
  //         img.crossOrigin = 'Anonymous';
  //         img.onload = function () {
  //           const canvas = document.createElement('canvas');
  //           const ctx = canvas.getContext('2d');
  //           canvas.width = img.width;
  //           canvas.height = img.height;
  //           ctx?.drawImage(img, 0, 0);
  //           resolve(canvas.toDataURL('image/png'));
  //         };
  //         img.onerror = function () {
  //           resolve('');
  //         };
  //         img.src = url;
  //       };
  //       xhr.open('GET', url);
  //       xhr.responseType = 'blob';
  //       xhr.setRequestHeader('Accept', 'image/png;image/*');
  //       try {
  //         xhr.send();
  //       } catch (error) {
  //         reject(error);
  //       }
  //     });
  //   }

  //   const hasImage = !!this.officerObj.image;

  //   if (hasImage) {
  //     const appendCacheBuster = (url: string) => {
  //       if (!url) return '';
  //       const separator = url.includes('?') ? '&' : '?';
  //       return `${url}${separator}t=${new Date().getTime()}`;
  //     };

  //     const img = new Image();
  //     const modifiedFarmerUrl = appendCacheBuster(this.officerObj.image);
  //     img.src = await loadImageAsBase64(modifiedFarmerUrl);

  //     doc.saveGraphicsState();
  //     doc.addImage(img, 'JPEG', 14, 10, 40, 40);
  //     doc.restoreGraphicsState();
  //   }

  //   // Adjust starting positions based on image presence
  //   const startX = hasImage ? 60 : 14;
  //   const startY = hasImage ? 60 : 50;

  //   // Fix for the top section border (image and basic info)
  //   const imageboxX = 10;
  //   const imageboxY = 8; // Start from top margin
  //   const imageboxWidth = 190;
  //   const imageboxHeight = hasImage ? 44 : 30; // Adjust height based on image presence
    
  //   // Draw rounded border for top section
  //   doc.setDrawColor(241, 247, 250);
  //   doc.setLineWidth(0.5);
  //   doc.roundedRect(imageboxX, imageboxY, imageboxWidth, imageboxHeight, 3, 3, "S");

  //   // Title - Personal Information
  //   doc.setFontSize(16);
  //   doc.setFont("Inter", "bold");
    
  //   // Fix for Personal Information section border
  //   const personalboxX = 10;
  //   const personalboxY = startY - 6;
  //   const personalboxWidth = 190;
  //   const personalboxHeight = 57; // Fixed height for personal info section
    
  //   // Draw rounded border for personal info section
  //   doc.setDrawColor(241, 247, 250);
  //   doc.setLineWidth(0.5);
  //   doc.roundedRect(personalboxX, personalboxY, personalboxWidth, personalboxHeight, 3, 3, "S");

  //   doc.text("Personal Information", 14, startY);

  //   // Name and position info - position adjusted based on image presence
  //   doc.setFontSize(12);
  //   doc.setFont("Inter", "bold");
  //   doc.text(getValueOrNA(this.officerObj.firstNameEnglish) + ' ' + getValueOrNA(this.officerObj.lastNameEnglish), startX, 15);

  //   let empType = '';
  //   let empCode = '';

  //   switch (this.officerObj.jobRole) {
  //     case 'Customer Officer':
  //       empType = 'Customer Officer';
  //       empCode = 'CUO';
  //       break;
  //     case 'Collection Centre Manager':
  //       empType = 'Collection Centre Manager';
  //       empCode = 'CCM';
  //       break;
  //     case 'Collection Centre Head':
  //       empType = 'Collection Centre Head';
  //       empCode = 'CCH';
  //       break;
  //     case 'Collection Officer':
  //       empType = 'Collection Officer';
  //       empCode = 'COO';
  //       break;
  //     case 'Driver':
  //       empType = 'Driver';
  //       empCode = 'DVR'; 
  //       break;
  //     case 'Distribution Centre Head':
  //       empType = 'Distribution Centre Head';
  //       empCode = 'DCH';
  //       break;
  //     case 'Distribution Centre Manager':
  //       empType = 'Distribution Centre Manager';
  //       empCode = 'DCM';
  //       break;
  //     case 'Distribution Officer':
  //       empType = 'Distribution Officer';
  //       empCode = 'DIO';
  //       break;
  //   }

  //   // Ensure empCode and empId exist
  //   let empId = this.officerObj.empId || '';
  //   let empCodeText = empCode ? `${empCode}${empId}` : empId;

  //   // Set font and print empTypeText
  //   doc.setFont("Inter", "normal");
  //   let empTypeText = `${getValueOrNA(empType)} - `;
  //   doc.text(empTypeText, startX, 22);

  //   // Measure the width of empTypeText for proper alignment
  //   let textWidth = doc.getTextWidth(empTypeText);

  //   // Apply bold font for empCode + empId and print it right after empTypeText
  //   doc.setFont("Inter", "bold");
  //   doc.text(getValueOrNA(empCodeText), startX + textWidth, 22);

  //   // Generate center text
  //   let centerText = 'Officer has been disclaimed - No Assigned Centre';

  //   const ccRoles = [
  //     'Collection Centre Manager',
  //     'Collection Centre Head',
  //     'Collection Officer',
  //     'Customer Officer'
  //   ];

  //   const dcRoles = [
  //     'Distribution Centre Manager',
  //     'Distribution Centre Head',
  //     'Distribution Officer',
  //     'Driver'
  //   ];

  //   if (ccRoles.includes(this.officerObj.jobRole)) {
  //     if (this.officerObj.centerRegCode) {
  //       centerText = `${this.officerObj.centerRegCode} Centre`;
  //     }
  //   } else if (dcRoles.includes(this.officerObj.jobRole)) {
  //     if (this.officerObj.distributedCenterRegCode) {
  //       centerText = `${this.officerObj.distributedCenterRegCode} Centre`;
  //     }
  //   }

  //   // Apply text in PDF
  //   doc.text(centerText, startX, 29);
  //   doc.setFont("Inter", "normal");

  //   doc.text(getValueOrNA(this.officerObj.companyNameEnglish), startX, 36);

  //   doc.text(getValueOrNA(this.officerObj.companyNameEnglish), startX, 36);
  
  //   doc.setFontSize(12);
  //   doc.setFont("Inter", "normal");

  //   // First Name
  //   doc.text("First Name", 14, startY + 10);
  //   doc.setFont("Inter", "bold");
  //   doc.text(getValueOrNA(this.officerObj.firstNameEnglish), 14, startY + 16);

  //   // Last Name
  //   doc.setFont("Inter", "normal");
  //   doc.text("Last Name", 100, startY + 10);
  //   doc.setFont("Inter", "bold");
  //   doc.text(getValueOrNA(this.officerObj.lastNameEnglish), 100, startY + 16);

  //   // NIC Number
  //   doc.setFont("Inter", "normal");
  //   doc.text("NIC Number", 14, startY + 26);
  //   doc.setFont("Inter", "bold");
  //   doc.text(getValueOrNA(this.officerObj.nic), 14, startY + 32);

  //   // Email
  //   doc.setFont("Inter", "normal");
  //   doc.text("Email", 100, startY + 26);
  //   doc.setFont("Inter", "bold");
  //   doc.text(getValueOrNA(this.officerObj.email), 100, startY + 32);

  //   // Phone Number 1
  //   doc.setFont("Inter", "normal");
  //   doc.text("Mobile Number - 1", 14, startY + 42);

  //   if (this.officerObj.phoneNumber01 == null || this.officerObj.phoneNumber01 === "") {
  //     doc.setFont("Inter", "bold");
  //     doc.text("N/A", 14, startY + 48); // Display N/A if phoneNumber01 is null or undefined
  //   } else {
  //     doc.setFont("Inter", "bold");
  //     doc.text(getValueOrNA(this.officerObj.phoneCode01), 14, startY + 48);
  //     doc.text(getValueOrNA(this.officerObj.phoneNumber01), 22, startY + 48);
  //   }

  //   // Phone Number 2
  //   doc.setFont("Inter", "normal");
  //   doc.text("Mobile Number - 2", 100, startY + 42);

  //   // Check if phoneNumber02 is undefined or null
  //   if (this.officerObj.phoneNumber02 == null || this.officerObj.phoneNumber02 === "") {
  //     doc.setFont("Inter", "bold");
  //     doc.text("-", 100, startY + 48); // Display - if phoneNumber02 is null or undefined
  //   } else {
  //     doc.setFont("Inter", "bold");
  //     doc.text(getValueOrNA(this.officerObj.phoneCode02), 100, startY + 48);
  //     doc.text(getValueOrNA(this.officerObj.phoneNumber02), 108, startY + 48);
  //   }

  //   // Address Details Section
  //   doc.setFontSize(16);
  //   doc.setFont("Inter", "bold");

  //   // Box start above the heading
  //   const boxX = 10;
  //   const boxY = startY + 54;
  //   const boxWidth = 190;

  //   // The last Y position after district field
  //   const lastY = startY + 108;
  //   const boxHeight = (lastY + 4) - boxY;

  //   // Draw rounded border first (so it's in background)
  //   doc.setDrawColor(241, 247, 250); // border color #F1F7FA
  //   doc.setLineWidth(0.5);
  //   doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 3, 3, "S");

  //   doc.text("Address Details", 14, startY + 60);

  //   doc.setFontSize(12);
  //   doc.setFont("Inter", "normal");

  //   // House / Plot Number
  //   doc.text("House / Plot Number", 14, startY + 70);
  //   doc.setFont("Inter", "bold");
  //   doc.text(getValueOrNA(this.officerObj.houseNumber), 14, startY + 76);

  //   // Street Name
  //   doc.setFont("Inter", "normal");
  //   doc.text("Street Name", 100, startY + 70);
  //   doc.setFont("Inter", "bold");
  //   doc.text(getValueOrNA(this.officerObj.streetName), 100, startY + 76);

  //   // City
  //   doc.setFont("Inter", "normal");
  //   doc.text("City", 14, startY + 86);
  //   doc.setFont("Inter", "bold");
  //   doc.text(getValueOrNA(this.officerObj.city), 14, startY + 92);

  //   // Country
  //   doc.setFont("Inter", "normal");
  //   doc.text("Country", 100, startY + 86);
  //   doc.setFont("Inter", "bold");
  //   doc.text(getValueOrNA(this.officerObj.country), 100, startY + 92);

  //   // Province
  //   doc.setFont("Inter", "normal");
  //   doc.text("Province", 14, startY + 102);
  //   doc.setFont("Inter", "bold");
  //   doc.text(getValueOrNA(this.officerObj.province), 14, startY + 108);

  //   // District
  //   doc.setFont("Inter", "normal");
  //   doc.text("District", 100, startY + 102);
  //   doc.setFont("Inter", "bold");
  //   doc.text(getValueOrNA(this.officerObj.district), 100, startY + 108);

  //   // Bank Details Section
  //   doc.setFontSize(16);
  //   doc.setFont("Inter", "bold");

  //   const bankBoxX = 10;
  //   const bankBoxY = startY + 114;
  //   const bankBoxWidth = 190;

  //   // Last Y position after Branch Name value
  //   const bankLastY = startY + 152;
  //   const bankBoxHeight = (bankLastY + 4) - bankBoxY;

  //   doc.setDrawColor(241, 247, 250); // border color #F1F7FA
  //   doc.setLineWidth(0.5);
  //   doc.roundedRect(bankBoxX, bankBoxY, bankBoxWidth, bankBoxHeight, 3, 3, "S");

  //   doc.text("Bank Details", 14, startY + 120);

  //   doc.setFontSize(12);
  //   doc.setFont("Inter", "normal");

  //   // Account Holder Name
  //   doc.text("Account Holder's Name", 14, startY + 130);
  //   doc.setFont("Inter", "bold");
  //   doc.text(getValueOrNA(this.officerObj.accHolderName), 14, startY + 136);

  //   // Account Number
  //   doc.setFont("Inter", "normal");
  //   doc.text("Account Number", 100, startY + 130);
  //   doc.setFont("Inter", "bold");
  //   doc.text(getValueOrNA(this.officerObj.accNumber), 100, startY + 136);

  //   // Bank Name
  //   doc.setFont("Inter", "normal");
  //   doc.text("Bank Name", 14, startY + 146);
  //   doc.setFont("Inter", "bold");
  //   doc.text(getValueOrNA(this.officerObj.bankName), 14, startY + 152);

  //   // Branch Name
  //   doc.setFont("Inter", "normal");
  //   doc.text("Branch Name", 100, startY + 146);
  //   doc.setFont("Inter", "bold");
  //   doc.text(getValueOrNA(this.officerObj.branchName), 100, startY + 152);

  //   // Only include driver-related sections if the job role is "Driver"
  //   if (this.officerObj.jobRole === 'Driver') {
      
  //     // Add new page for Driver Details
  //     doc.addPage();
      
  //     // Set background for new page
  //     doc.setFillColor(colors.background);
  //     doc.rect(0, 0, pageWidth, pageHeight, 'F');
      
  //     // Reset Y position for new page
  //     const driverStartY = 10;
      
  //     // Driving Details Section
  //     const DdetailsX = 10;
  //     const DdetailsY = driverStartY;
  //     const DdetailsboxWidth = 190;
  //     const DdetailslastY = driverStartY + 40;
  //     const DdetailsboxHeight = (DdetailslastY + 4) - DdetailsY;

  //     doc.setDrawColor(241, 247, 250);
  //     doc.setLineWidth(0.5);
  //     doc.roundedRect(DdetailsX, DdetailsY, DdetailsboxWidth, DdetailsboxHeight, 3, 3, "S");

  //     doc.setFontSize(16);
  //     doc.setFont("Inter", "bold");
  //     doc.setTextColor(colors.textPrimary);
  //     doc.text("Driver Details", 14, driverStartY + 6);

  //     doc.setFontSize(12);
  //     doc.setFont("Inter", "normal");
  //     doc.text("Driving License ID", 14, driverStartY + 16);

  //     doc.setFont("Inter", "bold");
  //     doc.text(getValueOrNAforInsOrLiscNo(this.officerObj.licNo), 14, driverStartY + 22);

  //     doc.setFontSize(12);
  //     doc.setFont("Inter", "normal");
  //     doc.text("License's Front Image", 14, driverStartY + 32);
  //     doc.addImage(iconBase64, 'PNG', 14, driverStartY + 34, 9, 9);

  //     if (this.officerObj.licFrontImg) {
  //       doc.link(14, driverStartY + 34, 9, 9, { url: this.officerObj.licFrontImg });
  //     }

  //     doc.setFontSize(12);
  //     doc.setFont("Inter", "normal");
  //     doc.text("License's Back Image", 100, driverStartY + 32);
  //     doc.addImage(iconBase64, 'PNG', 100, driverStartY + 34, 9, 9);

  //     if (this.officerObj.licBackImg) {
  //       doc.link(100, driverStartY + 34, 9, 9, { url: this.officerObj.licBackImg });
  //     }

  //     // Vehicle Insurance Details Section
  //     const VidetailsX = 10;
  //     const VidetailsY = driverStartY + 46;
  //     const VidetailsboxWidth = 190;
  //     const VidetailslastY = driverStartY + 90;
  //     const VidetailsboxHeight = (VidetailslastY + 4) - VidetailsY;

  //     doc.setDrawColor(241, 247, 250);
  //     doc.setLineWidth(0.5);
  //     doc.roundedRect(VidetailsX, VidetailsY, VidetailsboxWidth, VidetailsboxHeight, 3, 3, "S");

  //     doc.setFontSize(16);
  //     doc.setFont("Inter", "bold");
  //     doc.text("Vehicle Insurance Details", 14, driverStartY + 54);

  //     doc.setFontSize(12);
  //     doc.setFont("Inter", "normal");
  //     doc.text("Vehicle Insurance Number", 14, driverStartY + 64);

  //     doc.setFont("Inter", "bold");
  //     doc.text(getValueOrNAforInsOrLiscNo(this.officerObj.insNo), 14, driverStartY + 70);

  //     doc.setFontSize(12);
  //     doc.setFont("Inter", "normal");
  //     doc.text("Vehicle Expire Date", 100, driverStartY + 64);

  //     doc.setFont("Inter", "bold");
  //     doc.text(this.officerObj.insExpDate ? this.officerObj.insExpDate.split("T")[0] : 'N/A', 100, driverStartY + 70);

  //     doc.setFontSize(12);
  //     doc.setFont("Inter", "normal");
  //     doc.text("Insurance's Front Image", 14, driverStartY + 80);
  //     doc.addImage(iconBase64, 'PNG', 14, driverStartY + 82, 9, 9);

  //     if (this.officerObj.insFrontImg) {
  //       doc.link(14, driverStartY + 82, 9, 9, { url: this.officerObj.insFrontImg });
  //     }

  //     doc.setFontSize(12);
  //     doc.setFont("Inter", "normal");
  //     doc.text("Insurance's Back Image", 100, driverStartY + 80);
  //     doc.addImage(iconBase64, 'PNG', 100, driverStartY + 82, 9, 9);

  //     if (this.officerObj.insBackImg) {
  //       doc.link(100, driverStartY + 82, 9, 9, { url: this.officerObj.insBackImg });
  //     }

  //     // Vehicle Details Section
  //     const VdetailsX = 10;
  //     const VdetailsY = driverStartY + 96;
  //     const VdetailsboxWidth = 190;
  //     const VdetailslastY = driverStartY + 172;
  //     const VdetailsboxHeight = (VdetailslastY + 4) - VdetailsY;

  //     doc.setDrawColor(241, 247, 250);
  //     doc.setLineWidth(0.5);
  //     doc.roundedRect(VdetailsX, VdetailsY, VdetailsboxWidth, VdetailsboxHeight, 3, 3, "S");

  //     doc.setFontSize(16);
  //     doc.setFont("Inter", "bold");
  //     doc.text("Vehicle Details", 14, driverStartY + 102);

  //     doc.setFontSize(12);
  //     doc.setFont("Inter", "normal");
  //     doc.text("Vehicle Registration Number", 14, driverStartY + 112);

  //     doc.setFont("Inter", "bold");
  //     doc.text(getValueOrNA(this.officerObj.vRegNo), 14, driverStartY + 118);

  //     doc.setFontSize(12);
  //     doc.setFont("Inter", "normal");
  //     doc.text("Vehicle Type", 14, driverStartY + 128);

  //     doc.setFont("Inter", "bold");
  //     doc.text(getValueOrNA(this.officerObj.vType), 14, driverStartY + 134);

  //     doc.setFontSize(12);
  //     doc.setFont("Inter", "normal");
  //     doc.text("Vehicle Capacity", 100, driverStartY + 128);

  //     doc.setFont("Inter", "bold");
  //     let value = getValueOrNA(String(this.officerObj.vCapacity));
  //     doc.text(value === "N/A" ? value : value + " Kg", 100, driverStartY + 134);

  //     doc.setFontSize(12);
  //     doc.setFont("Inter", "normal");
  //     doc.text("Vehicle's Front Image", 14, driverStartY + 144);
  //     doc.addImage(iconBase64, 'PNG', 14, driverStartY + 146, 9, 9);

  //     if (this.officerObj.vehFrontImg) {
  //       doc.link(14, driverStartY + 146, 9, 9, { url: this.officerObj.vehFrontImg });
  //     }

  //     doc.setFontSize(12);
  //     doc.setFont("Inter", "normal");
  //     doc.text("Vehicle's Back Image", 100, driverStartY + 144);
  //     doc.addImage(iconBase64, 'PNG', 100, driverStartY + 146, 9, 9);

  //     if (this.officerObj.vehBackImg) {
  //       doc.link(100, driverStartY + 146, 9, 9, { url: this.officerObj.vehBackImg });
  //     }

  //     doc.setFontSize(12);
  //     doc.setFont("Inter", "normal");
  //     doc.text("Vehicle's Side Image - 1", 14, driverStartY + 162);
  //     doc.addImage(iconBase64, 'PNG', 14, driverStartY + 164, 9, 9);

  //     if (this.officerObj.vehSideImgA) {
  //       doc.link(14, driverStartY + 164, 9, 9, { url: this.officerObj.vehSideImgA });
  //     }

  //     doc.setFontSize(12);
  //     doc.setFont("Inter", "normal");
  //     doc.text("Vehicle's Side Image - 2", 100, driverStartY + 162);
  //     doc.addImage(iconBase64, 'PNG', 100, driverStartY + 164, 9, 9);

  //     if (this.officerObj.vehSideImgB) {
  //       doc.link(100, driverStartY + 164, 9, 9, {
  //         url: this.officerObj.vehSideImgB,
  //         newWindow: true
  //       });
  //     }
  //   }

  //   // Save PDF with footer on last page only at the bottom
  //   const fileName = `${getValueOrNA(empCodeText)} - ${getValueOrNA(this.officerObj.firstNameEnglish)} ${getValueOrNA(this.officerObj.lastNameEnglish)}.pdf`;
  //   doc.save(fileName);
  //   this.isGeneratingPDF = false;
  // }
}

class GoViShop {
  shopId!: number;
  shopName!:string;
  address!:string;
  email!: string;
  shopType!:string;
  mobileNumber!:string;
  updatedAt!:string;
  updatedBy!:string;
  approvedBY!:string;
  approvedAt!:string;
  logo!: string;
  shopTypeImg!: string;
  ownerName!:string;
  nic!:string;
  shopPhone!:string;
  isActive!: number;
  approvedStatus!: string;
}
