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
  
  // downloadPDF() {
  //   const doc = new jsPDF();

  //   doc.setFontSize(14);
  //   doc.text('Farmer Report', 105, 20, { align: 'center' });
  //   doc.text(`Date: ${this.todayDate}`, 105, 30, { align: 'center' });

  //   const cellHeight = 10;

  //   const drawTable = (
  //     doc: jsPDF,
  //     startX: number,
  //     startY: number,
  //     data: any[],
  //     cellWidths: number[]
  //   ) => {
  //     let currentY = startY;

  //     data.forEach((row, index) => {
  //       doc.setFontSize(10);
  //       doc.setLineWidth(0.2);

  //       doc.rect(startX, currentY - cellHeight, cellWidths[index], cellHeight);

  //       doc.text(row[0], startX + 2, currentY - 3);

  //       startX += cellWidths[index];
  //     });

  //     startX -= cellWidths.reduce((acc, width) => acc + width, 0);
  //     currentY += cellHeight;

  //     data.forEach((row, index) => {
  //       doc.rect(startX, currentY - cellHeight, cellWidths[index], cellHeight);

  //       doc.text(row[1], startX + 2, currentY - 3);

  //       startX += cellWidths[index];
  //     });
  //   };

  //   doc.setFontSize(10);
  //   doc.text('Personal Details', 5, 40);
  //   const personalDetails = [
  //     ['First Name', this.farmerList.firstName],
  //     ['Last Name', this.farmerList.lastName],
  //     ['NIC Number', this.farmerList.NICnumber],
  //     ['Phone Number', this.farmerList.phoneNumber],
  //     ['Address', this.farmerList.address],
  //   ];
  //   const personalCellWidths = [30, 30, 30, 30, 80];
  //   drawTable(doc, 5, 55, personalDetails, personalCellWidths);

  //   const nextTableStartY = 55 + cellHeight * 2 + 10;
  //   doc.text('Bank Details', 5, nextTableStartY);
  //   const bankDetails = [
  //     ['Account Number', this.farmerList.accNumber],
  //     ['Account Holder’s Name', this.farmerList.accHolderName],
  //     ['Bank Name', this.farmerList.bankName],
  //     ['Branch Name', this.farmerList.branchName],
  //   ];
  //   const bankCellWidths = [35, 45, 45, 45];
  //   drawTable(doc, 5, nextTableStartY + 15, bankDetails, bankCellWidths);

  //   const nextCropTableStartY = nextTableStartY + cellHeight * 1 + 30;
  //   doc.text('Crop Details', 5, nextCropTableStartY);
  //   const cropDetails = this.farmerList.crops.map((crop) => [
  //     ['Crop Name', crop.cropNameEnglish],
  //     ['Variety', crop.varietyNameEnglish],
  //     ['Unit Price (A)', crop.gradeAprice],
  //     ['Quantity (A)', crop.gradeAquan],
  //     ['Unit Price (B)', crop.gradeBprice],
  //     ['Quantity (B)', crop.gradeBquan],
  //     ['Unit Price (C)', crop.gradeCprice],
  //     ['Quantity (C)', crop.gradeCquan],
  //   ]);
    
  //   console.log(cropDetails);
    
  //   const cropCellWidths = [25, 25, 25, 18, 25, 18, 25, 18, 20];
  //   drawTable(doc, 5, nextCropTableStartY + 15, cropDetails, cropCellWidths);

  //   doc.text(
  //     `Full Total (Rs.): `,
  //     5,
  //     160,
  //     { align: 'left' }
  //   );

  //   // const qrCodeImage = this.farmerList.paymentImage;  // Assuming this is a base64 image or URL
  //   // const qrWidth = 40;
  //   // const qrHeight = 40;
  //   // const qrX = 160;
  //   // const qrY = 180;

  //   // if (qrCodeImage) {
  //   //   doc.addImage(qrCodeImage, 'PNG', qrX, qrY, qrWidth, qrHeight);  // Make sure the format is correct ('PNG', 'JPEG')
  //   // }

  //   doc.save('Farmer_Details_Report.pdf');
  // }
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
