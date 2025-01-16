import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CollectionService } from '../../../services/collection.service';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-monthly-report',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './monthly-report.component.html',
  styleUrl: './monthly-report.component.css',
})
export class MonthlyReportComponent implements OnInit {
  @ViewChild('contentToConvert', { static: false })
  contentToConvert!: ElementRef;
  fromDate: string = '';
  toDate: string = '';
  officerId!: number;
  officerData: any;
  dailyReports: any[] = [];
  generatedTime: string = '';
  generatedDate: string = '';
  finalTotalWeight: number = 0;
  finalTotalFarmers: number = 0;
  isLoading: boolean = true;
  visible: boolean = false;
  maxDate: string = '';
  hasData: boolean = false;
  go: boolean = false;

  constructor(
    private collectionoOfficer: CollectionCenterService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.officerId = this.route.snapshot.params['id'];
    this.getOfficerDetails(this.officerId);
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
    this.visible = false;
  }

  // downloadReport(): void {
  //   const element = this.contentToConvert.nativeElement; // Get the content element to convert
  //   const pdf = new jsPDF('p', 'mm', 'a4'); // Initialize jsPDF with A4 page size
  //   const margin = 10; // Margin for the content in the PDF

  //   // Calculate available width and height for content in A4 size
  //   const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
  //   const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2;

  //   html2canvas(element, { scale: 2 })
  //     .then((canvas) => {
  //       const imageWidth = canvas.width;
  //       const imageHeight = canvas.height;

  //       // Scale the content to fit within the PDF page
  //       const scaleFactor = Math.min(
  //         pageWidth / imageWidth,
  //         pageHeight / imageHeight
  //       );
  //       const outputWidth = imageWidth * scaleFactor;
  //       const outputHeight = imageHeight * scaleFactor;

  //       const imgData = canvas.toDataURL('image/png'); // Convert canvas to image data
  //       pdf.addImage(imgData, 'PNG', margin, margin, outputWidth, outputHeight);

  //       // Trigger download
  //       pdf.save(`Monthly_Report.pdf`);
  //     })
  //     .catch((error) => {
  //       console.error('Error generating PDF:', error);
  //     });
  // }

  // downloadReport(): void {
  //   const pdf = new jsPDF('p', 'mm', 'a4'); // Initialize jsPDF with A4 page size
  //   const margin = 10; // Margin for the content
  //   let y = margin; // Vertical offset

  //   // Title Section
  //   pdf.setFontSize(16);
  //   pdf.setTextColor(0, 0, 0);
  //   pdf.text('Collection Officer Report', 105, y, { align: 'center' });

  //   y += 8; // Slight spacing below the title
  //   pdf.setFontSize(12);
  //   pdf.text('ID NO : biman1234', 105, y, { align: 'center' });

  //   y += 15; // Space before the details section

  //   // Info Section: Left and Right columns
  //   const leftColumnX = margin; // Left column position
  //   const rightColumnX = pdf.internal.pageSize.getWidth() - margin - 80; // Right column position (80 = width of the text)

  //   const leftDetails = [
  //     { label: 'From', value: this.fromDate },
  //     { label: 'EMP ID', value: this.officerData.empId },
  //     { label: 'First Name', value: this.officerData.firstNameEnglish },
  //     { label: 'Weight', value: this.finalTotalWeight },
  //   ];

  //   const rightDetails = [
  //     { label: 'To', value: this.toDate },
  //     { label: 'Role', value: this.officerData.jobRole },
  //     { label: 'Last Name', value: this.officerData.lastNameEnglish },
  //     { label: 'Farmers', value: this.finalTotalFarmers },
  //   ];

  //   // Render Left Column
  //   leftDetails.forEach((detail) => {
  //     pdf.text(`${detail.label} : ${detail.value}`, leftColumnX, y);
  //     y += 7;
  //   });

  //   // Reset y for Right Column
  //   y = margin + 23; // Align with the left column's first line
  //   rightDetails.forEach((detail) => {
  //     pdf.text(`${detail.label} : ${detail.value}`, rightColumnX, y);
  //     y += 7;
  //   });

  //   y += 10; // Space before the table

  //   // Table Section
  //   pdf.setFontSize(12);
  //   pdf.setDrawColor(0, 0, 0);
  //   pdf.setFillColor(230, 230, 230);

  //   const tableHeaders = ['Date', 'Total Weight', 'Total Farmers'];
  //   const tableData = [[this.fromDate, this.finalTotalWeight, this.calculateTotalFarmers]];

  //   // Table header
  //   pdf.rect(margin, y, 190, 10, 'F');
  //   tableHeaders.forEach((header, index) => {
  //     pdf.text(header, margin + index * 63.33 + 3, y + 7);
  //   });

  //   y += 10;

  //   // Table rows
  //   tableData.forEach((row) => {
  //     row.forEach((cell, index) => {
  //       pdf.text(cell, margin + index * 63.33 + 3, y + 7);
  //     });
  //     pdf.rect(margin, y, 190, 10);
  //     y += 10;
  //   });

  //   // Footer
  //   pdf.setFontSize(10);
  //   pdf.setTextColor(100);
  //   pdf.text(
  //     `This report is generated on ${new Date().toLocaleDateString()}, at ${new Date().toLocaleTimeString()}.`,
  //     margin,
  //     pdf.internal.pageSize.getHeight() - margin
  //   );

  //   // Save the PDF
  //   pdf.save('Collection_Officer_Report.pdf');
  // }

