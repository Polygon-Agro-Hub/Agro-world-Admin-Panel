import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CalendarModule } from 'primeng/calendar';
import { FarmerListReportService } from '../../../services/reports/farmer-list-report.service';
import { ActivatedRoute } from '@angular/router';
import { response } from 'express';
import jsPDF from 'jspdf';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-farmer-list-report',
  standalone: true,
  imports: [CommonModule, CalendarModule, LoadingSpinnerComponent],
  templateUrl: './farmer-list-report.component.html',
  styleUrl: './farmer-list-report.component.css',
})
export class FarmerListReportComponent {
  fullTotal: number = 0;
  selectedFamer: any = {};
  todayDate!: any;
  famerID!: number;
  farmerList: FarmerList = new FarmerList();
  cropList: CropList[] = [];
  total!: number;
  isVisible: boolean = true;
  itemId: number | null = null;
  userId: number | null = null;
  QRcode: string | null = null;
  isLoading = false;
  isLoadingButton = false;

  constructor(
    private farmerListReportService: FarmerListReportService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    console.log(this.famerID);
    const today = new Date();
    // this.todayDate = today.toISOString().split('T')[0];
    this.route.queryParams.subscribe((params) => {
      this.itemId = params['id'] ? +params['id'] : null;
      this.userId = params['userId'] ? +params['userId'] : null;
      this.QRcode = params['QRcode'] ? params['QRcode'] : '';
      console.log('Received item ID:', this.itemId);
      console.log('Received user ID:', this.userId);
    });
    this.loadFarmerList();

    console.log('Farmer List:', this.todayDate);
  }

  loadFarmerList() {
    this.isLoading = true;
    if (this.itemId !== null && this.userId !== null) {
      this.farmerListReportService
        .getFarmerListReport(this.itemId, this.userId)
        .subscribe(
          (response) => {
            this.isLoading = false;
            console.log(response);
            this.cropList = response.crops[0];
            this.farmerList = response.farmer[0];
            console.log('Farmer List:', response.date[0]);
            this.todayDate = response.date[0];
          },
          (error) => {
            console.error('Error fetching payments:', error);
          }
        );
    } else {
      console.error('Item ID is null. Cannot fetch farmer list.');
    }
  }

  getTotal() {
    return this.cropList.reduce((total, crop) => {
      return (
        total +
        crop.gradeAprice * crop.gradeAquan +
        crop.gradeBprice * crop.gradeBquan +
        crop.gradeCprice * crop.gradeCquan
      );
    }, 0);
  }

  // loadImageAsBase64(url: string): Promise<string> {
  //   return this.http
  //     .get(url, { responseType: 'blob' })
  //     .toPromise()
  //     .then((blob) => new Promise((resolve, reject) => {
  //       const reader = new FileReader();
  //       reader.onloadend = () => resolve(reader.result as string);
  //       reader.onerror = reject;
  //       reader.readAsDataURL(blob);
  //     }));
  // }

