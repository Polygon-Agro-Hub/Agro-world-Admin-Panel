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
import { CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-monthly-report',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, CalendarModule],
  templateUrl: './monthly-report.component.html',
  styleUrl: './monthly-report.component.css',
})
export class MonthlyReportComponent implements OnInit {
  @ViewChild('contentToConvert', { static: false })
  contentToConvert!: ElementRef;
  fromDate: Date | null = null;
  toDate: Date | null = null;
  officerId!: number;
  officerData: any;
  dailyReports: any[] = [];
  generatedTime: string = '';
  generatedDate: string = '';
  finalTotalWeight: number = 0;
  finalTotalFarmers: number = 0;
  isLoading: boolean = true;
  isDownloading: boolean = false;
  visible: boolean = false;
  maxDate: string = '';
  hasData: boolean = false;
  go: boolean = false;
  todayDate: Date;
  isToDateDisabled: boolean = true;
  isGoButtonDisabled: boolean = true;

  constructor(
    private collectionoOfficer: CollectionCenterService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { 
    this.todayDate = new Date();
  }

  ngOnInit() {
    this.officerId = this.route.snapshot.params['id'];
    this.getOfficerDetails(this.officerId);
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
    this.visible = false;
    
    // Initialize with disabled state
    this.isToDateDisabled = true;
    this.isGoButtonDisabled = true;
  }

  clearReportData(): void {
    this.dailyReports = [];
    this.finalTotalWeight = 0;
    this.finalTotalFarmers = 0;
    this.generatedTime = '';
    this.generatedDate = '';
    this.go = false;
  }

  onFromDateChange() {
    // Enable To date field when From date is selected
    this.isToDateDisabled = !this.fromDate;
    
    // Enable Go button only when both dates are selected
    this.isGoButtonDisabled = !(this.fromDate && this.toDate);
    
    // Clear data if From date is cleared
    if (!this.fromDate) {
      this.clearReportData();
    }
  }

  onToDateChange() {
    // Enable Go button only when both dates are selected
    this.isGoButtonDisabled = !(this.fromDate && this.toDate);
    
    // Clear data if To date is cleared
    if (!this.toDate) {
      this.clearReportData();
    }
  }

  async downloadReport(): Promise<void> {
    if (this.dailyReports.length === 0) {
      return;
    }

    this.isDownloading = true;

    setTimeout(async () => {
      try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const margin = 10;
        let y = margin;

        // Title Section
        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Collection Officer Report', 105, y, { align: 'center' });

        y += 8;
        pdf.setFontSize(12);
        pdf.text(`ID NO : ${this.officerData.empId}`, 105, y, { align: 'center' });

        y += 15;

        // Info Section
        pdf.setFontSize(10);
        const leftDetails = [
          { label: 'From', value: this.formatDateForDisplay(this.fromDate) },
          { label: 'EMP ID', value: this.officerData.empId },
          { label: 'First Name', value: this.officerData.firstNameEnglish },
          { label: 'Weight', value: this.finalTotalWeight + ' Kg' },
        ];

        const rightDetails = [
          { label: 'To', value: this.formatDateForDisplay(this.toDate) },
          { label: 'Role', value: this.officerData.jobRole },
          { label: 'Last Name', value: this.officerData.lastNameEnglish },
          { label: 'Collections', value: this.finalTotalFarmers.toString() },
        ];

        const leftColumnX = margin;
        const rightColumnX = pdf.internal.pageSize.getWidth() - margin - 80;

        leftDetails.forEach((detail) => {
          pdf.text(`${detail.label} : ${detail.value}`, leftColumnX, y);
          y += 7;
        });

        y = margin + 23;
        rightDetails.forEach((detail) => {
          pdf.text(`${detail.label} : ${detail.value}`, rightColumnX, y);
          y += 7;
        });

        y += 10;

        // Table Section
        pdf.setFontSize(12);
        const tableHeaders = ['Date', 'Total Weight', 'Total Collections'];
        const tableData = this.dailyReports.map((report) => [
          this.formatDateForDisplay(report.date),
          report.totalWeight + ' Kg',
          report.totalPayments,
        ]);

        const columnWidths = [60, 65, 65];
        const tableX = margin;
        const cellHeight = 10;

        // Draw Table Headers
        pdf.setFillColor(230, 230, 230);
        pdf.rect(
          tableX,
          y,
          columnWidths.reduce((a, b) => a + b),
          cellHeight,
          'F'
        );

        tableHeaders.forEach((header, i) => {
          const cellX = tableX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
          const headerWidth = pdf.getTextWidth(header);
          const textX = cellX + (columnWidths[i] - headerWidth) / 2;
          pdf.text(header, textX, y + 7);
          pdf.rect(cellX, y, columnWidths[i], cellHeight);
        });

        y += cellHeight;

        // Draw Table Data
        tableData.forEach((row) => {
          row.forEach((cell, i) => {
            const cellX = tableX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
            const cellContentWidth = pdf.getTextWidth(`${cell}`);
            const textX = cellX + (columnWidths[i] - cellContentWidth) / 2;
            pdf.text(`${cell}`, textX, y + 7);
            pdf.rect(cellX, y, columnWidths[i], cellHeight);
          });
          y += cellHeight;
        });

        // Outer Border for the Table
        pdf.rect(
          tableX,
          y - tableData.length * cellHeight - cellHeight,
          columnWidths.reduce((a, b) => a + b),
          (tableData.length + 1) * cellHeight
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
      } catch (error) {
        console.error('Error generating PDF:', error);
      } finally {
        this.isDownloading = false;
      }
    }, 0);
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
    if (!this.fromDate || !this.toDate) {
      return;
    }

    this.isLoading = true;
    this.collectionoOfficer
      .getCollectionReportByOfficerId(
        this.convertToISO(this.fromDate),
        this.convertToISO(this.toDate),
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
          this.clearReportData();
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
      const farmers = parseInt(report.totalPayments);
      return !isNaN(farmers) ? sum + farmers : sum;
    }, 0);
  }

  back(): void {
    this.router.navigate(['/reports/collective-officer-report']);
  }

  convertToISO(date: any): string {
    if (date instanceof Date) {
      const utcDate = new Date(Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      ));
      return utcDate.toISOString();
    } else if (typeof date === 'string') {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        const utcDate = new Date(Date.UTC(
          parsedDate.getFullYear(),
          parsedDate.getMonth(),
          parsedDate.getDate()
        ));
        return utcDate.toISOString();
      }
    }
    return date;
  }

  formatDateForDisplay(date: any): string {
    if (!date) return '';

    let dateObj: Date;

    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return '';
    } else {
      return '';
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    return `${month}/${day}/${year}`;
  }
}