  downloadReport(): void {
    const pdf = new jsPDF('p', 'mm', 'a4'); // Initialize jsPDF with A4 page size
    const margin = 10; // Margin for the content
    let y = margin; // Vertical offset

    // Title Section
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Collection Officer Report', 105, y, { align: 'center' });

    y += 8; // Slight spacing below the title
    pdf.setFontSize(12);
    pdf.text(`ID NO : ${this.officerData.empId}`, 105, y, { align: 'center' });

    y += 15; // Space before the details section

    // Info Section
    pdf.setFontSize(10); // Reduce the font size for the info section
    const leftDetails = [
      { label: 'From', value: this.fromDate },
      { label: 'EMP ID', value: this.officerData.empId },
      { label: 'First Name', value: this.officerData.firstNameEnglish },
      { label: 'Weight', value: this.finalTotalWeight },
    ];

    const rightDetails = [
      { label: 'To', value: this.toDate },
      { label: 'Role', value: this.officerData.jobRole },
      { label: 'Last Name', value: this.officerData.lastNameEnglish },
      { label: 'Farmers', value: this.finalTotalFarmers },
    ];

    // Render details in two columns
    const leftColumnX = margin;
    const rightColumnX = pdf.internal.pageSize.getWidth() - margin - 80; // Adjust as needed

    leftDetails.forEach((detail) => {
      pdf.text(`${detail.label} : ${detail.value}`, leftColumnX, y);
      y += 7;
    });

    y = margin + 23; // Align with the left column
    rightDetails.forEach((detail) => {
      pdf.text(`${detail.label} : ${detail.value}`, rightColumnX, y);
      y += 7;
    });

    y += 10; // Space before the table

    // Reset font size for other sections
    pdf.setFontSize(12);

    // Table Section
    const tableHeaders = ['Date', 'Total Weight', 'Total Farmers'];
    const tableData = this.dailyReports.map((report) => [
      report.date,
      report.totalWeight,
      report.totalPayments,
    ]);

    const columnWidths = [60, 65, 65]; // Width for each column
    const tableX = margin; // Starting X position for the table
    const cellHeight = 10; // Height of each row

    // Draw Table Headers
    pdf.setFillColor(230, 230, 230);
    pdf.rect(
      tableX,
      y,
      columnWidths.reduce((a, b) => a + b),
      cellHeight,
      'F'
    ); // Outer border for header
    tableHeaders.forEach((header, i) => {
      const cellX =
        tableX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0); // X position of the cell
      const headerWidth = pdf.getTextWidth(header); // Width of the text
      const textX = cellX + (columnWidths[i] - headerWidth) / 2; // Center the text
      pdf.text(header, textX, y + 7); // Draw centered text
      pdf.rect(cellX, y, columnWidths[i], cellHeight); // Inner border for header cells
    });

    y += cellHeight; // Move to the next row

    // Draw Table Data
    tableData.forEach((row) => {
      row.forEach((cell, i) => {
        const cellX =
          tableX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0); // X position of the cell
        const cellContentWidth = pdf.getTextWidth(`${cell}`); // Width of the text
        const textX = cellX + (columnWidths[i] - cellContentWidth) / 2; // Center the text
        pdf.text(`${cell}`, textX, y + 7); // Cell text
        pdf.rect(cellX, y, columnWidths[i], cellHeight); // Cell border
      });
      y += cellHeight; // Move to the next row
    });

    // Outer Border for the Table
    pdf.rect(
      tableX,
      y - tableData.length * cellHeight - cellHeight, // Start Y
      columnWidths.reduce((a, b) => a + b), // Total table width
      (tableData.length + 1) * cellHeight // Total table height (including header)
    );

    // Footer
    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text(
      `This report is generated on ${new Date().toLocaleDateString()}, at ${new Date().toLocaleTimeString()}.`,
      margin,
      pdf.internal.pageSize.getHeight() - margin
    );

    // Save the PDF
    pdf.save('Collection_Officer_Report.pdf');
  }

  getOfficerDetails(id: number) {
    this.isLoading = true;
    this.visible = false;

    this.collectionoOfficer.getOfficerReportById(id).subscribe(
      (response: any) => {
        this.officerData = response.officerData[0];
        this.isLoading = false;
        this.visible = true;
      },
      (error) => {
        console.error('Error fetching officer details:', error);
        this.isLoading = false;
      }
    );
  }

  getCollectionReport(): void {
    this.isLoading = true;
    this.collectionoOfficer
      .getCollectionReportByOfficerId(
        this.fromDate,
        this.toDate,
        this.officerId
      )
      .subscribe(
        (response: any) => {
          this.dailyReports = response;
          this.calculateTotalWeight();
          this.calculateTotalFarmers();
          this.go = this.dailyReports && this.dailyReports.length > 0;
          const now = new Date();
          this.generatedTime = now.toLocaleTimeString();
          this.generatedDate = now.toLocaleDateString();
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching collection report:', error);
          this.isLoading = false;
        }
      );
  }

  calculateTotalWeight() {
    this.finalTotalWeight = this.dailyReports.reduce((sum, report) => {
      const weight = parseFloat(report.totalWeight);
      return !isNaN(weight) ? sum + weight : sum;
    }, 0);
  }

  calculateTotalFarmers() {
    this.finalTotalFarmers = this.dailyReports.reduce((sum, report) => {
      const farmers = parseInt(report.totalPayments); // Fixed key
      return !isNaN(farmers) ? sum + farmers : sum;
    }, 0);
  }
}