  async downloadPDF(inv: any) {
  this.isLoadingButton = true;
  try {
    const doc = new jsPDF();

    // Helper function to fetch and convert image to base64
    function loadImageAsBase64(url: string): Promise<string> {
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
            console.warn('Image load failed:', url);
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
          console.error('XHR send error:', error);
          reject(error);
        }
      });
    }

    // Helper function to safely get text value
    const safeText = (value: any): string => {
      if (value === null || value === undefined) return 'N/A';
      return value.toString();
    };

    // Helper function to format numbers with commas
    const formatNumber = (value: any): string => {
      if (value === null || value === undefined || value === '') return '0.00';
      
      const num = typeof value === 'string' ? parseFloat(value) : Number(value);
      if (isNaN(num)) return '0.00';
      
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    };

    // Set Document Title
    doc.setFontSize(14);
    doc.text('Farmer Report', 105, 10, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 20, {
      align: 'center',
    });

    let yPosition = 30;

    // Utility Function to Center Text in a Cell
    const centerText = (
      doc: jsPDF,
      text: string,
      x: number,
      width: number,
      y: number
    ) => {
      const textWidth = doc.getTextWidth(text);
      const xCentered = x + (width - textWidth) / 2;
      doc.text(safeText(text), xCentered, y);
    };

    // Utility Function to Draw Table Grid
    const drawGrid = (
      doc: jsPDF,
      x: number,
      y: number,
      widths: number[],
      rows: number
    ) => {
      let xPos = x;
      let yPos = y;
      const totalWidth = widths.reduce((sum, width) => sum + width, 0);

      // Draw vertical lines
      doc.line(xPos, yPos, xPos, yPos + rows * 6);
      widths.forEach((width) => {
        xPos += width;
        doc.line(xPos, yPos, xPos, yPos + rows * 6);
      });

      // Draw horizontal lines
      for (let i = 0; i <= rows; i++) {
        doc.line(x, yPos, x + totalWidth, yPos);
        yPos += 6;
      }
    };

    // Personal Details Table
    doc.setFontSize(12);
    doc.text('Personal Details', 10, yPosition);
    yPosition += 10;

    doc.setFontSize(9);
    const personalHeaders = [
      'First Name',
      'Last Name',
      'NIC Number',
      'Phone Number',
      'Address',
    ];
    const personalColWidths = [25, 25, 35, 35, 70];

    if (!this.farmerList) {
      throw new Error('Farmer data is not available');
    }

    let address = '-';
    const houseNo = this.farmerList.houseNo?.trim();
    const streetName = this.farmerList.streetName?.trim();
    const city = this.farmerList.city?.trim();

    if (houseNo || streetName || city) {
      const addressParts = [];
      if (houseNo) addressParts.push(houseNo);
      if (streetName) addressParts.push(streetName);
      if (city) addressParts.push(city);
      address = addressParts.join(', ');
    }

    const personalRow = [
      safeText(this.farmerList.firstName),
      safeText(this.farmerList.lastName),
      safeText(this.farmerList.NICnumber),
      safeText(this.farmerList.phoneNumber),
      address,
    ];

    // Draw Table Headers
    drawGrid(doc, 10, yPosition, personalColWidths, 1);
    let xPosition = 10;
    personalHeaders.forEach((header, index) => {
      centerText(
        doc,
        header,
        xPosition,
        personalColWidths[index],
        yPosition + 4
      );
      xPosition += personalColWidths[index];
    });

    yPosition += 6;

    // Draw Table Row
    drawGrid(doc, 10, yPosition, personalColWidths, 1);
    xPosition = 10;
    personalRow.forEach((cell, index) => {
      centerText(
        doc,
        cell,
        xPosition,
        personalColWidths[index],
        yPosition + 4
      );
      xPosition += personalColWidths[index];
    });
    yPosition += 20;

    // Bank Details Table
    doc.setFontSize(12);
    doc.text('Bank Details', 10, yPosition);
    yPosition += 10;

    doc.setFontSize(9);
    const bankHeaders = [
      'Account Number',
      'Account Holder',
      'Bank Name',
      'Branch Name',
    ];
    const bankColWidths = [40, 50, 50, 50];
    const bankRow = [
      safeText(this.farmerList.accNumber),
      safeText(this.farmerList.accHolderName),
      safeText(this.farmerList.bankName),
      safeText(this.farmerList.branchName),
    ];

    // Draw Bank Details Table
    drawGrid(doc, 10, yPosition, bankColWidths, 1);
    xPosition = 10;
    bankHeaders.forEach((header, index) => {
      centerText(doc, header, xPosition, bankColWidths[index], yPosition + 4);
      xPosition += bankColWidths[index];
    });

    yPosition += 6;

    // Draw Bank Row
    drawGrid(doc, 10, yPosition, bankColWidths, 1);
    xPosition = 10;
    bankRow.forEach((cell, index) => {
      centerText(doc, cell, xPosition, bankColWidths[index], yPosition + 4);
      xPosition += bankColWidths[index];
    });
    yPosition += 20;

    // Crop Details Table
    if (!this.cropList || !Array.isArray(this.cropList)) {
      throw new Error('Crop list is not available or not an array');
    }

    doc.setFontSize(12);
    doc.text('Crop Details', 10, yPosition);
    yPosition += 10;

    doc.setFontSize(8);
    const cropHeaders = [
      'Crop Name',
      'Variety',
      'Unit Price (A)',
      'Quantity (A)',
      'Unit Price (B)',
      'Quantity (B)',
      'Unit Price (C)',
      'Quantity (C)',
      'Total (Rs.)',
    ];
    const cropColWidths = [30, 30, 18, 18, 18, 18, 18, 18, 22];
    
    // Draw Crop Headers
    drawGrid(doc, 10, yPosition, cropColWidths, 1);
    xPosition = 10;
    cropHeaders.forEach((header, index) => {
      centerText(doc, header, xPosition, cropColWidths[index], yPosition + 4);
      xPosition += cropColWidths[index];
    });

    yPosition += 6;

    // Draw Crop Rows with formatted numbers
    this.cropList.forEach((crop, index) => {
      drawGrid(doc, 10, yPosition, cropColWidths, 1);
      
      // Calculate total for this crop
      const totalPerCrop = 
        (Number(crop.gradeAprice) || 0) * (Number(crop.gradeAquan) || 0) +
        (Number(crop.gradeBprice) || 0) * (Number(crop.gradeBquan) || 0) +
        (Number(crop.gradeCprice) || 0) * (Number(crop.gradeCquan) || 0);

      const row = [
        safeText(crop.cropNameEnglish),
        safeText(crop.varietyNameEnglish),
        formatNumber(crop.gradeAprice), // Formatted with commas
        safeText(crop.gradeAquan),
        formatNumber(crop.gradeBprice), // Formatted with commas
        safeText(crop.gradeBquan),
        formatNumber(crop.gradeCprice), // Formatted with commas
        safeText(crop.gradeCquan),
        formatNumber(totalPerCrop), // Formatted with commas
      ];

      xPosition = 10;
      row.forEach((cell, index) => {
        centerText(doc, cell, xPosition, cropColWidths[index], yPosition + 4);
        xPosition += cropColWidths[index];
      });
      yPosition += 6;

      if (yPosition > 280) {
        doc.addPage();
        yPosition = 10;
      }
    });

    // Full Total with comma formatting
    yPosition += 10;
    doc.setFontSize(12);
    const total = this.getTotal();
    doc.text(`Full Total (Rs.): ${formatNumber(total)}`, 10, yPosition);

    // QR Codes Section
    yPosition += 20;
    const pageWidth = doc.internal.pageSize.width;
    const imageWidth = 50;
    const imageSpacing = 10;
    const totalImageWidth = imageWidth * 2 + imageSpacing;
    const startX = (pageWidth - totalImageWidth) / 2;

    const appendCacheBuster = (url: string) => {
      if (!url) return '';
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}t=${new Date().getTime()}`;
    };

    try {
      let farmerQrBase64 = '';
      let officerQrBase64 = '';

      if (this.farmerList.farmerQr) {
        const modifiedFarmerUrl = appendCacheBuster(this.farmerList.farmerQr);
        farmerQrBase64 = await loadImageAsBase64(modifiedFarmerUrl);
      }

      if (this.QRcode) {
        const modifiedOfficerUrl = appendCacheBuster(this.QRcode);
        officerQrBase64 = await loadImageAsBase64(modifiedOfficerUrl);
      }

      // Add Farmer QR Code (if available)
      if (farmerQrBase64) {
        doc.text('Farmer QR Code:', startX, yPosition - 5);
        doc.addImage(
          farmerQrBase64,
          'PNG',
          startX,
          yPosition,
          imageWidth,
          imageWidth
        );
      }

      // Add Collection Officer QR Code (if available)
      if (officerQrBase64) {
        const secondImageX = startX + imageWidth + imageSpacing;
        doc.text('Collection Officer QR Code:', secondImageX, yPosition - 5);
        doc.addImage(
          officerQrBase64,
          'PNG',
          secondImageX,
          yPosition,
          imageWidth,
          imageWidth
        );
      }

      yPosition += imageWidth + 20;
    } catch (error) {
      console.error('Error adding QR codes:', error);
      doc.setTextColor(255, 0, 0);
      doc.text('Error loading QR codes', 10, yPosition);
      doc.setTextColor(0, 0, 0);
    }

    console.log('Saving PDF...');
    doc.save(`${inv}.pdf`);
    console.log('PDF generation completed successfully');
    this.isLoadingButton = false;
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please check the console for details.');
    this.isLoadingButton = false;
  }
}

  formatNumberWithCommas(number: number): string {
    return number.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}

class FarmerList {
  id!: number;
  firstName!: string;
  lastName!: string;
  NICnumber!: string;
  phoneNumber!: string;
  farmerQr!: string;
  houseNo!: string;
  streetName!: string;
  city!: string;
  accNumber!: string;
  accHolderName!: string;
  bankName!: string;
  branchName!: string;
}

class CropList {
  id!: number;
  cropId!: string;
  varietyNameEnglish!: string;
  cropNameEnglish!: string;
  gradeAprice!: number;
  gradeBprice!: number;
  gradeCprice!: number;
  gradeAquan!: number;
  gradeBquan!: number;
  gradeCquan!: number;
}

class FarmerCrop {
  id!: string;
  firstName!: string;
  lastName!: string;
  phoneNumber!: string;
  NICnumber!: string;
  farmerQr!: string;
  houseNo!: string;
  streetName!: string;
  city!: string;
  accNumber!: string;
  accHolderName!: string;
  bankName!: string;
  branchName!: string;
}
