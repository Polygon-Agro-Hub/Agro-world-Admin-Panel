import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { CollectionOfficerReportService } from '../../../services/collection-officer/collection-officer-report.service';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import jsPDF from 'jspdf';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import ChartDataLabels from 'chartjs-plugin-datalabels';

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
    LoadingSpinnerComponent,
  ],
  templateUrl: './collectionofficer-district-report.component.html',
  styleUrls: ['./collectionofficer-district-report.component.css'],
})

export class CollectionofficerDistrictReportComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  districts: any[] = [];
  selectedDistrict: any = { name: 'Colombo', code: 'COL' };
  reportDetails: IdistrictReport[] = [];
  // loadingChart = true;
  // loadingTable = true;
  isDownloading = false;

  isLoading = true;
  hasData = false;

  districtChart!: Chart;

  constructor(
    private collectionOfficerSrv: CollectionOfficerReportService,
    private router: Router,
    private themeService: ThemeService,
  ) { }

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

    this.themeService.themeChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateChart();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.districtChart) {
      this.districtChart.destroy();
    }
  }

  private getChartThemeColors() {
    const isDark = this.themeService.isDarkTheme();
    return {
      textColor: isDark ? '#E5E7EB' : '#000000',
      gridColor: isDark ? '#374151' : '#E5E7EB',
      titleColor: isDark ? '#F9FAFB' : '#111827',
    };
  }

  back(): void {
    this.router.navigate(['reports']);
  }

  fetchAllDistrictReportDetails(district: string) {
    this.isLoading = true;
    // this.loadingChart = true;
    // this.loadingTable = true;
    this.collectionOfficerSrv.getDistrictReport(district).subscribe(
      (response) => {
        this.reportDetails = response.map((item) => ({
          ...item,
          qtyA: Number(item.qtyA) || 0,
          qtyB: Number(item.qtyB) || 0,
          qtyC: Number(item.qtyC) || 0,
        }));
        this.hasData = this.reportDetails.length > 0;
        this.updateChart();
      },
      (error) => { },
    );
  }

  applyFilters() {
    if (this.selectedDistrict) {
      this.fetchAllDistrictReportDetails(this.selectedDistrict.name);
    }
  }

  updateChart() {
    if (this.districtChart) {
      this.districtChart.destroy();
    }

    // ✅ Set false FIRST so Angular renders the canvas
    this.isLoading = false;

    // ✅ Wait for Angular to render the canvas in the DOM
    setTimeout(() => {
      const { textColor, gridColor, titleColor } = this.getChartThemeColors();

      const labels = this.reportDetails.map(crop => crop.cropName);
      const gradeAData = this.reportDetails.map(crop => crop.qtyA || 0);
      const gradeBData = this.reportDetails.map(crop => crop.qtyB || 0);
      const gradeCData = this.reportDetails.map(crop => crop.qtyC || 0);

      this.districtChart = new Chart('districtBarChart', {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: 'Grade A', data: gradeAData, backgroundColor: '#FF9263' },
            { label: 'Grade B', data: gradeBData, backgroundColor: '#5F75E9' },
            { label: 'Grade C', data: gradeCData, backgroundColor: '#3DE188' },
          ],
        },
        plugins: [ChartDataLabels],
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: {
            title: {
              display: true,
              text: `${this.selectedDistrict.name} - Crop Weights`,
              color: titleColor,
              padding: { top: 10, bottom: 30 },
              font: { size: 18, weight: 600 },
            },
            legend: {
              position: 'bottom',
              labels: {
                padding: 30,
                color: textColor,
                font: { size: 14, weight: 400 },
              },
            },
            datalabels: {
              display: false,
              color: '#fff',
              font: { size: 11, weight: 600 },
              formatter: (value: number) => (value > 0 ? value : ''), // ✅ hides the 0
            },
          },
          scales: {
            x: {
              stacked: true,
              ticks: { color: textColor },
              grid: { color: gridColor },
              title: {
                display: true,
                text: 'Total Weight (Kg)',
                color: textColor,
                font: { size: 12 },
                padding: 20,
              },
            },
            y: {
              stacked: true,
              ticks: { color: textColor },
              grid: { color: gridColor },
              title: {
                display: true,
                text: 'Crop Variety',
                color: textColor,
                font: { size: 12, weight: 500 },
                padding: 20,
              },
            },
          },
        },
      });
    }, 0);
  }

  async exportToPDF(): Promise<void> {
    this.isDownloading = true;

    setTimeout(() => {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const margin = 20;
      const chartStartX = 50;
      const chartStartY = 30; // Reduced from 70 to decrease gap after title
      const barHeight = 8;
      const gap = 2;
      const chartHeight = 100;
      const chartWidth = 100;
      const yAxisTitleX = 20;


      const colors = {
        gradeA: '#FF9263',
        gradeB: '#5F75E9',
        gradeC: '#3DE188',
      };

      // Title
      doc.setFontSize(16);
      doc.setTextColor(102, 102, 102);
      doc.text(
        `${this.selectedDistrict.name} - Crop Weights`,
        pageWidth / 2,
        25,
        { align: 'center' },
      );

      if (!this.reportDetails || this.reportDetails.length === 0) {
        doc.setFontSize(11);
        doc.text('No data available to display.', chartStartX, chartStartY);
        doc.save(`${this.selectedDistrict.name}_Report.pdf`);
        this.isDownloading = false;
        return;
      }

      // Legend - Center aligned, positioned above chart
      const legendY = 40; // Position below title
      const legendSquareSize = 6;
      const legendItemWidth = 35; // Width between legend items for compact spacing
      const totalLegendWidth = legendItemWidth * 3; // Total width for all 3 items
      const legendStartX = (pageWidth - totalLegendWidth) / 2; // Center the entire legend

      // Grade A
      doc.setFillColor(255, 146, 99);
      doc.rect(legendStartX, legendY, legendSquareSize, legendSquareSize, 'F');
      doc.setFontSize(9);
      doc.setTextColor(102, 102, 102);
      doc.text(
        'Grade A',
        legendStartX + legendSquareSize + 3,
        legendY + legendSquareSize / 2 + 1,
      );

      // Grade B
      const legendBX = legendStartX + legendItemWidth;
      doc.setFillColor(95, 117, 233);
      doc.rect(legendBX, legendY, legendSquareSize, legendSquareSize, 'F');
      doc.text(
        'Grade B',
        legendBX + legendSquareSize + 3,
        legendY + legendSquareSize / 2 + 1,
      );

      // Grade C
      const legendCX = legendBX + legendItemWidth;
      doc.setFillColor(61, 225, 136);
      doc.rect(legendCX, legendY, legendSquareSize, legendSquareSize, 'F');
      doc.text(
        'Grade C',
        legendCX + legendSquareSize + 3,
        legendY + legendSquareSize / 2 + 1,
      );

      const cropNames = this.reportDetails.map((crop) => crop.cropName);
      const cropNameAreaWidth = 35;

      const totalBarsHeight = cropNames.length * (barHeight + gap);
      const barAreaStartY = chartStartY + (chartHeight - totalBarsHeight) / 2;
      const barAreaEndY = barAreaStartY + totalBarsHeight;

      // Draw y-axis line
      const yAxisX = chartStartX - 0.5;
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(yAxisX, barAreaStartY - 5, yAxisX, barAreaEndY + 5);

      // Draw y-axis title at the TOP
      doc.setFontSize(10);
      doc.setTextColor('#738AC0');
      const textY = (barAreaStartY + barAreaEndY) / 2;
      doc.text('Crop Variety', yAxisTitleX, textY, { angle: 90, align: 'center' });

      // Draw y-axis tick marks and crop name labels
      let currentBarY = barAreaStartY;
      cropNames.forEach((cropName) => {
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(
          yAxisX,
          currentBarY + barHeight / 2,
          yAxisX - 2,
          currentBarY + barHeight / 2,
        );

        doc.setFontSize(10);
        doc.setTextColor(102, 102, 102);
        doc.text(cropName, chartStartX - 10, currentBarY + barHeight / 2 + 2, {
          align: 'right',
        });

        currentBarY += barHeight + gap;
      });

      // Draw the horizontal bars
      currentBarY = barAreaStartY;

      const maxWeight = Math.max(
        ...this.reportDetails.map(
          (crop) =>
            Number(crop.qtyA || 0) +
            Number(crop.qtyB || 0) +
            Number(crop.qtyC || 0),
        ),
      );

      const scaleFactor = chartWidth / maxWeight;

      this.reportDetails.forEach((crop) => {
        const qtyA = Number(crop.qtyA) || 0;
        const qtyB = Number(crop.qtyB) || 0;
        const qtyC = Number(crop.qtyC) || 0;
        const totalWeight = qtyA + qtyB + qtyC;

        const widthA = qtyA * scaleFactor;
        const widthB = qtyB * scaleFactor;
        const widthC = qtyC * scaleFactor;

        let currentX = chartStartX;

        if (qtyA > 0) {
          doc.setFillColor(255, 146, 99);
          doc.rect(currentX, currentBarY, widthA, barHeight, 'F');
          currentX += widthA;
        }

        if (qtyB > 0) {
          doc.setFillColor(95, 117, 233);
          doc.rect(currentX, currentBarY, widthB, barHeight, 'F');
          currentX += widthB;
        }

        if (qtyC > 0) {
          doc.setFillColor(61, 225, 136);
          doc.rect(currentX, currentBarY, widthC, barHeight, 'F');
        }

        if (totalWeight > 0) {
          doc.setFontSize(8);
          doc.setTextColor(0, 0, 0);
          const labelX = chartStartX + totalWeight * scaleFactor + 2;
          doc.text(
            `${totalWeight}kg`,
            labelX,
            currentBarY + barHeight / 2 + 1.5,
          );
        }

        currentBarY += barHeight + gap;
      });

      // Draw x-axis line and labels
      const xAxisStartX = chartStartX;
      const xAxisEndX = chartStartX + chartWidth + 30;
      const xAxisY = barAreaStartY + totalBarsHeight + 5;

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(xAxisStartX, xAxisY, xAxisEndX, xAxisY);
      doc.line(yAxisX, xAxisY, yAxisX, barAreaEndY + 5);

      doc.setFontSize(8);
      doc.setTextColor(102, 102, 102);

      const maxTickValue = Math.ceil(maxWeight / 100) * 100;
      const tickCount = Math.min(8, Math.ceil(maxTickValue / 100));

      for (let i = 0; i <= tickCount; i++) {
        const tickValue = (maxTickValue / tickCount) * i;
        const tickX = chartStartX + tickValue * scaleFactor;

        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(tickX, xAxisY, tickX, xAxisY + 2);

        const labelText = tickValue === 0 ? '0' : tickValue.toLocaleString();
        doc.text(labelText, tickX, xAxisY + 6, { align: 'center' });
      }

      // Draw x-axis title
      doc.setFontSize(10);
      doc.setTextColor('#738AC0');
      // doc.text('Total Weight (kg)', xAxisStartX + 130, xAxisY + 5, {
      //   align: 'center',
      // });
      doc.text('Total Weight (kg)', xAxisStartX + (chartWidth / 2), xAxisY + 5, { align: 'center' });


      // Summary Table
      const tableStartY = xAxisY + 15; // Reduced from 30 to decrease gap between chart and table
      const cellHeight = 8;
      const tableColWidths = [40, 30, 30, 30, 30];
      const tableStartX = (pageWidth - 160) / 2;
      let rowY = tableStartY;

      const headers = ['Crop Variety', 'Grade A', 'Grade B', 'Grade C', 'Total'];
      doc.setFontSize(9);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);

      let cellX = tableStartX;
      headers.forEach((header, index) => {
        doc.setFillColor(245, 245, 245);
        doc.setTextColor(102, 102, 102);
        doc.rect(cellX, rowY, tableColWidths[index], cellHeight, 'FD');
        doc.text(header, cellX + tableColWidths[index] / 2, rowY + 5, {
          align: 'center',
        });
        cellX += tableColWidths[index];
      });

      rowY += cellHeight;

      this.reportDetails.forEach((crop) => {
        const qtyA = Number(crop.qtyA) || 0;
        const qtyB = Number(crop.qtyB) || 0;
        const qtyC = Number(crop.qtyC) || 0;
        const totalWeight = qtyA + qtyB + qtyC;

        const values = [
          crop.cropName,
          qtyA ? `${qtyA}kg` : '-',
          qtyB ? `${qtyB}kg` : '-',
          qtyC ? `${qtyC}kg` : '-',
          `${totalWeight}kg`,
        ];

        cellX = tableStartX;
        values.forEach((value, index) => {
          doc.setTextColor(0, 0, 0);
          doc.rect(cellX, rowY, tableColWidths[index], cellHeight, 'S');
          doc.text(value, cellX + tableColWidths[index] / 2, rowY + 5, {
            align: 'center',
          });
          cellX += tableColWidths[index];
        });

        rowY += cellHeight;
      });

      // Footer
      const footerY = pageHeight - 10;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const date = new Date().toLocaleDateString();
      doc.text(`Generated on ${date}`, pageWidth / 2, footerY, {
        align: 'center',
      });

      doc.save(`${this.selectedDistrict.name}_CropWeights.pdf`);
      this.isDownloading = false;
    }, 0);
  }
}