import { CommonModule } from '@angular/common';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import {
  ChangeDetectorRef,
  AfterViewInit,
  Component,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import jsPDF from 'jspdf';

import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CalendarModule } from 'primeng/calendar';
import { FloatLabelModule } from 'primeng/floatlabel';
import { environment } from '../../../environment/environment';
import { TokenService } from '../../../services/token/services/token.service';
import { ThemeService } from '../../../services/theme.service';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-collection-officer-report-view',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    LoadingSpinnerComponent,
    CalendarModule,
    FloatLabelModule,
  ],
  templateUrl: './collection-officer-report-view.component.html',
  styleUrl: './collection-officer-report-view.component.css',
})

export class CollectionOfficerReportViewComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  id: string | null = null;
  name: string | null = null;
  createdDate: Date = new Date();
  createdDateForPdf!: string;

  reportData: CropReport = {};
  loadingChart = true;
  loadingTable = true;
  isDownloading = false;

  empId: string | null = null;
  lastName: string | null = null;

  reportChart!: Chart;

  hasData: boolean = false;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private tokenService: TokenService,
    private router: Router,
    private themeService: ThemeService,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id');
      this.name = params.get('name');
      this.empId = params.get('empId');
      this.lastName = params.get('lastName');

      this.fetchReport();
    });

    this.themeService.themeChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateChart();
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

  fetchReport(): void {
    const Token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${Token}`,
      'Content-Type': 'application/json',
    });
    // this.loadingChart = true;
    // this.loadingTable = true;
    this.isLoading = true;

    let formattedDate = '';
    if (this.createdDate) {
      this.createdDateForPdf = new Date(this.createdDate).toLocaleDateString(
        'en-CA',
      );
      formattedDate =
        this.createdDate.getFullYear() +
        '-' +
        String(this.createdDate.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(this.createdDate.getDate()).padStart(2, '0');
    }

    const url = `${environment.API_URL}auth/collection-officer/get-collection-officer-report/${this.id}/${formattedDate}`;

    if (this.id) {
      this.http.get<CropReport>(url, { headers }).subscribe(
        (data) => {
          this.reportData = data;
          this.hasData = Object.keys(this.reportData).length > 0;
          this.isLoading = false;
          this.cdr.detectChanges();
          setTimeout(() => this.updateChart(), 0);
        },
        (error) => {
          console.error('Error fetching report:', error);
        },
      );
    }
  }

  updateChart(): void {
    if (this.reportChart) {
      this.reportChart.destroy();
      this.reportChart = null!;
    }

    const { textColor, gridColor, titleColor } = this.getChartThemeColors();

    const chartData =
      Object.keys(this.reportData).length > 0
        ? Object.entries(this.reportData).map(([crop, grades]) => ({
          label: crop,
          gradeA: grades['Grade A'] || 0,
          gradeB: grades['Grade B'] || 0,
          gradeC: grades['Grade C'] || 0,
        }))
        : [];

    const labels = chartData.map((item) => item.label);
    const gradeAData = chartData.map((item) => item.gradeA);
    const gradeBData = chartData.map((item) => item.gradeB);
    const gradeCData = chartData.map((item) => item.gradeC);

    const canvas = document.getElementById(
      'reportBarChart',
    ) as HTMLCanvasElement;
    if (!canvas) return;

    this.reportChart = new Chart(canvas, {
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
            text: `${this.name} ${this.lastName} - Crop Weights`,
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
  }

  async downloadPDF(): Promise<void> {
    this.isDownloading = true;
    setTimeout(() => {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();

      const colors = {
        gradeA: '#FF9263',
        gradeB: '#5F75E9',
        gradeC: '#3DE188',
      };

      // ── Header ────────────────────────────────────────────────────
      doc.setFontSize(12);
      doc.text(`${this.name} ${this.lastName}`, pageWidth / 2, 18, {
        align: 'center',
      });
      doc.text(`${this.createdDateForPdf}`, pageWidth / 2, 24, {
        align: 'center',
      });

      if (Object.keys(this.reportData).length === 0) {
        doc.setFontSize(10);
        doc.text('No data available to display.', 30, 35);
        doc.save(`${this.createdDateForPdf}_Report.pdf`);
        this.isDownloading = false;
        return;
      }

      const groupedData = Object.entries(this.reportData).map(
        ([cropName, grades]) => ({
          cropName,
          gradeA: grades['Grade A'] || 0,
          gradeB: grades['Grade B'] || 0,
          gradeC: grades['Grade C'] || 0,
          totalWeight: grades['Total'] || 0,
        }),
      );

      const legendItems = [
        { label: 'Grade A', color: colors.gradeA },
        { label: 'Grade B', color: colors.gradeB },
        { label: 'Grade C', color: colors.gradeC },
      ];
      const legendBoxSize = 4;
      const legendItemWidth = 30;
      const legendStartX =
        pageWidth / 2 - (legendItems.length * legendItemWidth) / 2;

      // ── Draw legend first ─────────────────────────────────────────
      const legendY = 32;
      legendItems.forEach((item, i) => {
        const lx = legendStartX + i * legendItemWidth;
        const [r, g, b] = this.hexToRgb(item.color);
        doc.setFillColor(r, g, b);
        doc.rect(lx, legendY, legendBoxSize, legendBoxSize, 'F');
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text(
          item.label,
          lx + legendBoxSize + 2,
          legendY + legendBoxSize - 1,
        );
      });

      const labelAreaWidth = 38;
      const chartStartX = 15 + labelAreaWidth;
      const barHeight = 9;
      const rowGap = 14;
      const chartWidth = 120;

      const maxWeight = Math.max(...groupedData.map((c) => c.totalWeight));

      // ✅ FIX 1: chartStartY dynamically derived from legendY so they never overlap
      const chartStartY = legendY + legendBoxSize + 8;

      const yAxisTotalHeight = groupedData.length * rowGap + 2;
      const bottomGap = rowGap - barHeight + 2; // gap after last bar to axis line (~7mm)
      const chartMidY =
        chartStartY +
        yAxisTotalHeight / 2 +
        bottomGap / (2 * groupedData.length);
      const yAxisTitleX = 15 + labelAreaWidth / 2;
      const textWidthInMm =
        (doc.getStringUnitWidth('Crop Variety') * 9) / doc.internal.scaleFactor;
      const yLabelFontSize =
        textWidthInMm <= yAxisTotalHeight
          ? 9
          : Math.max(5, (yAxisTotalHeight / textWidthInMm) * 9);
      doc.setFontSize(yLabelFontSize);
      doc.setTextColor(0, 0, 0);
      doc.text('Crop Variety', yAxisTitleX, chartMidY, {
        angle: 90,
        align: 'center',
      });

      groupedData.forEach((crop, rowIndex) => {
        const rowY = chartStartY + rowIndex * rowGap;
        const barMidY = rowY + barHeight / 2;

        const maxChars = 14;
        let labelLines: string[];
        if (crop.cropName.length <= maxChars) {
          labelLines = [crop.cropName];
        } else {
          const spaceIdx = crop.cropName.lastIndexOf(' ', maxChars);
          if (spaceIdx > 0) {
            labelLines = [
              crop.cropName.substring(0, spaceIdx),
              crop.cropName.substring(spaceIdx + 1),
            ];
          } else {
            labelLines = [
              crop.cropName.substring(0, maxChars),
              crop.cropName.substring(maxChars),
            ];
          }
        }

        // Draw label lines centred on bar
        doc.setFontSize(7.5);
        doc.setTextColor(0, 0, 0);
        const lineHeight = 3.5;
        const labelBaseY =
          labelLines.length === 1 ? barMidY + 1 : barMidY - lineHeight / 2 + 1;

        labelLines.forEach((line, li) => {
          doc.text(line, chartStartX - 2, labelBaseY + li * lineHeight, {
            align: 'right',
          });
        });

        // Draw stacked bars
        let currentX = chartStartX;
        const gradeKeys = [
          { key: 'gradeA', color: colors.gradeA },
          { key: 'gradeB', color: colors.gradeB },
          { key: 'gradeC', color: colors.gradeC },
        ];

        gradeKeys.forEach(({ key, color }) => {
          const weight = crop[key as keyof typeof crop] as number;
          if (weight > 0) {
            const barWidth = (weight / maxWeight) * chartWidth;
            const [r, g, b] = this.hexToRgb(color);
            doc.setFillColor(r, g, b);
            doc.rect(currentX, rowY, barWidth, barHeight, 'F');

            // Label inside bar (only if wide enough)
            if (barWidth > 12) {
              doc.setFontSize(6.5);
              doc.setTextColor(255, 255, 255);
              doc.text(
                `${weight}kg`,
                currentX + barWidth / 2,
                rowY + barHeight / 2 + 2,
                { align: 'center' },
              );
            }
            currentX += barWidth;
          }
        });
      });

      // ── Axes ──────────────────────────────────────────────────────
      const axisY = chartStartY + groupedData.length * rowGap + 2;
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.4);
      doc.line(chartStartX, chartStartY, chartStartX, axisY);
      doc.line(chartStartX, axisY, chartStartX + chartWidth, axisY);

      // X-axis tick labels
      const tickCount = 5;
      doc.setFontSize(7);
      doc.setTextColor(80, 80, 80);
      for (let t = 0; t <= tickCount; t++) {
        const tickX = chartStartX + (t / tickCount) * chartWidth;
        const tickValue = Math.round((t / tickCount) * maxWeight);
        doc.line(tickX, axisY, tickX, axisY + 1.5);
        doc.text(`${tickValue}`, tickX, axisY + 5, { align: 'center' });
      }

      // X-axis title
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text('Total Weight (kg)', chartStartX + chartWidth / 2, axisY + 10, {
        align: 'center',
      });

      // ── Table ─────────────────────────────────────────────────────
      const tableStartY = axisY + 18;
      const cellHeight = 8;
      const cellPadding = 2;
      const tableColWidths = [50, 30, 30, 30, 30];

      // Centre the table horizontally
      const totalTableWidth = tableColWidths.reduce((a, b) => a + b, 0); // 170
      const startX = (pageWidth - totalTableWidth) / 2;

      let rowY = tableStartY;

      const headers = [
        'Crop Variety',
        'Grade A',
        'Grade B',
        'Grade C',
        'Total',
      ];

      doc.setLineWidth(0.2);
      doc.setDrawColor(180, 180, 180);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(60, 60, 60);
      headers.forEach((header, index) => {
        const cellX =
          startX + tableColWidths.slice(0, index).reduce((a, b) => a + b, 0);
        doc.rect(cellX, rowY, tableColWidths[index], cellHeight);
        doc.text(header, cellX + cellPadding, rowY + cellHeight / 2 + 2.5);
      });
      rowY += cellHeight;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(90, 90, 90);
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
          doc.text(value, cellX + cellPadding, rowY + cellHeight / 2 + 2.5);
        });
        rowY += cellHeight;
      });

      doc.save(`Daily Report_${this.empId}_${this.createdDateForPdf}.pdf`);
      this.isDownloading = false;
    }, 0);
  }

  hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
      : [0, 0, 0];
  }

  back(): void {
    this.router.navigate(['/reports/collective-officer-report']);
  }
}

class CropReport {
  [crop: string]: {
    'Grade A': number;
    'Grade B': number;
    'Grade C': number;
    Total: number;
  };
}
