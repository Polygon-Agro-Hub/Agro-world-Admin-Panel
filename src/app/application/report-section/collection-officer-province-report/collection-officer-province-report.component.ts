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
    const chartStartY = 70; // Increased from 60 to give more space for title
    const barHeight = 8;
    const gap = 2;
    const chartHeight = 100; // Fixed height for the chart area
    const chartWidth = 120; // Width of the bar area
    
    const colors = {
      gradeA: '#FF9263',
      gradeB: '#5F75E9',
      gradeC: '#3DE188',
    };

    // Title - Match the screenshot style
    doc.setFontSize(16);
    doc.setTextColor(102, 102, 102); // Gray color #666666
    doc.text(
      `${this.selectedProvince.name} - Crop Grade Report`,
      pageWidth / 2,
      25,
      { align: 'center' }
    );

    if (!this.reportDetails || this.reportDetails.length === 0) {
      doc.setFontSize(11);
      doc.text('No data available to display.', chartStartX, chartStartY);
      doc.save(`${this.selectedProvince.name}_Report.pdf`);
      this.isDownloading = false;
      return;
    }

    // Group data by crop
    const groupedData = this.reportDetails.map((crop) => ({
      cropName: crop.cropName,
      gradeA: crop.qtyA || 0,
      gradeB: crop.qtyB || 0,
      gradeC: crop.qtyC || 0,
      totalWeight: (crop.qtyA || 0) + (crop.qtyB || 0) + (crop.qtyC || 0),
    }));

    // Crop list on the left (y-axis labels)
    const cropNames = groupedData.map(crop => crop.cropName);
    const maxCropNameLength = Math.max(...cropNames.map(name => name.length));
    const cropNameAreaWidth = 35; // Fixed width for crop names
    
    // Calculate positions
    const totalBarsHeight = cropNames.length * (barHeight + gap);
    const barAreaStartY = chartStartY + (chartHeight - totalBarsHeight) / 2; // Center bars vertically
    const barAreaEndY = barAreaStartY + totalBarsHeight;
    
    // Draw y-axis line
    const yAxisX = chartStartX - 0.5; // X position for y-axis line
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(yAxisX, barAreaStartY - 5, yAxisX, barAreaEndY + 5); // Extended slightly above and below bars
    
    // Draw y-axis tick marks for each crop
    let currentBarY = barAreaStartY;
    cropNames.forEach((cropName, index) => {
      // Draw small tick mark on y-axis
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(yAxisX, currentBarY + barHeight / 2, yAxisX - 2, currentBarY + barHeight / 2);
      
      // Draw crop name
      doc.setFontSize(10);
      doc.setTextColor(102, 102, 102); // Gray color #666666
      doc.text(cropName, chartStartX - 10, currentBarY + barHeight / 2 + 2, { align: 'right' });
      
      currentBarY += barHeight + gap;
    });

    // Draw the horizontal bars
    currentBarY = barAreaStartY;
    
    // Find maximum total weight for scaling
    const maxWeight = Math.max(...groupedData.map(crop => crop.totalWeight));
    
    // Scale factor to fit within chartWidth
    const scaleFactor = chartWidth / maxWeight;
    
    // Draw bars for each crop
    groupedData.forEach((crop, index) => {
      let currentX = chartStartX;
      
      // Draw Grade C (first segment - appears on the left in horizontal bar)
      if (crop.gradeC > 0) {
        const segmentWidth = crop.gradeC * scaleFactor;
        doc.setFillColor(61, 225, 136); // #3DE188 - Grade C color
        doc.rect(currentX, currentBarY, segmentWidth, barHeight, 'F');
        currentX += segmentWidth;
      }
      
      // Draw Grade B
      if (crop.gradeB > 0) {
        const segmentWidth = crop.gradeB * scaleFactor;
        doc.setFillColor(95, 117, 233); // #5F75E9 - Grade B color
        doc.rect(currentX, currentBarY, segmentWidth, barHeight, 'F');
        currentX += segmentWidth;
      }
      
      // Draw Grade A
      if (crop.gradeA > 0) {
        const segmentWidth = crop.gradeA * scaleFactor;
        doc.setFillColor(255, 146, 99); // #FF9263 - Grade A color
        doc.rect(currentX, currentBarY, segmentWidth, barHeight, 'F');
        currentX += segmentWidth;
      }
      
      // Draw total weight label at the end of the bar
      if (crop.totalWeight > 0) {
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        const labelX = chartStartX + (crop.totalWeight * scaleFactor) + 2;
        doc.text(`${crop.totalWeight}kg`, labelX, currentBarY + barHeight / 2 + 1.5);
      }
      
      currentBarY += barHeight + gap;
    });

    // Draw x-axis line and labels
    const xAxisStartX = chartStartX;
    const xAxisEndX = chartStartX + chartWidth + 30; // Extra space for labels
    const xAxisY = barAreaStartY + totalBarsHeight + 5;
    
    // Draw x-axis line (connected to y-axis)
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(xAxisStartX, xAxisY, xAxisEndX, xAxisY);
    
    // Connect y-axis to x-axis
    doc.line(yAxisX, xAxisY, yAxisX, barAreaEndY + 5); // Extend y-axis down to x-axis
    
    // Draw x-axis labels (0 to maxWeight with increments)
    doc.setFontSize(8);
    doc.setTextColor(102, 102, 102);
    
    // Calculate tick intervals
    const maxTickValue = Math.ceil(maxWeight / 100) * 100;
    const tickCount = Math.min(8, Math.ceil(maxTickValue / 100));
    
    for (let i = 0; i <= tickCount; i++) {
      const tickValue = (maxTickValue / tickCount) * i;
      const tickX = chartStartX + (tickValue * scaleFactor);
      
      // Draw tick mark on x-axis
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(tickX, xAxisY, tickX, xAxisY + 2);
      
      // Draw label
      const labelText = tickValue === 0 ? '0' : tickValue.toLocaleString();
      doc.text(labelText, tickX, xAxisY + 6, { align: 'center' });
    }
    
    // Draw x-axis title
    doc.setFontSize(10);
    doc.text('Total Weight (kg)', xAxisStartX + (chartWidth / 2), xAxisY + 15, { align: 'center' });

    // Draw legend
    const legendY = chartStartY - 15;
    const legendSquareSize = 6;
    
    // Grade C
    doc.setFillColor(61, 225, 136);
    doc.rect(chartStartX, legendY, legendSquareSize, legendSquareSize, 'F');
    doc.setFontSize(9);
    doc.setTextColor(102, 102, 102);
    doc.text('Grade C', chartStartX + legendSquareSize + 3, legendY + legendSquareSize/2 + 1);
    
    // Grade B
    const legendBX = chartStartX + 45;
    doc.setFillColor(95, 117, 233);
    doc.rect(legendBX, legendY, legendSquareSize, legendSquareSize, 'F');
    doc.text('Grade B', legendBX + legendSquareSize + 3, legendY + legendSquareSize/2 + 1);
    
    // Grade A
    const legendCX = legendBX + 45;
    doc.setFillColor(255, 146, 99);
    doc.rect(legendCX, legendY, legendSquareSize, legendSquareSize, 'F');
    doc.text('Grade A', legendCX + legendSquareSize + 3, legendY + legendSquareSize/2 + 1);

    // Summary Table
    const tableStartY = xAxisY + 30;
    const cellHeight = 8;
    const tableColWidths = [40, 30, 30, 30, 30];
    const tableStartX = (pageWidth - 160) / 2; // Center the table
    let rowY = tableStartY;

    const headers = ['Crop', 'Grade A', 'Grade B', 'Grade C', 'Total'];
    doc.setFontSize(9);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    
    // Draw header row
    let cellX = tableStartX;
    headers.forEach((header, index) => {
      doc.setFillColor(245, 245, 245);
      doc.setTextColor(102, 102, 102);
      doc.rect(cellX, rowY, tableColWidths[index], cellHeight, 'FD');
      doc.text(header, cellX + tableColWidths[index] / 2, rowY + 5, { align: 'center' });
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
        doc.text(value, cellX + tableColWidths[index] / 2, rowY + 5, { align: 'center' });
        cellX += tableColWidths[index];
      });

      rowY += cellHeight;
    });

    // Footer
    const footerY = pageHeight - 10;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    const date = new Date().toLocaleDateString();
    doc.text(`Generated on ${date}`, pageWidth / 2, footerY, { align: 'center' });

    doc.save(`${this.selectedProvince.name}_CropGradeReport.pdf`);
    this.isDownloading = false;
  }, 0);
}
}
