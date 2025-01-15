import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CalendarModule } from 'primeng/calendar';
import { FarmerListReportService } from '../../../services/reports/farmer-list-report.service';
import { ActivatedRoute } from '@angular/router';
import { response } from 'express';
import jsPDF from 'jspdf';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-farmer-list-report',
  standalone: true,
  imports: [CommonModule, CalendarModule],
  templateUrl: './farmer-list-report.component.html',
  styleUrl: './farmer-list-report.component.css',
})
export class FarmerListReportComponent {
  fullTotal: number = 0;
  selectedFamer: any = {};
  todayDate!: string;
  famerID!: number;
  farmerList: FarmerList = new FarmerList();
  cropList: CropList[] = [];
  total!: number;
  isVisible: boolean = true;
  itemId: number | null = null;
  userId: number | null = null;
  QRcode: string | null = null;

  constructor(
    private farmerListReportService: FarmerListReportService,
    private route: ActivatedRoute,
    private http: HttpClient, 
    private sanitizer: DomSanitizer
  ) {}

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
  }

  loadFarmerList() {
    if (this.itemId !== null && this.userId !== null) {
      this.farmerListReportService.getFarmerListReport(this.itemId, this.userId).subscribe(
        (response) => {
          console.log(response);
          this.cropList = response.crops[0];
          this.farmerList = response.farmer[0];
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
      return total + (crop.gradeAprice * crop.gradeAquan) +
                    (crop.gradeBprice * crop.gradeBquan) +
                    (crop.gradeCprice * crop.gradeCquan);
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



  downloadPDF() {
    const doc = new jsPDF();
  
    // Set Document Title
    doc.setFontSize(14);
    doc.text('Farmer Report', 105, 10, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 20, { align: 'center' });
  
    let yPosition = 30;
  
    // Utility Function to Center Text in a Cell
    const centerText = (doc: jsPDF, text: string, x: number, width: number, y: number) => {
      const textWidth = doc.getTextWidth(text);
      const xCentered = x + (width - textWidth) / 2;
      doc.text(text, xCentered, y);
    };
  
    // Utility Function to Draw Table Grid
    const drawGrid = (doc: jsPDF, x: number, y: number, widths: number[], rows: number) => {
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
  
    doc.setFontSize(9); // Small font size for tables
    const personalHeaders = ['First Name', 'Last Name', 'NIC Number', 'Phone Number', 'Address'];
    const personalColWidths = [30, 30, 40, 40, 50];
    const personalRow = [
      this.farmerList.firstName,
      this.farmerList.lastName,
      this.farmerList.NICnumber,
      this.farmerList.phoneNumber,
      `${this.farmerList.houseNo}, ${this.farmerList.streetName}, ${this.farmerList.city}`,
    ];
  
    // Draw Table Headers
    drawGrid(doc, 10, yPosition, personalColWidths, 1); // Header Grid
    let xPosition = 10;
    personalHeaders.forEach((header, index) => {
      centerText(doc, header, xPosition, personalColWidths[index], yPosition + 4);
      xPosition += personalColWidths[index];
    });
  
    yPosition += 6;
  
    // Draw Table Row
    drawGrid(doc, 10, yPosition, personalColWidths, 1); // Row Grid
    xPosition = 10;
    personalRow.forEach((cell, index) => {
      centerText(doc, cell, xPosition, personalColWidths[index], yPosition + 4);
      xPosition += personalColWidths[index];
    });
    yPosition += 20;
  
    // Bank Details Table
    doc.setFontSize(12);
    doc.text('Bank Details', 10, yPosition);
    yPosition += 10;
  
    doc.setFontSize(9);
    const bankHeaders = ['Account Number', 'Account Holder', 'Bank Name', 'Branch Name'];
    const bankColWidths = [40, 50, 50, 50];
    const bankRow = [
      this.farmerList.accNumber,
      this.farmerList.accHolderName,
      this.farmerList.bankName,
      this.farmerList.branchName,
    ];
  
    // Draw Table Headers
    drawGrid(doc, 10, yPosition, bankColWidths, 1); // Header Grid
    xPosition = 10;
    bankHeaders.forEach((header, index) => {
      centerText(doc, header, xPosition, bankColWidths[index], yPosition + 4);
      xPosition += bankColWidths[index];
    });
  
    yPosition += 6;
  
    // Draw Table Row
    drawGrid(doc, 10, yPosition, bankColWidths, 1); // Row Grid
    xPosition = 10;
    bankRow.forEach((cell, index) => {
      centerText(doc, cell, xPosition, bankColWidths[index], yPosition + 4);
      xPosition += bankColWidths[index];
    });
    yPosition += 20;
  
    // Crop Details Table
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
    const cropColWidths = [20, 37, 19, 19, 19, 19, 19, 19, 19];
  
    // Draw Table Headers
    drawGrid(doc, 10, yPosition, cropColWidths, 1); // Header Grid
    xPosition = 10;
    cropHeaders.forEach((header, index) => {
      centerText(doc, header, xPosition, cropColWidths[index], yPosition + 4);
      xPosition += cropColWidths[index];
    });
  
    yPosition += 6;
  
    // Draw Table Rows
    this.cropList.forEach((crop) => {
      drawGrid(doc, 10, yPosition, cropColWidths, 1); // Row Grid
      const row = [
        crop.cropNameEnglish ?? 'N/A',
        crop.varietyNameEnglish ?? 'N/A',
        (crop.gradeAprice ?? 0).toString(),
        (crop.gradeAquan ?? 0).toString(),
        (crop.gradeBprice ?? 0).toString(),
        (crop.gradeBquan ?? 0).toString(),
        (crop.gradeCprice ?? 0).toString(),
        (crop.gradeCquan ?? 0).toString(),
        (
          (crop.gradeAprice ?? 0) * (crop.gradeAquan ?? 0) +
          (crop.gradeBprice ?? 0) * (crop.gradeBquan ?? 0) +
          (crop.gradeCprice ?? 0) * (crop.gradeCquan ?? 0)
        ).toFixed(2),
      ];
      
  
      xPosition = 10;
      row.forEach((cell, index) => {
        centerText(doc, cell, xPosition, cropColWidths[index], yPosition + 4);
        xPosition += cropColWidths[index];
      });
      yPosition += 6;
  
      // Check for page break
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 10;
      }
    });
  
    // Full Total
    yPosition += 10;
    doc.setFontSize(12);
    doc.text(`Full Total (Rs.): ${this.getTotal().toFixed(2)}`, 10, yPosition);
  


    yPosition += 20; // Add some space after the table

const pageWidth = doc.internal.pageSize.width; // Get the width of the PDF page
const imageWidth = 50; // Width of each image
const imageSpacing = 10; // Spacing between images
const totalImageWidth = imageWidth * 2 + imageSpacing; // Total width of both images and spacing
const startX = (pageWidth - totalImageWidth) / 2; // Starting X position to center the images

// Add Farmer QR Code (if available)
// if (this.farmerList.farmerQr) {
//   doc.text('Farmer QR Code:', startX, yPosition - 5); // Add label above the image
//   doc.addImage(this.farmerList.farmerQr, 'PNG', startX, yPosition, imageWidth, imageWidth);
// }

// Add Collection Officer QR Code (if available)
// if (this.QRcode) {
//   const secondImageX = startX + imageWidth + imageSpacing; // X position for the second image
//   doc.text('Collection Officer QR Code:', secondImageX, yPosition - 5); // Add label above the image
//   doc.addImage(this.QRcode, 'PNG', secondImageX, yPosition, imageWidth, imageWidth);
// }

yPosition += imageWidth + 20; 
    // Save PDF
    doc.save('Farmer_Details_Report.pdf');
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
  streetName!:string;
  city!: string;
  accNumber!: string;
  accHolderName!: string;
  bankName!: string;
  branchName!:string;
}
