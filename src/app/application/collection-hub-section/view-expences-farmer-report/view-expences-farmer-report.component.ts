import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectionService } from '../../../services/collection.service';
import jsPDF from 'jspdf';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';

@Component({
  selector: 'app-view-expences-farmer-report',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './view-expences-farmer-report.component.html',
  styleUrl: './view-expences-farmer-report.component.css'
})
export class ViewExpencesFarmerReportComponent implements OnInit {

  userObj: User = new User();
  CropArr!: Crop[];

  invNo!: string;
  hasData: boolean = false

  totalAmount: number = 0
  totalAmountforReport: number = 0;
  isLoading: boolean = true;


  constructor(
    private router: Router,
    private collectionService: CollectionService,
    private route: ActivatedRoute,
    public tokenService: TokenService,
    public permissionService: PermissionService

  ) { }

  ngOnInit(): void {
    this.invNo = this.route.snapshot.params['invNo'];
    this.fetchFarmerDetails(this.invNo);
  }

  fetchFarmerDetails(invNo: string) {
    this.isLoading = true
    this.collectionService.getFarmerReportInvoice(invNo).subscribe(
      (res) => {
        if (res.status) {
          this.userObj = res.user;
          this.CropArr = res.crops;
          this.hasData = true;
          this.calculateOverallTotal(); // Calculate total here
        } else {
          this.hasData = false;
        }
        this.isLoading = false;
      }
    );
  }

  calculateOverallTotal(): void {
    // Reset totalAmount before calculating
    this.totalAmount = this.CropArr.reduce((sum, item) => {
      return sum + this.calculateRowTotal(item);
    }, 0);
  }

  navigateToCollectionReports() {
    this.router.navigate(['/reports/collection-reports']); // Change '/reports' to your desired route
  }

  navigateToOfficerReports() {
    this.router.navigate(['/reports/officer-reports']); // Change '/reports' to your desired route
  }


  calculeteTotal(priceA: number, qtyA: number, priceB: number, qtyB: number, priceC: number, qtyC: number): number {
    let tot = priceA * qtyA + priceB * qtyB + priceC * qtyC
    this.totalAmount += tot;
    return tot;
  }

  calculateRowTotal(item: Crop): number {
    return item.gradeAprice * item.gradeAquan +
      item.gradeBprice * item.gradeBquan +
      item.gradeCprice * item.gradeCquan;
  }

  calculateRowTotalforReport(crop: Crop): number {
    return crop.gradeAprice * crop.gradeAquan +
      crop.gradeBprice * crop.gradeBquan +
      crop.gradeCprice * crop.gradeCquan;
  }

  calculateOverallTotalforReport(): number {
    // Calculate and return the total amount without modifying class properties
    return this.CropArr.reduce((sum, crop) => {
      return sum + this.calculateRowTotalforReport(crop);
    }, 0);
  }

