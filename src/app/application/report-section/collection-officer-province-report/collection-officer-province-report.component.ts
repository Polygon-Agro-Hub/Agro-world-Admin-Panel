import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { CollectionOfficerReportService } from '../../../services/collection-officer/collection-officer-report.service';
import jsPDF from 'jspdf';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';

interface IProvinceReport {
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
  selector: 'app-collection-officer-province-report',
  standalone: true,
  imports: [
    DropdownModule,
    NgxPaginationModule,
    FormsModule,
    CommonModule,
    CanvasJSAngularChartsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './collection-officer-province-report.component.html',
  styleUrl: './collection-officer-province-report.component.css',
})
export class CollectionOfficerProvinceReportComponent implements OnInit {
  province: any[] = [];
  selectedProvince: any = { name: 'Western', code: 'WEST' };
  reportDetails: IProvinceReport[] = [];
  chartOptions: any;
  loadingChart = true;
  loadingTable = true;
  isDownloading = false;

  constructor(
    private collectionOfficerSrv: CollectionOfficerReportService,
    private router: Router,
    private themeService: ThemeService
  ) {}

  back(): void {
    this.router.navigate(['reports']);
  }

  ngOnInit(): void {
    this.province = [
      { name: 'Western', code: 'WEST' },
      { name: 'Central', code: 'CENT' },
      { name: 'Southern', code: 'SOUTH' },
      { name: 'Northern', code: 'NORTH' },
      { name: 'Eastern', code: 'EAST' },
      { name: 'North Western', code: 'NW' },
      { name: 'North Central', code: 'NC' },
      { name: 'Uva', code: 'UVA' },
      { name: 'Sabaragamuwa', code: 'SAB' },
    ];

    this.fetchAllProvinceReportDetails(this.selectedProvince.name);
  }

