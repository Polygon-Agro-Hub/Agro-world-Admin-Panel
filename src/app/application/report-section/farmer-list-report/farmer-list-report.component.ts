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
  total!: number;
  isVisible: boolean = true;

  constructor(
    private farmerListReportService: FarmerListReportService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const today = new Date();
    this.todayDate = today.toISOString().split('T')[0];
    this.famerID = this.route.snapshot.params['userId'];
    this.loadFarmerList();
  }

  loadFarmerList() {
    this.farmerListReportService.getFarmerListReport(this.famerID).subscribe(
      (response) => {
        console.log(response);

        this.farmerList = response.items;
      },
      (error) => {
        console.error('Error fetching payments:', error);
      }
    );
  }
  downloadPDF() {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text('Farmer Report', 105, 20, { align: 'center' });
    doc.text(`Date: ${this.todayDate}`, 105, 30, { align: 'center' });

    const cellHeight = 10;

    const drawTable = (
      doc: jsPDF,
      startX: number,
      startY: number,
      data: any[],
      cellWidths: number[]
    ) => {
      let currentY = startY;

      data.forEach((row, index) => {
        doc.setFontSize(10);
        doc.setLineWidth(0.2);

        doc.rect(startX, currentY - cellHeight, cellWidths[index], cellHeight);

        doc.text(row[0], startX + 2, currentY - 3);

        startX += cellWidths[index];
      });

      startX -= cellWidths.reduce((acc, width) => acc + width, 0);
      currentY += cellHeight;

      data.forEach((row, index) => {

        doc.rect(startX, currentY - cellHeight, cellWidths[index], cellHeight);

        doc.text(row[1], startX + 2, currentY - 3);

        startX += cellWidths[index];
      });
    };

    doc.setFontSize(10);
    doc.text('Personal Details', 5, 40);
    const personalDetails = [
      ['First Name', this.farmerList.farmerFirstName],
      ['Last Name', this.farmerList.farmerLastName],
      ['NIC Number', this.farmerList.farmerNIC],
      ['Phone Number', this.farmerList.farmerPhoneNumber],
      ['Address', this.farmerList.farmerAddress],
    ];
    const personalCellWidths = [30, 30, 30, 30, 80];
    drawTable(doc, 5, 55, personalDetails, personalCellWidths);

    const nextTableStartY = 55 + cellHeight * 2 + 10;
    doc.text('Bank Details', 5, nextTableStartY);
    const bankDetails = [
      ['Account Number', this.farmerList.farmerAccountNumber],
      ['Account Holder’s Name', this.farmerList.farmerBankAccountHolder],
      ['Bank Name', this.farmerList.farmerBankName],
      ['Branch Name', this.farmerList.farmerBranchName],
    ];
    const bankCellWidths = [35, 45, 45, 45]; 
    drawTable(doc, 5, nextTableStartY + 15, bankDetails, bankCellWidths);

    const nextCropTableStartY = nextTableStartY + cellHeight * 1 + 30;
    doc.text('Crop Details', 5, nextCropTableStartY);
    const cropDetails = [
      ['Crop Name', this.farmerList.cropName],
      ['Variety', this.farmerList.cropVariety],
      ['Unit Price (A)', this.farmerList.unitPriceA],
      ['Quantity', this.farmerList.qty],
      ['Unit Price (B)', this.farmerList.unitPriceB],
      ['Quantity', this.farmerList.qty],
      ['Unit Price (C)', this.farmerList.unitPriceC],
      ['Quantity', this.farmerList.qty],
      ['Total (Rs.) ', this.farmerList.totalPaymentAmount],
    ];
    const cropCellWidths = [25, 25, 25, 18, 25, 18, 25, 18, 20];
    drawTable(doc, 5, nextCropTableStartY + 15, cropDetails, cropCellWidths);

    doc.text(`Full Total (Rs.): ${this.farmerList.totalPaymentAmount}`, 5, 160, { align: 'left' });

    // const qrCodeImage = this.farmerList.paymentImage;  // Assuming this is a base64 image or URL
    // const qrWidth = 40;
    // const qrHeight = 40;
    // const qrX = 160;
    // const qrY = 180;
  
    // if (qrCodeImage) {
    //   doc.addImage(qrCodeImage, 'PNG', qrX, qrY, qrWidth, qrHeight);  // Make sure the format is correct ('PNG', 'JPEG')
    // }

    doc.save('Farmer_Details_Report.pdf');
   }
}

class FarmerList {
  farmerFirstName!: string;
  farmerLastName!: string;
  farmerNIC!: string;
  farmerPhoneNumber!: string;
  totalPaymentAmount!: string;
  officerFirstName!: string;
  officerLastName!: string;
  officerPhone1!: string;
  officerPhone2!: string;
  officerEmail!: string;
  cropName!: string;
  unitPriceA!: string;
  weightA!: string;
  paymentImage!: string;
  cropVariety!: string;
  weightB!: string;
  weightC!: string;
  unitPriceB!: string;
  unitPriceC!: string;
  qty!: string;
  paymentDate!: string;
  farmerBankAccountHolder!: string;
  farmerAccountNumber!: string;
  farmerBankName!: string;
  farmerBranchName!: string;
  farmerAddress!: string;
}
