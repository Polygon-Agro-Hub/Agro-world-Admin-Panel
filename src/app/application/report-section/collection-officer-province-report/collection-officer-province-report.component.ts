import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, Input, OnInit, OnDestroy } from '@angular/core';
import { Chart, ChartType } from 'chart.js/auto';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { CollectionOfficerReportService } from '../../../services/collection-officer/collection-officer-report.service';
import jsPDF from 'jspdf';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';
import { ViewChild, ElementRef } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import ChartDataLabels from 'chartjs-plugin-datalabels';

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
    LoadingSpinnerComponent,
  ],
  templateUrl: './collection-officer-province-report.component.html',
  styleUrl: './collection-officer-province-report.component.css',
})
export class CollectionOfficerProvinceReportComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  
  province: any[] = [];
  selectedProvince: any = { name: 'Western', code: 'WEST' };
  reportDetails: IProvinceReport[] = [];
  chartOptions: any;
  // loadingChart = true;
  // loadingTable = true;
  isDownloading = false;

  provinceChart!: Chart;

  isLoading = true;
  hasData = false;

  ngAfterViewInit() {
    this.updateChart();
  }

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

    this.themeService.themeChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateChart(); // re-render chart on theme change
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  private getChartThemeColors() {
    const isDark = this.themeService.isDarkTheme();
    return {
      textColor: isDark ? '#E5E7EB' : '#000000',
      gridColor: isDark ? '#374151' : '#E5E7EB',
      titleColor: isDark ? '#F9FAFB' : '#111827',
    };
  }

  fetchAllProvinceReportDetails(district: string) {
    this.isLoading = true;
    // this.loadingChart = true;
    // this.loadingTable = true;

    this.collectionOfficerSrv.getProvinceReport(district).subscribe(
      (response) => {
        this.reportDetails = response.map((item) => ({
          ...item,
          qtyA: Number(item.qtyA) || 0,
          qtyB: Number(item.qtyB) || 0,
          qtyC: Number(item.qtyC) || 0,
        }));
        this.hasData = this.reportDetails.length > 0;
        // this.loadingTable = false;
        // this.loadingChart = false;
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
  if (this.provinceChart) {
    this.provinceChart.destroy();
    this.provinceChart = null!;
  }

  const { textColor, gridColor, titleColor } = this.getChartThemeColors();

  const labels = this.reportDetails.map(crop => crop.cropName);
  const gradeAData = this.reportDetails.map(crop => crop.qtyA || 0);
  const gradeBData = this.reportDetails.map(crop => crop.qtyB || 0);
  const gradeCData = this.reportDetails.map(crop => crop.qtyC || 0);

  this.isLoading = false;
  // ✅ Defer canvas lookup until after Angular finishes DOM update
  setTimeout(() => {
    const canvas = document.getElementById('provinceBarChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.provinceChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Grade A',
            data: gradeAData,
            backgroundColor: '#FF9263',
          },
          {
            label: 'Grade B',
            data: gradeBData,
            backgroundColor: '#5F75E9',
          },
          {
            label: 'Grade C',
            data: gradeCData,
            backgroundColor: '#3DE188',
          }
        ]
      },
      plugins: [ChartDataLabels],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          title: {
            display: true,
            text: `${this.selectedProvince.name} - Crop Weights`,
            color: titleColor,
            padding: { top: 10, bottom: 30 },
            font: { size: 18, weight: 600 }
          },
          legend: {
            position: 'bottom',
            labels: {
              padding: 30,
              color: textColor,
              font: { size: 14, weight: 400 }
            }
          },
          datalabels: {
            display: false, // ✅ hides bar labels for this chart specifically
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
              padding: 20
            }
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
              padding: 20
            }
          }
        }
      }
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
    const yAxisTitleX = 25;
    const labelRightEdge = 55;
    const chartStartX = 58;
    const chartStartY = 55;
    const barHeight = 8;
    const gap = 2;
    const chartWidth = 100;
    const labelMaxWidth = 30;

    doc.setFontSize(16);
    doc.setTextColor(102, 102, 102);
    doc.text(
      `${this.selectedProvince.name} - Crop Weights`,
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

    const groupedData = this.reportDetails.map((crop) => ({
      cropName: crop.cropName,
      gradeA: crop.qtyA || 0,
      gradeB: crop.qtyB || 0,
      gradeC: crop.qtyC || 0,
      totalWeight: (crop.qtyA || 0) + (crop.qtyB || 0) + (crop.qtyC || 0),
    }));

    const cropNames = groupedData.map(crop => crop.cropName);

    // FIX: derive chartHeight from actual bar count — never hardcode 100
    const totalBarsHeight = cropNames.length * (barHeight + gap);
    const chartHeight = totalBarsHeight + 10; // 5px padding top and bottom

    const barAreaStartY = chartStartY + 5; // small top padding inside chart
    const barAreaEndY = barAreaStartY + totalBarsHeight;

    // ── Y-axis ──────────────────────────────────────────────────────────
    const yAxisX = chartStartX - 0.5;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(yAxisX, barAreaStartY - 5, yAxisX, barAreaEndY + 5);

    doc.setFontSize(10);
    doc.setTextColor('#738AC0');
    const textY = (barAreaStartY + barAreaEndY) / 2;
    doc.text('Crop Variety', yAxisTitleX, textY, { angle: 90, align: 'center' });

    let currentBarY = barAreaStartY;
    cropNames.forEach((cropName) => {
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(yAxisX, currentBarY + barHeight / 2, yAxisX - 2, currentBarY + barHeight / 2);

      doc.setFontSize(8);
      doc.setTextColor(102, 102, 102);
      const wrappedLines = doc.splitTextToSize(cropName, labelMaxWidth);
      const displayLines = wrappedLines.slice(0, 2);
      const lineHeight = 3.5;
      const totalTextHeight = displayLines.length * lineHeight;
      const textStartY = currentBarY + (barHeight / 2) - (totalTextHeight / 2) + lineHeight;

      displayLines.forEach((line: string, lineIndex: number) => {
        doc.text(line, labelRightEdge, textStartY + lineIndex * lineHeight, { align: 'right' });
      });

      currentBarY += barHeight + gap;
    });

    // ── Bars ─────────────────────────────────────────────────────────────
    currentBarY = barAreaStartY;
    const maxWeight = Math.max(...groupedData.map(crop => crop.totalWeight));
    const scaleFactor = chartWidth / maxWeight;
    const maxLabelX = pageWidth - margin - 10;

    groupedData.forEach((crop) => {
      let currentX = chartStartX;

      if (crop.gradeA > 0) {
        const segmentWidth = crop.gradeA * scaleFactor;
        doc.setFillColor(255, 146, 99);
        doc.rect(currentX, currentBarY, segmentWidth, barHeight, 'F');
        currentX += segmentWidth;
      }
      if (crop.gradeB > 0) {
        const segmentWidth = crop.gradeB * scaleFactor;
        doc.setFillColor(95, 117, 233);
        doc.rect(currentX, currentBarY, segmentWidth, barHeight, 'F');
        currentX += segmentWidth;
      }
      if (crop.gradeC > 0) {
        const segmentWidth = crop.gradeC * scaleFactor;
        doc.setFillColor(61, 225, 136);
        doc.rect(currentX, currentBarY, segmentWidth, barHeight, 'F');
        currentX += segmentWidth;
      }

      if (crop.totalWeight > 0) {
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        const rawLabelX = chartStartX + (crop.totalWeight * scaleFactor) + 2;
        const labelX = Math.min(rawLabelX, maxLabelX);
        doc.text(`${crop.totalWeight}kg`, labelX, currentBarY + barHeight / 2 + 1.5);
      }

      currentBarY += barHeight + gap;
    });

    // ── X-axis ───────────────────────────────────────────────────────────
    const xAxisStartX = chartStartX;
    const xAxisEndX = Math.min(chartStartX + chartWidth + 10, pageWidth - margin);
    // FIX: x-axis is always placed directly below the last bar — no overlap possible
    const xAxisY = barAreaEndY + 5;

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
      const tickX = chartStartX + (tickValue * scaleFactor);
      if (tickX > xAxisEndX) continue;

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(tickX, xAxisY, tickX, xAxisY + 2);

      const labelText = tickValue === 0 ? '0' : tickValue.toLocaleString();
      doc.text(labelText, tickX, xAxisY + 6, { align: 'center' });
    }

    doc.setFontSize(10);
    doc.setTextColor('#738AC0');
    doc.text('Total Weight (kg)', xAxisStartX + (chartWidth / 2), xAxisY + 12, { align: 'center' });

    // ── Legend ───────────────────────────────────────────────────────────
    const legendY = chartStartY - 10;
    const legendSquareSize = 6;

    doc.setFillColor(255, 146, 99);
    doc.rect(chartStartX, legendY, legendSquareSize, legendSquareSize, 'F');
    doc.setFontSize(9);
    doc.setTextColor(102, 102, 102);
    doc.text('Grade A', chartStartX + legendSquareSize + 3, legendY + legendSquareSize / 2 + 1);

    const legendBX = chartStartX + 35;
    doc.setFillColor(95, 117, 233);
    doc.rect(legendBX, legendY, legendSquareSize, legendSquareSize, 'F');
    doc.text('Grade B', legendBX + legendSquareSize + 3, legendY + legendSquareSize / 2 + 1);

    const legendCX = legendBX + 35;
    doc.setFillColor(61, 225, 136);
    doc.rect(legendCX, legendY, legendSquareSize, legendSquareSize, 'F');
    doc.text('Grade C', legendCX + legendSquareSize + 3, legendY + legendSquareSize / 2 + 1);

    // ── Summary Table ────────────────────────────────────────────────────
    const cellHeight = 8;
    const tableColWidths = [40, 30, 30, 30, 30];
    const tableStartX = (pageWidth - 160) / 2;
    const footerHeight = 15;

    // FIX: table starts 20mm below the x-axis title (xAxisY + 12 is where title sits)
    let rowY = xAxisY + 24;

    const headers = ['Crop Variety', 'Grade A', 'Grade B', 'Grade C', 'Total'];
    doc.setFontSize(9);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);

    // Header row
    let cellX = tableStartX;
    headers.forEach((header, index) => {
      doc.setFillColor(245, 245, 245);
      doc.setTextColor(102, 102, 102);
      doc.rect(cellX, rowY, tableColWidths[index], cellHeight, 'FD');
      doc.text(header, cellX + tableColWidths[index] / 2, rowY + 5, { align: 'center' });
      cellX += tableColWidths[index];
    });

    rowY += cellHeight;

    // Data rows with page-break guard
    groupedData.forEach((crop) => {
      if (rowY + cellHeight + footerHeight > pageHeight) {
        const footerY = pageHeight - 10;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Generated on ${new Date().toLocaleDateString()}`,
          pageWidth / 2,
          footerY,
          { align: 'center' }
        );

        doc.addPage();
        rowY = margin;

        cellX = tableStartX;
        headers.forEach((header, index) => {
          doc.setFillColor(245, 245, 245);
          doc.setTextColor(102, 102, 102);
          doc.rect(cellX, rowY, tableColWidths[index], cellHeight, 'FD');
          doc.text(header, cellX + tableColWidths[index] / 2, rowY + 5, { align: 'center' });
          cellX += tableColWidths[index];
        });
        rowY += cellHeight;
      }

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

    // ── Footer (last page) ───────────────────────────────────────────────
    const footerY = pageHeight - 10;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      footerY,
      { align: 'center' }
    );

    doc.save(`${this.selectedProvince.name}_CropWeights.pdf`);
    this.isDownloading = false;
  }, 0);
}

}