  fetchAllProvinceReportDetails(district: string) {
    this.loadingChart = true;
    this.loadingTable = true;

    this.collectionOfficerSrv.getProvinceReport(district).subscribe(
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

  applyFilters() {
    if (this.selectedProvince) {
      this.fetchAllProvinceReportDetails(this.selectedProvince.name);
    }
  }

  updateChart() {
    this.chartOptions = null;

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
      backgroundColor: "transparent",
      // theme: 'light2',
      title: {
        text: `${this.selectedProvince.name} - Crop Weights`,
        fontColor: isDarkMode ? '#ffffff' : '#000000',
        
      },
      axisX: {
        title: 'Crops',
        reversed: true,
        titleFontColor: isDarkMode ? '#ffffff' : '#000000',
        labelFontColor: isDarkMode ? '#d1d5db' : '#374151',
        lineColor: isDarkMode ? '#4b5563' : '#d1d5db',
        tickColor: isDarkMode ? '#4b5563' : '#d1d5db',
        
      },
      axisY: {
        title: 'Total Weight (Kg)',
        includeZero: true,
        titleFontColor: isDarkMode ? '#ffffff' : '#000000',
        labelFontColor: isDarkMode ? '#d1d5db' : '#374151',
        lineColor: isDarkMode ? '#4b5563' : '#d1d5db',
        tickColor: isDarkMode ? '#4b5563' : '#d1d5db',
        gridColor: isDarkMode ? '#374151' : '#e5e7eb',
      },
      legend: {
        fontColor: isDarkMode ? '#d1d5db' : '#374151',
      },
      toolTip: {
        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
        fontColor: isDarkMode ? '#ffffff' : '#374151',
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

  // async exportToPDF(): Promise<void> {
  //   this.isDownloading = true;

  //   setTimeout(() => {
  //     const doc = new jsPDF('p', 'mm', 'a4');
  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     const startX = 30;
  //     const startY = 30;
  //     const barHeight = 10;
  //     const gap = 15;
  //     const chartWidth = 140;
  //     const titleFontSize = 14;
  //     const contentFontSize = 10;
  //     const colors = {
  //       gradeA: '#FF9263',
  //       gradeB: '#5F75E9',
  //       gradeC: '#3DE188',
  //     };

  //     doc.setFontSize(titleFontSize);
  //     doc.text(
  //       `${this.selectedProvince.name} - Crop Grade Report`,
  //       pageWidth / 2,
  //       20,
  //       { align: 'center' }
  //     );

  //     if (!this.reportDetails || this.reportDetails.length === 0) {
  //       doc.setFontSize(contentFontSize);
  //       doc.text('No data available to display.', startX, startY);
  //       doc.save(`${this.selectedProvince.name}_Report.pdf`);
  //       this.isDownloading = false;
  //       return;
  //     }

  //     const groupedData = this.reportDetails.map((crop) => ({
  //       cropName: crop.cropName,
  //       gradeA: crop.qtyA || 0,
  //       gradeB: crop.qtyB || 0,
  //       gradeC: crop.qtyC || 0,
  //       totalWeight: (crop.qtyA || 0) + (crop.qtyB || 0) + (crop.qtyC || 0),
  //     }));

  //     const maxWeight = Math.max(
  //       ...groupedData.map((crop) => crop.totalWeight)
  //     );

  //     let currentY = startY;
  //     groupedData.forEach((crop) => {
  //       let currentX = startX;
  //       const labelYOffset = currentY + barHeight / 2 + 3;

  //       doc.setFontSize(contentFontSize);
  //       doc.setTextColor(0, 0, 0);
  //       doc.text(crop.cropName, startX - 20, labelYOffset);

  //       (['A', 'B', 'C'] as const).forEach((grade) => {
  //         const gradeKey = `grade${grade}` as 'gradeA' | 'gradeB' | 'gradeC';
  //         const gradeWeight = crop[gradeKey];
  //         if (gradeWeight > 0) {
  //           const barWidth = (gradeWeight / maxWeight) * chartWidth;
  //           doc.setFillColor(colors[gradeKey]);
  //           doc.rect(currentX, currentY, barWidth, barHeight, 'F');
  //           doc.setTextColor(255, 255, 255);
  //           doc.setFontSize(8);
  //           doc.text(
  //             `${gradeWeight} kg`,
  //             currentX + barWidth / 2,
  //             currentY + barHeight / 2 + 3,
  //             { align: 'center' }
  //           );
  //           currentX += barWidth;
  //         }
  //       });

  //       currentY += gap;
  //     });

  //     const tableStartY = currentY + 20;
  //     const cellPadding = 5;
  //     const cellHeight = 8;
  //     const tableColWidths = [50, 30, 30, 30, 30];
  //     let rowY = tableStartY;

  //     const headers = ['Crop', 'Grade A', 'Grade B', 'Grade C', 'Total'];
  //     doc.setFontSize(contentFontSize);
  //     doc.setTextColor(0, 0, 0);
  //     headers.forEach((header, index) => {
  //       const cellX =
  //         startX + tableColWidths.slice(0, index).reduce((a, b) => a + b, 0);
  //       doc.rect(cellX, rowY, tableColWidths[index], cellHeight);
  //       doc.text(header, cellX + cellPadding, rowY + cellHeight / 2 + 3);
  //     });

  //     rowY += cellHeight;

  //     groupedData.forEach((crop) => {
  //       const cropValues = [
  //         crop.cropName,
  //         crop.gradeA ? `${crop.gradeA} kg` : '-',
  //         crop.gradeB ? `${crop.gradeB} kg` : '-',
  //         crop.gradeC ? `${crop.gradeC} kg` : '-',
  //         `${crop.totalWeight} kg`,
  //       ];

  //       cropValues.forEach((value, index) => {
  //         const cellX =
  //           startX + tableColWidths.slice(0, index).reduce((a, b) => a + b, 0);
  //         doc.rect(cellX, rowY, tableColWidths[index], cellHeight);
  //         doc.text(value, cellX + cellPadding, rowY + cellHeight / 2 + 3);
  //       });

  //       rowY += cellHeight;
  //     });

  //     doc.save(`${this.selectedProvince.name}_CropGradeReport.pdf`);
  //     this.isDownloading = false;
  //   }, 0);
  // }

  async exportToPDF(): Promise<void> {
  this.isDownloading = true;

  setTimeout(() => {
    const doc = new jsPDF('p', 'mm', 'a4'); // Portrait
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    const margin = 20;
    const chartStartX = 50;
    const chartStartY = 60;
    const barHeight = 8;
    const gap = 2;
    const chartWidth = 130;
    
    const colors = {
      gradeA: '#FF9263',
      gradeB: '#5F75E9',
      gradeC: '#3DE188',
    };

    // Title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text(
      `${this.selectedProvince.name} - Crop Grade Report`,
      pageWidth / 2,
      20,
      { align: 'center' }
    );

    if (!this.reportDetails || this.reportDetails.length === 0) {
      doc.setFontSize(11);
      doc.text('No data available to display.', chartStartX, chartStartY);
      doc.save(`${this.selectedProvince.name}_Report.pdf`);
      this.isDownloading = false;
      return;
    }

    // Draw Color Legend - Centered with smaller squares
    const legendY = 35;
    const legendSquareSize = 4;
    const legendItemSpacing = 18;
    const totalLegendWidth = (legendSquareSize * 3) + (legendItemSpacing * 2) + (3 * 2); // squares + spacing + text spacing
    const legendStartX = (pageWidth - totalLegendWidth) / 2;

    doc.setFontSize(10);
    
    // Grade A
    doc.setFillColor(255, 146, 99);
    doc.rect(legendStartX, legendY, legendSquareSize, legendSquareSize, 'F');
    doc.setTextColor(0, 0, 0);
    doc.text('A', legendStartX + legendSquareSize + 2, legendY + 3.5);

    // Grade B
    const legendBX = legendStartX + legendSquareSize + 2 + 3 + legendItemSpacing;
    doc.setFillColor(95, 117, 233);
    doc.rect(legendBX, legendY, legendSquareSize, legendSquareSize, 'F');
    doc.text('B', legendBX + legendSquareSize + 2, legendY + 3.5);

    // Grade C
    const legendCX = legendBX + legendSquareSize + 2 + 3 + legendItemSpacing;
    doc.setFillColor(61, 225, 136);
    doc.rect(legendCX, legendY, legendSquareSize, legendSquareSize, 'F');
    doc.text('C', legendCX + legendSquareSize + 2, legendY + 3.5);

    const groupedData = this.reportDetails.map((crop) => ({
      cropName: crop.cropName,
      gradeA: crop.qtyA || 0,
      gradeB: crop.qtyB || 0,
      gradeC: crop.qtyC || 0,
      totalWeight: (crop.qtyA || 0) + (crop.qtyB || 0) + (crop.qtyC || 0),
    }));

    const maxWeight = Math.max(...groupedData.map((crop) => crop.totalWeight));
    const chartHeight = groupedData.length * (barHeight + gap);
    const chartEndY = chartStartY + chartHeight;

    // Y-axis
    const yAxisX = chartStartX;
    const yAxisTop = chartStartY - 10;
    const yAxisBottom = chartEndY + 5;
    
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(yAxisX, yAxisBottom, yAxisX, yAxisTop);
    
    // Y-axis arrow
    doc.line(yAxisX, yAxisTop, yAxisX - 2, yAxisTop + 3);
    doc.line(yAxisX, yAxisTop, yAxisX + 2, yAxisTop + 3);
    
    // Y-axis label - aligned with arrow end
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text('Crop Variety', 20, yAxisTop + 1, { align: 'left' });

    // Draw bars
    let currentY = chartStartY;
    doc.setFontSize(10);
    
    groupedData.forEach((crop) => {
      // Crop name on left - aligned at x=20
      doc.setTextColor(50, 50, 50);
      doc.text(crop.cropName, 20, currentY + barHeight / 2 + 1.5, { align: 'left' });

      let currentX = chartStartX;
      
      // Grade A bar
      if (crop.gradeA > 0) {
        const barWidth = (crop.gradeA / maxWeight) * chartWidth;
        doc.setFillColor(255, 146, 99);
        doc.rect(currentX, currentY, barWidth, barHeight, 'F');
        currentX += barWidth;
      }
      
      // Grade B bar
      if (crop.gradeB > 0) {
        const barWidth = (crop.gradeB / maxWeight) * chartWidth;
        doc.setFillColor(95, 117, 233);
        doc.rect(currentX, currentY, barWidth, barHeight, 'F');
        currentX += barWidth;
      }
      
      // Grade C bar
      if (crop.gradeC > 0) {
        const barWidth = (crop.gradeC / maxWeight) * chartWidth;
        doc.setFillColor(61, 225, 136);
        doc.rect(currentX, currentY, barWidth, barHeight, 'F');
        currentX += barWidth;
      }

      currentY += barHeight + gap;
    });

    // X-axis
    const xAxisY = chartEndY + 5;
    const xAxisEnd = chartStartX + chartWidth + 8;
    
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(chartStartX, xAxisY, xAxisEnd, xAxisY);
    
    // X-axis arrow
    doc.line(xAxisEnd, xAxisY, xAxisEnd - 3, xAxisY - 2);
    doc.line(xAxisEnd, xAxisY, xAxisEnd - 3, xAxisY + 2);
    
    // X-axis label
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text('kg', xAxisEnd + 3, xAxisY + 1);

    // Summary Table
    const tableStartY = chartEndY + 20;
    const cellHeight = 10;
    // Table width should match the x-axis length (from chartStartX to xAxisEnd)
    const tableWidth = xAxisEnd - chartStartX;
    const tableColWidths = [tableWidth * 0.25, tableWidth * 0.1875, tableWidth * 0.1875, tableWidth * 0.1875, tableWidth * 0.1875];
    const tableStartX = chartStartX;
    let rowY = tableStartY;

    const headers = ['Crop Variety', 'Grade A', 'Grade B', 'Grade C', 'Total'];
    doc.setFontSize(9);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    
    // Draw header row
    let cellX = tableStartX;
    headers.forEach((header, index) => {
      doc.setFillColor(255, 255, 255);
      doc.setTextColor(0, 0, 0);
      doc.rect(cellX, rowY, tableColWidths[index], cellHeight, 'S');
      doc.text(header, cellX + tableColWidths[index] / 2, rowY + 6.5, { align: 'center' });
      cellX += tableColWidths[index];
    });

    rowY += cellHeight;

    // Draw data rows
    groupedData.forEach((crop) => {
      const values = [
        crop.cropName,
        crop.gradeA ? `${crop.gradeA}kg` : '-',
        crop.gradeB ? `${crop.gradeB}kg` : '-',
        crop.gradeC ? `${crop.gradeC}kg` : '-',
        `${crop.totalWeight}kg`,
      ];

      cellX = tableStartX;
      values.forEach((value, index) => {
        doc.setTextColor(0, 0, 0);
        doc.rect(cellX, rowY, tableColWidths[index], cellHeight, 'S');
        doc.text(value, cellX + tableColWidths[index] / 2, rowY + 6.5, { align: 'center' });
        cellX += tableColWidths[index];
      });

      rowY += cellHeight;
    });

    doc.save(`${this.selectedProvince.name}_CropGradeReport.pdf`);
    this.isDownloading = false;
  }, 0);
}
}
