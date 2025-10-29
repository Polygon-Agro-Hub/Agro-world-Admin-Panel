import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { CollectionOfficerReportService } from '../../../services/collection-officer/collection-officer-report.service';
import { CommonModule } from '@angular/common';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import jsPDF from 'jspdf';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';

interface IdistrictReport {
  cropName: string;
  district: string;
  qtyA: number;
  qtyB: number;
  qtyC: number;
  priceA: number;
  priceB: number;
  priceC: number;
}

@Component({
  selector: 'app-collectionofficer-district-report',
  standalone: true,
  imports: [
    DropdownModule,
    NgxPaginationModule,
    FormsModule,
    CommonModule,
    CanvasJSAngularChartsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './collectionofficer-district-report.component.html',
  styleUrls: ['./collectionofficer-district-report.component.css'],
})
export class CollectionofficerDistrictReportComponent implements OnInit {
  districts: any[] = [];
  selectedDistrict: any = { name: 'Colombo', code: 'COL' };
  reportDetails: IdistrictReport[] = [];
  chartOptions: any;
  loadingChart = true;
  loadingTable = true;
  isDownloading = false;
  

  constructor(
    private collectionOfficerSrv: CollectionOfficerReportService,
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.districts = [
      { name: 'Ampara', code: 'AMP' },
      { name: 'Anuradhapura', code: 'ANU' },
      { name: 'Badulla', code: 'BAD' },
      { name: 'Batticaloa', code: 'BAT' },
      { name: 'Colombo', code: 'COL' },
      { name: 'Galle', code: 'GAL' },
      { name: 'Gampaha', code: 'GAM' },
      { name: 'Hambantota', code: 'HAM' },
      { name: 'Jaffna', code: 'JAF' },
      { name: 'Kalutara', code: 'KAL' },
      { name: 'Kandy', code: 'KAN' },
      { name: 'Kegalle', code: 'KEG' },
      { name: 'Kilinochchi', code: 'KIL' },
      { name: 'Kurunegala', code: 'KUR' },
      { name: 'Mannar', code: 'MAN' },
      { name: 'Matale', code: 'MAT' },
      { name: 'Matara', code: 'MTR' },
      { name: 'Moneragala', code: 'MON' },
      { name: 'Mullaitivu', code: 'MUL' },
      { name: 'Nuwara Eliya', code: 'NUE' },
      { name: 'Polonnaruwa', code: 'POL' },
      { name: 'Puttalam', code: 'PUT' },
      { name: 'Rathnapura', code: 'RAT' },
      { name: 'Trincomalee', code: 'TRI' },
      { name: 'Vavuniya', code: 'VAV' },
    ];
    this.fetchAllDistrictReportDetails(this.selectedDistrict.name);
  }

  fetchAllDistrictReportDetails(district: string) {
    this.loadingChart = true;
    this.loadingTable = true;
    this.collectionOfficerSrv.getDistrictReport(district).subscribe(
      (response) => {
        this.reportDetails = response.map((item) => ({
          ...item,
          qtyA: Number(item.qtyA) || 0,
          qtyB: Number(item.qtyB) || 0,
          qtyC: Number(item.qtyC) || 0,
        }));
        this.loadingTable = false;
        this.updateChart();
      },
      (error) => {}
    );
  }

  back(): void {
    this.router.navigate(['reports']);
  }

  applyFilters() {
    if (this.selectedDistrict) {
      this.fetchAllDistrictReportDetails(this.selectedDistrict.name);
    }
  }

  updateChart() {
    const gradeAData = this.reportDetails.map((crop) => ({
      label: crop.cropName,
      y: crop.qtyA || 0,
      color: '#FF9263',
    }));

    const gradeBData = this.reportDetails.map((crop) => ({
      label: crop.cropName,
      y: crop.qtyB || 0,
      color: '#5F75E9',
    }));

    const gradeCData = this.reportDetails.map((crop) => ({
      label: crop.cropName,
      y: crop.qtyC || 0,
      color: '#3DE188',
    }));

    const isDarkMode = this.themeService.isDarkTheme();

    this.chartOptions = {
      animationEnabled: true,
      // theme: isDarkMode ? 'dark2' : 'light2',
      backgroundColor: "transparent", // Changed to transparent
      title: {
        text: `${this.selectedDistrict.name} - Crop Weights`,
        fontColor: '#666666',
      },
      axisX: {
        title: 'Crops',
        reversed: true,
        titleFontColor: '#666666',
        labelFontColor: '#666666',
        lineColor: isDarkMode ? '#4b5563' : '#d1d5db',
        tickColor: isDarkMode ? '#4b5563' : '#d1d5db',
      },
      axisY: {
        title: 'Total Weight (Kg)',
        includeZero: true,
        titleFontColor: '#666666',
        labelFontColor: '#666666',
        lineColor: isDarkMode ? '#4b5563' : '#d1d5db',
        tickColor: isDarkMode ? '#4b5563' : '#d1d5db',
        gridColor: isDarkMode ? '#374151' : '#e5e7eb',
      },
      legend: {
        fontColor: '#666666',
      },
      toolTip: {
        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
        fontColor: '#666666',
        borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
      },
      data: [
        {
          type: 'stackedBar',
          name: 'Grade A',
          showInLegend: true,
          dataPoints: gradeAData,
          color: '#FF9263',
        },
        {
          type: 'stackedBar',
          name: 'Grade B',
          showInLegend: true,
          dataPoints: gradeBData,
          color: '#5F75E9',
        },
        {
          type: 'stackedBar',
          name: 'Grade C',
          showInLegend: true,
          dataPoints: gradeCData,
          color: '#3DE188',
        },
      ],
    };
    this.loadingChart = false;
  }

  async exportToPDF(): Promise<void> {
    this.isDownloading = true;

    setTimeout(() => {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const startX = 30;
      const startY = 30;
      const barHeight = 10;
      const gap = 15;
      const chartWidth = 140;
      const titleFontSize = 14;
      const contentFontSize = 10;
      const colors = {
        gradeA: '#FF9263',
        gradeB: '#5F75E9',
        gradeC: '#3DE188',
      };

      doc.setFontSize(titleFontSize);
      doc.text(
        `${this.selectedDistrict.name} - Crop Grade Report`,
        pageWidth / 2,
        20,
        { align: 'center' }
      );

      if (!this.reportDetails || this.reportDetails.length === 0) {
        doc.setFontSize(contentFontSize);
        doc.text('No data available to display.', startX, startY);
        doc.save(`${this.selectedDistrict.name}_Report.pdf`);
        this.isDownloading = false;
        return;
      }

      const groupedData = this.reportDetails.map((crop) => ({
        cropName: crop.cropName,
        gradeA: crop.qtyA || 0,
        gradeB: crop.qtyB || 0,
        gradeC: crop.qtyC || 0,
        totalWeight: (crop.qtyA || 0) + (crop.qtyB || 0) + (crop.qtyC || 0),
      }));

      const maxWeight = Math.max(
        ...groupedData.map((crop) => crop.totalWeight)
      );

      let currentY = startY;
      groupedData.forEach((crop) => {
        let currentX = startX;
        const labelYOffset = currentY + barHeight / 2 + 3;

        doc.setFontSize(contentFontSize);
        doc.setTextColor(0, 0, 0);
        doc.text(crop.cropName, startX - 20, labelYOffset);

        (['A', 'B', 'C'] as const).forEach((grade) => {
          const gradeKey = `grade${grade}` as 'gradeA' | 'gradeB' | 'gradeC';
          const gradeWeight = crop[gradeKey];
          if (gradeWeight > 0) {
            const barWidth = (gradeWeight / maxWeight) * chartWidth;
            doc.setFillColor(colors[gradeKey]);
            doc.rect(currentX, currentY, barWidth, barHeight, 'F');
            currentX += barWidth;
          }
        });

        currentY += gap;
      });

      const tableStartY = currentY + 20;
      const cellPadding = 5;
      const cellHeight = 8;
      const tableColWidths = [50, 30, 30, 30, 30];
      let rowY = tableStartY;

      const headers = ['Crop', 'Grade A', 'Grade B', 'Grade C', 'Total'];
      doc.setFontSize(contentFontSize);
      doc.setTextColor(0, 0, 0);
      headers.forEach((header, index) => {
        const cellX =
          startX + tableColWidths.slice(0, index).reduce((a, b) => a + b, 0);
        doc.rect(cellX, rowY, tableColWidths[index], cellHeight);
        doc.text(header, cellX + cellPadding, rowY + cellHeight / 2 + 3);
      });

      rowY += cellHeight;

      groupedData.forEach((crop) => {
        const cropValues = [
          crop.cropName,
          crop.gradeA ? `${crop.gradeA} kg` : '-',
          crop.gradeB ? `${crop.gradeB} kg` : '-',
          crop.gradeC ? `${crop.gradeC} kg` : '-',
          `${crop.totalWeight} kg`,
        ];

        cropValues.forEach((value, index) => {
          const cellX =
            startX + tableColWidths.slice(0, index).reduce((a, b) => a + b, 0);
          doc.rect(cellX, rowY, tableColWidths[index], cellHeight);
          doc.text(value, cellX + cellPadding, rowY + cellHeight / 2 + 3);
        });

        rowY += cellHeight;
      });

      doc.save(`${this.selectedDistrict.name}_CropGradeReport.pdf`);
      this.isDownloading = false;
    }, 0);
  }
}
