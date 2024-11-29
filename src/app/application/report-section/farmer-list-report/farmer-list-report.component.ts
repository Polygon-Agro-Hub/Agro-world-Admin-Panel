import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CalendarModule } from 'primeng/calendar';
import { FarmerListReportService } from '../../../services/reports/farmer-list-report.service';
import { ActivatedRoute } from '@angular/router';
import { response } from 'express';
import jsPDF from 'jspdf';

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

  constructor(
    private farmerListReportService: FarmerListReportService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log(this.famerID);
    const today = new Date();
    // this.todayDate = today.toISOString().split('T')[0];
    this.route.queryParams.subscribe((params) => {
      this.itemId = params['id'] ? +params['id'] : null;
      this.userId = params['id'] ? +params['userId'] : null;
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
  
  downloadPDF() {
    const doc = new jsPDF();
  
    // Set Document Title
    doc.setFontSize(14);
    doc.text('Farmer Report', 105, 10, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 20, { align: 'center' });
  
    let yPosition = 30;
  
    // Personal Details Section
    doc.setFontSize(12);
    doc.text('Personal Details', 10, yPosition);
    yPosition += 10;
  
    doc.setFontSize(10);
    doc.text(`First Name: ${this.farmerList.firstName}`, 10, yPosition);
    doc.text(`Last Name: ${this.farmerList.lastName}`, 100, yPosition);
    yPosition += 6;
    doc.text(`NIC Number: ${this.farmerList.NICnumber}`, 10, yPosition);
    doc.text(`Phone Number: ${this.farmerList.phoneNumber}`, 100, yPosition);
    yPosition += 6;
    doc.text(
      `Address: ${this.farmerList.houseNo}, ${this.farmerList.streetName}, ${this.farmerList.city}`,
      10,
      yPosition
    );
    yPosition += 10;
  
    // Bank Details Section
    doc.setFontSize(12);
    doc.text('Bank Details', 10, yPosition);
    yPosition += 10;
  
    doc.setFontSize(10);
    doc.text(`Account Number: ${this.farmerList.accNumber}`, 10, yPosition);
    doc.text(`Account Holder’s Name: ${this.farmerList.accHolderName}`, 100, yPosition);
    yPosition += 6;
    doc.text(`Bank Name: ${this.farmerList.bankName}`, 10, yPosition);
    doc.text(`Branch Name: ${this.farmerList.branchName}`, 100, yPosition);
    yPosition += 10;
  
    // Crop Details Section
    doc.setFontSize(12);
    doc.text('Crop Details', 10, yPosition);
    yPosition += 10;
  
    // Table Headers
    const headers = [
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
    const colWidths = [30, 25, 25, 20, 25, 20, 25, 20, 30];
  
    // Draw Table Header
    headers.forEach((header, index) => {
      doc.text(header, 10 + colWidths.slice(0, index).reduce((a, b) => a + b, 0), yPosition);
    });
    yPosition += 6;
  
    // Draw Table Rows
    this.cropList.forEach((crop) => {
      const row = [
        crop.cropNameEnglish,
        crop.varietyNameEnglish,
        crop.gradeAprice.toString(),
        crop.gradeAquan.toString(),
        crop.gradeBprice.toString(),
        crop.gradeBquan.toString(),
        crop.gradeCprice.toString(),
        crop.gradeCquan.toString(),
        (
          crop.gradeAprice * crop.gradeAquan +
          crop.gradeBprice * crop.gradeBquan +
          crop.gradeCprice * crop.gradeCquan
        ).toFixed(2),
      ];
  
      row.forEach((cell, index) => {
        doc.text(
          cell,
          10 + colWidths.slice(0, index).reduce((a, b) => a + b, 0),
          yPosition
        );
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
