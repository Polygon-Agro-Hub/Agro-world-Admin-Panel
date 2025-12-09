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
        titleFontColor: '#738AC0',
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
      `${this.selectedDistrict.name} - Crop Weights`,
      pageWidth / 2,
      25,
      { align: 'center' }
    );

    if (!this.reportDetails || this.reportDetails.length === 0) {
      doc.setFontSize(11);
      doc.text('No data available to display.', chartStartX, chartStartY);
      doc.save(`${this.selectedDistrict.name}_Report.pdf`);
      this.isDownloading = false;
      return;
    }

    // Crop list on the left (y-axis labels)
    const cropNames = this.reportDetails.map(crop => crop.cropName);
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
    const maxWeight = Math.max(...this.reportDetails.map(crop => 
      (crop.qtyA || 0) + (crop.qtyB || 0) + (crop.qtyC || 0)
    ));
    
    // Scale factor to fit within chartWidth
    const scaleFactor = chartWidth / maxWeight;
    
    // Draw bars for each crop
    this.reportDetails.forEach((crop, index) => {
      const totalWeight = (crop.qtyA || 0) + (crop.qtyB || 0) + (crop.qtyC || 0);
      
      let currentX = chartStartX;
      
      // Draw Grade C (first segment - appears on the left in horizontal bar)
      if (crop.qtyC > 0) {
        const segmentWidth = crop.qtyC * scaleFactor;
        doc.setFillColor(61, 225, 136); // #3DE188 - Grade C color
        doc.rect(currentX, currentBarY, segmentWidth, barHeight, 'F');
        currentX += segmentWidth;
      }
      
      // Draw Grade B
      if (crop.qtyB > 0) {
        const segmentWidth = crop.qtyB * scaleFactor;
        doc.setFillColor(95, 117, 233); // #5F75E9 - Grade B color
        doc.rect(currentX, currentBarY, segmentWidth, barHeight, 'F');
        currentX += segmentWidth;
      }
      
      // Draw Grade A
      if (crop.qtyA > 0) {
        const segmentWidth = crop.qtyA * scaleFactor;
        doc.setFillColor(255, 146, 99); // #FF9263 - Grade A color
        doc.rect(currentX, currentBarY, segmentWidth, barHeight, 'F');
        currentX += segmentWidth;
      }
      
      // Draw total weight label at the end of the bar
      if (totalWeight > 0) {
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        const labelX = chartStartX + (totalWeight * scaleFactor) + 2;
        doc.text(`${totalWeight}kg`, labelX, currentBarY + barHeight / 2 + 1.5);
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
    doc.setTextColor('#738AC0');
    doc.text('Total Weight (kg)', xAxisStartX + 150, xAxisY + 15, { align: 'right' });

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

    // Summary Table (optional - you can remove this if you don't want it)
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
    this.reportDetails.forEach((crop) => {
      const totalWeight = (crop.qtyA || 0) + (crop.qtyB || 0) + (crop.qtyC || 0);
      const values = [
        crop.cropName,
        crop.qtyA ? `${crop.qtyA}kg` : '-',
        crop.qtyB ? `${crop.qtyB}kg` : '-',
        crop.qtyC ? `${crop.qtyC}kg` : '-',
        `${totalWeight}kg`,
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

    doc.save(`${this.selectedDistrict.name}_CropWeights.pdf`);
    this.isDownloading = false;
  }, 0);
}
}