  // this code works correctly but did not had time to fix the address display
  async downloadReport() {
    // Create new PDF document
    this.isLoading = true;
    const doc = new jsPDF();

    // Helper function to format null values
    const formatValue = (value: any): string => {
      return value === null || value === undefined ? 'N/A' : value.toString();
    };

    // const formatValueForAmounts = (value: any): string => {
    //   return value === null || value === undefined ? '0.00' : value.toString();
    // };

    const formatValueForAmounts = (value: any): string => {
      if (value === null || value === undefined) {
        return '0.00';
      }

      // Convert to number
      const num = Number(value);

      // Format with commas and 2 decimal places
      return isNaN(num)
        ? '0.00'
        : num.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
    };

    // Helper function to split text into multiple lines
    const splitTextIntoLines = (text: string, maxWidth: number): string[] => {
      return doc.splitTextToSize(text, maxWidth);
    };

    // Dynamic table drawing function
    const drawDynamicTable = (
      data: any[][],
      startX: number,
      startY: number,
      columnWidths: number[],
      lineHeight: number = 7,
      padding: number = 3,
      headerTextColor: string = '#000000',
      bodyTextColor: string = '#000000'
    ): number => {
      let currentY = startY;
      const originalFont = doc.getFont(); // Store original font settings

      data.forEach((row, rowIndex) => {
        let maxLines = 1;
        const cellLines: string[][] = [];

        // First determine how many lines we need for this row
        row.forEach((cell, colIndex) => {
          const cellContent = cell.toString();
          const maxCellWidth = columnWidths[colIndex] - padding * 2;
          const lines = splitTextIntoLines(cellContent, maxCellWidth);
          cellLines.push(lines);
          maxLines = Math.max(maxLines, lines.length);
        });

        // Calculate total row height
        const rowHeight = maxLines * lineHeight + padding * 2;

        // Set text style based on row type
        const isHeader = rowIndex === 0;
        doc.setTextColor(isHeader ? headerTextColor : bodyTextColor);

        // Set font to bold for headers
        if (isHeader) {
          doc.setFont(originalFont.fontName, 'bold');
        } else {
          doc.setFont(originalFont.fontName, 'normal');
        }

        // Draw each cell
        let currentX = startX;
        row.forEach((cell, colIndex) => {
          // Draw cell border
          doc.rect(
            currentX,
            currentY,
            columnWidths[colIndex],
            rowHeight
          );

          // Draw text (centered vertically)
          const lines = cellLines[colIndex];
          const textHeight = lines.length * lineHeight;
          const verticalOffset = (rowHeight - textHeight) / 1.5;

          lines.forEach((line, lineIndex) => {
            doc.text(
              line,
              currentX + padding,
              currentY + verticalOffset + (lineIndex * lineHeight) + padding
            );
          });

          currentX += columnWidths[colIndex];
        });

        currentY += rowHeight;
      });

      // Reset to original font settings
      doc.setFont(originalFont.fontName, originalFont.fontStyle);
      doc.setTextColor('#000000');
      return currentY;
    };

    // Initialize position variables
    let x = 14;  // Starting x position
    let y = 15;  // Starting y position
    const yIncrement = 5;  // Standard increment for y position

    // Set font
    doc.setFont('helvetica');

    // Add invoice details
    doc.setFontSize(10);
    doc.setTextColor('#000000');
    doc.text(`INV NO: ${formatValue(this.userObj.invNo)}`, x, y);
    y += yIncrement;
    doc.setTextColor('#575757');
    doc.text(`Date: ${new Date(this.userObj.createdAt).toISOString().split('T')[0].replace(/-/g, '/')}`, x, y);
    y += yIncrement * 2;

    // Add Personal Details section
    y += yIncrement * 0.25;
    doc.setFontSize(11);
    doc.setTextColor('#000000');
    doc.text('Personal Details', x, y);
    y += yIncrement;
    doc.setFontSize(9);

    // Draw Personal Details table
    y = drawDynamicTable(
      [
        ['First Name', 'Last Name', 'NIC Number', 'Phone Number', 'Address'],
        [
          formatValue(this.userObj.firstName),
          formatValue(this.userObj.lastName),
          formatValue(this.userObj.NICnumber),
          formatValue(this.userObj.phoneNumber),
          this.userObj.houseNo && this.userObj.streetName && this.userObj.city
            ? `${formatValue(this.userObj.houseNo)}, ${formatValue(this.userObj.streetName)}, ${formatValue(this.userObj.city)}`
            : '-'
        ]
      ],
      x,
      y,
      [25, 25, 30, 40, 60], // Column widths
      7,  // lineHeight
      3,  // padding
      '#434343',  // Header text color (red)
      '#000000'   // Body text color (dark gray)
    ) + yIncrement;

    // Add Bank Details section
    y += yIncrement * 0.25;
    y += yIncrement;
    doc.setFontSize(11);
    doc.text('Bank Details', x, y);
    y += yIncrement;
    doc.setFontSize(9);

    // Draw Bank Details table
    y = drawDynamicTable(
      [
        ['Account Number', 'Account Holder\'s Name', 'Bank Name', 'Branch Name'],
        [
          formatValue(this.userObj.accNumber),
          formatValue(this.userObj.accHolderName),
          formatValue(this.userObj.bankName),
          formatValue(this.userObj.branchName)
        ]
      ],
      x,
      y,
      [40, 50, 30, 30], // Column widths
      7,  // lineHeight
      3,  // padding
      '#434343',  // Header text color (red)
      '#000000'   // Body text color (dark gray)
    ) + yIncrement;

    // Add Crop Details section
    y += yIncrement * 0.25;
    y += yIncrement;
    doc.setFontSize(11);
    doc.text('Crop Details', x, y);
    y += yIncrement;
    doc.setFontSize(9);

    // Prepare crop details data for table
    const cropTableHeaders = ['Crop Name', 'Variety', 'Unit Price (A)', 'Quantity',
      'Unit Price (B)', 'Quantity', 'Unit Price (C)', 'Quantity', 'Total (Rs.)'];

    const cropTableData = this.CropArr.map(crop => [
      formatValue(crop.cropNameEnglish),
      formatValue(crop.varietyNameEnglish),
      formatValueForAmounts(crop.gradeAprice),
      formatValueForAmounts(crop.gradeAquan),
      formatValueForAmounts(crop.gradeBprice),
      formatValueForAmounts(crop.gradeBquan),
      formatValueForAmounts(crop.gradeCprice),
      formatValueForAmounts(crop.gradeCquan),
      formatValueForAmounts(this.calculateRowTotalforReport(crop).toFixed(2))
    ]);

    // Draw Crop Details table with dynamic row heights
    y = drawDynamicTable(
      [cropTableHeaders, ...cropTableData],
      x,
      y,
      [22, 24, 23, 20, 23, 18, 23, 17, 23], // Column widths
      5, // Line height
      2, // Padding
      '#434343',  // Header text color (red)
      '#000000'   // Body text color (dark gray)
    ) + yIncrement;

    // Add Full Total
    doc.setFontSize(10);
    y += yIncrement
    doc.text('Full Total(Rs.) : ' + formatValueForAmounts(this.calculateOverallTotalforReport().toFixed(2)), x, y);
    y += yIncrement * 2.5;

    // QR Code Image Loading Function
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
        xhr.send();
      });
    };

    const appendCacheBuster = (url: string) => {
      if (!url) return '';
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}t=${new Date().getTime()}`;
    };

    // Load QR codes
    let farmerQrImagebase64 = '';
    let officerQrImagebase64 = '';

    try {
      if (this.userObj.farmerQr) {
        farmerQrImagebase64 = await loadImageAsBase64(appendCacheBuster(this.userObj.farmerQr));
      }
    } catch (error) {
      console.error('Error loading farmer QR:', error);
    }

    try {
      if (this.userObj.officerQr) {
        officerQrImagebase64 = await loadImageAsBase64(appendCacheBuster(this.userObj.officerQr));
      }
    } catch (error) {
      console.error('Error loading officer QR:', error);
    }

    // QR code positions
    const qrWidth = 40;
    const qrHeight = 40;
    const qrY = y;
    const farmerQrX = x;
    const officerQrX = x + qrWidth + 6;
    const labelY = qrY + qrHeight + 3;

    // Add farmer QR code
    if (farmerQrImagebase64) {
      doc.addImage(farmerQrImagebase64, 'PNG', farmerQrX, qrY, qrWidth, qrHeight);
    } else {
      doc.rect(farmerQrX, qrY, qrWidth - 5, qrHeight - 5);
      doc.setFontSize(10);
      doc.text('Not', farmerQrX + 14, qrY + 18);
      doc.text('Available', farmerQrX + 10, qrY + 23);
    }
    doc.setTextColor('#000000');
    doc.setFontSize(12);
    doc.text('Farmer Qr Code', farmerQrX + 6, labelY);

    // Add officer QR code
    if (officerQrImagebase64) {
      doc.addImage(officerQrImagebase64, 'PNG', officerQrX, qrY, qrWidth, qrHeight);
    } else {
      doc.rect(officerQrX, qrY, qrWidth - 5, qrHeight - 5);
      doc.setFontSize(10);
      doc.text('Not', officerQrX + 14, qrY + 18);
      doc.text('Available', officerQrX + 10, qrY + 23);
    }
    doc.setTextColor('#000000');
    doc.setFontSize(12);
    doc.text('Officer Qr Code', officerQrX + 6, labelY);

    // Save the PDF
    doc.save(`invoice_${this.userObj.invNo}.pdf`);
    this.isLoading = false;
  }


}

class User {
  id!: number
  firstName!: string
  lastName!: string
  phoneNumber!: string
  NICnumber!: string
  houseNo!: string
  streetName!: string
  city!: string
  district!: string
  accNumber!: string
  farmerQr!: string
  officerQr!: string
  accHolderName!: string
  bankName!: string
  branchName!: string
  createdAt!: string
  invNo!: string
}

class Crop {
  id!: number
  cropNameEnglish!: string
  varietyNameEnglish!: string
  gradeAprice!: number
  gradeBprice!: number
  gradeCprice!: number
  gradeAquan!: number
  gradeBquan!: number
  gradeCquan!: number

}