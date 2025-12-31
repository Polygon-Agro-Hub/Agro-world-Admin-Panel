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

    const iconBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkAAAAIACAMAAABdHCNoAAAC9FBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///97qzIpAAAA+nRSTlMAAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaW1xdYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzs/Q0dLT1NXW19jZ2tvc3d7g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+BH8VowAAAAFiS0dE+6JqNtwAABUdSURBVHja7Z15fFXlmcfPTUgCCCgQkrCJ0CIWsVrBhU1FtgxCS1tbthmnU7COsg4aBUoAhxkFWQJjoSoqliog0BYtgoKI4IArhm1YxtYIsiUEQgKY5P41IMsIJOSe99xzzvO+7/f7rVecjzzne5bnnOec91zO8wIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAGIi16D522aG3u3vyiKPhMUf7e3LWLnhl6X4uIEfI0+sXMDUdpaxgUbphxfyOt5UnpMWMHfQyX7dO6J+tpT7V/eLGA/kkgf15mNe30aZL1Nzonh71PtdBKn06LSmmaLMre7qONPr0/ol8S2dhLC326bqRVUvmgi3h9Gs6nTZJZ3lT2mdfwQnok/DrjBMFn9Z0+p0Hy+ayDUH0SJ5TRHR0oz0mS6E/627RGF9YKvMPRdR990YcDmcL0SZhcTle0uq44SdS9+uqv0hLdeEXQIJTKtUMNebOmmPGZs3ct2ZQqw5+mO+mFnmxtIsGftO10Qld2pgmYf7bQB41TrFbY/tT4gC7ozNsh3xlLWEIP9OYPCaEKNJkO6M7EMP3J5Pap9pT1CM+fDO5/GcD+0O6sJq6m+iawNpEBCLwwIaTnDxmATBmDOoby/PNnVN4UdlQPQaBR1J1zeS/v7xyh7OZwsmXgAi2i6iaxJPBHoKm5WdwdsEA8g2gYG4L1pw8VN42egQrE+hvG8UGQ/txDvc0jyKuJyym3eSwLzp8W3MQwkLLrAhPoP6i2iUwK7C7YVxTbRPKCeqyjF7U2k6CeTXyJUpvJ88H4k5xPqc0kP5h3fHpQaVO5NxCBZlBoU5kSiEDsn2IsuUH404g6m0tGAAL9kjKby78CECiHMpvLtAAE2kCZzeV9//2JsJmBwRzxf+3W71Flk7nWd4F6U2ST8X8B8qEU2WQe8l2gaRTZZPy/Fr2YIpvMQt8Feo8im8wa3wViVV+j2ey7QHspssnk+S4Qi3IYTb7vApVSZJM57rtApRTZZEoreH5n0KyVu/JPncrftTJnYEPPAoX1f7Z/8YT+tzavm5RUt/mtAya+vp9e+8Ml7U4b+cnF//3jEQ00FOjDkW0uucsXaTOKBR58F6jZsyWXf6J49rV6CVQ49QcVH0rrqUdpuI8CVR9fycBbPC5FH4EOj69b+cHUzeYVI98EarO18k9taa2JQOXPV7EtY4N5bBftj0ADr3i+XdRPC4F2daj6gDrupus+CDS0ihVYykdrINDSa2I5otrsOR5/gUZW/clh0gUqGxHzmuesVxRngQbFMBiU9ZMt0MkBsR/UwFN0Pp4CtYnpfkNRa8kCnezl5qjuw6A4ClR9a2yfzU2RK1BZBzeHNYiTsfgJND7WD4+RK9AIt8c1mt7HS6BmJbF++HgTqQK9xrO24Qn0bOyfzhEq0O6r3R/Y1XvoflwESiuJ/dPFDUQKVN5BZbzvzBgUF4FcbQQ3TKRAz7F2Y4gCfeLm4x9JFOhwqppAaQX037tADd2FRYZAgX6rep9uIv33LtAgd5/vL0+gwrqqAtXj+SDvAs1y9/mZ8gRaynvXYQq0yt3nV8gTqI26QK0RwLNALq+G7BIn0IdeHrj9BAO8CnTY3ecPiRNopBeBuKHhWaCT7j5/UpxAN3oRiBsangU66e7zJ8UJdKMXgW7BAK8Cub9wJEug/Z5W6YscRAHLBVrs7bW1JShguUATvAk0CQUsF6i/N4EGoYDlArX1JtBtKGC5QM28CdQcBSwXyOOuiykogEB6CXTgtcczW6VXr57RKvPx1w4gUNgC1dcqwo7MvOuizdYT755ViEAM0THy1b/VqeDh/sf2IRCn8TFwamqtih+uT8xSBApNoAG6XEjcdlPlR3HrTgTS9FbGk0EV+i9XfHWtzjIECkmg171dS9wWSJ0XxPLQQMIsBNLvcY6EgB7nmFH1gyVzECicB8pu0uCBspdisDxhKQLp90jro4EU+bMaMb2svwuBwhDoIy8CfRpEjY9+P7aDuZkLgXitpwLGx3o4WQjEi4WXsyrmMT9xIwKFINCfRL/aXOhip4gbShAohMUVxot+IHqwm0PKQiBeLLycl2Me8xM3IlAIAn0l+9XmQhc7RdxQgkAhvJ0qepHNacGYkyFmhEDlHVX8uSuIJe6muD2qLATi7dTLWRXzmJ+4EYFCEKhc9KvNhS52irihBIHCWNZpvOhXewe5OMIsBOLFwsvpFvOYn7gRgcIQ6G3ZrzYXutgp4oYSBApDoJIC2a82nwzkYQHNQswIgco7qvhzVxBL3A1xe1RZCOTl7dTjog/oHwPZrGe1wBfSCDFDBIqeclWg9ECqPNjNUWUhkLcdw8aLPiB6sJtjmogCCOThUeD7gthscLXyngJ6hZgRAkWjJ10UqD4pkO3PV6s/6aZXiBkhUPTE0Fg/Pi6QnXoGe3pWW68QM0KgaPT44Nje1+g2NZD1nFa7vIehWYiZI1A0WnB/rK1Imx9IlQunenzGVacQM0igaPThxlVx7aPbd0H9BZqndIu1Yc2fP66FvAGmUYgZKtBpDr52e0UXN9u8uD2gvy/lgz1qo1WImSxQNBot+NPtFXe7ee9mPoAhgrL7PWuTtoG+h8n2proxfDah27uB/MnyD1K8Hz6TUahc/D0tcX+Uaa8FUeU9Gd4HwWZPEiiwQ3w2tvbUmF0WRJWP9q2m4k7NPAQKXqDoN7/qUOVf7/r/FkiRN3n9k9aRF9JDECga/XJq9aq+hz25J5g6f6ZocLfjnImFIlD0zYzKX7fo9nIg7+j9/7/zHbz/n0CLOe8KT6BodNfs7pV1ZfX7twRX5LIVAz0ok7SE5ocn0Lf/98q2rv5bl0NxKXLp9mdaKfV/Y0/Vc1A8Q8xogX7io2Xf/6f7WlT+3l+tfxwR5H+eb96f2s9LZc2m0wx9BQqHU3nLpz/a7ab6SUk1rur16PJ9Qc4/L8q+0WObPkn0T5RA4XOq5FBebv6xU/FJ7+G9cwa3dVjPGAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKjk/wA7i5jTM6T8WAAAAABJRU5ErkJggg==';
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

    doc.setFont("Inter", "normal");
    doc.setTextColor(colors.textSecondary);
    doc.text("License's Back Image", rightColumnX, y + 21);
    doc.addImage(iconBase64, 'PNG', rightColumnX, y + 24, 9, 9);

    if (this.officerObj.licBackImg) {
      doc.link(rightColumnX, y + 24, 9, 9, { url: this.officerObj.licBackImg });
    }

    y += 50;

    // Vehicle Insurance Details Section
    const insuranceDetailsHeight = 50;
    checkNewPage(insuranceDetailsHeight);

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
    doc.text(getValueOrNA(String(this.officerObj.insExpDate?.split("T")[0])), rightColumnX, y + 7);
    doc.setFont("Inter", "normal");
    doc.setTextColor(colors.textSecondary);
    doc.text("Insurance's Back Image", rightColumnX, y + 21);
    doc.addImage(iconBase64, 'PNG', rightColumnX, y + 24, 9, 9);

    if (this.officerObj.insBackImg) {
      doc.link(rightColumnX, y + 24, 9, 9, { url: this.officerObj.insBackImg });
    }

    y += 50;

    // Vehicle Details Section
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
    doc.text("Vehicle's Front Image", leftColumnX, y + 44);

    doc.addImage(iconBase64, 'PNG', leftColumnX, y + 48, 9, 9);

    if (this.officerObj.vehFrontImg) {
      doc.link(leftColumnX, y + 48, 9, 9, { url: this.officerObj.vehFrontImg });
    }

    doc.setFont("Inter", "normal");
    doc.setTextColor(colors.textSecondary);
    doc.text("Vehicle's Side Image - 1", leftColumnX, y + 70);

    doc.addImage(iconBase64, 'PNG', leftColumnX, y + 74, 9, 9);

    if (this.officerObj.vehSideImgA) {
      doc.link(leftColumnX, y + 74, 9, 9, { url: this.officerObj.vehSideImgA });
    }

    doc.setFontSize(10);
    doc.setFont("Inter", "normal");
    doc.setTextColor(colors.textSecondary);
    doc.text("Vehicle's Back Image", rightColumnX, y + 44);

    doc.addImage(iconBase64, 'PNG', rightColumnX, y + 48, 9, 9);

    if (this.officerObj.vehBackImg) {
      doc.link(rightColumnX, y + 48, 9, 9, { url: this.officerObj.vehBackImg });
    }

    doc.setFont("Inter", "normal");
    doc.setTextColor(colors.textSecondary);
    doc.text("Vehicle's Side Image - 2", rightColumnX, y + 70);

    doc.addImage(iconBase64, 'PNG', rightColumnX, y + 74, 9, 9);

    if (this.officerObj.vehSideImgB) {
      doc.link(rightColumnX, y + 74, 9, 9, { url: this.officerObj.vehSideImgB });
    }

    doc.setFont("Inter", "normal");
    doc.setTextColor(colors.textSecondary);
    doc.text('Vehicle Capacity', rightColumnX, y + 21);
    doc.setFont("Inter", "bold");
    doc.setTextColor(colors.textPrimary);
    doc.text(getValueOrNA(String(this.officerObj.vCapacity)) + ' Kg', rightColumnX, y + 28);

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

  deleteOfficer(jobRole: string) {
    const token = this.tokenService.getToken();
    if (!token) return;

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to delete this ${jobRole}? This action cannot be undone.`,
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
        this.collectionService.deleteOfficer(this.officerId).subscribe(
          (data) => {
            this.isLoading = false;
            if (data.status) {
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: `The ${jobRole} has been deleted.`,
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold',
                  confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
                },
                buttonsStyling: false
              });
              this.location.back();
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: `There was an error deleting the ${jobRole}.`,
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
              text: `There was an error deleting the ${jobRole}.`,
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

editOfficer(id: number, jobRole: string) {
  if(jobRole === 'Driver'){
    this.router.navigate([`/steckholders/action/view-distribution-officers/update-distribution-officer/${id}`]);
  }
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