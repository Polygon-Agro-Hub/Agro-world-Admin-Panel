import { CommonModule } from "@angular/common";
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from "@angular/common/http";
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { CanvasJSAngularChartsModule } from "@canvasjs/angular-charts";

import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { CalendarModule } from "primeng/calendar";
import { FloatLabelModule } from "primeng/floatlabel";
import Swal from "sweetalert2";
import { environment } from "../../../environment/environment";
import { TokenService } from "../../../services/token/services/token.service";
import { ThemeService } from "../../../services/theme.service";

declare var html2pdf: any;

interface CropReport {
  [crop: string]: {
    "Grade A": number;
    "Grade B": number;
    "Grade C": number;
    Total: number;
  };
}

@Component({
  selector: "app-collection-officer-report-view",
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    CanvasJSAngularChartsModule,
    LoadingSpinnerComponent,
    CalendarModule,
    FloatLabelModule,
  ],
  templateUrl: "./collection-officer-report-view.component.html",
  styleUrl: "./collection-officer-report-view.component.css",
})
export class CollectionOfficerReportViewComponent implements OnInit {
  @ViewChild("contentToConvert", { static: false })
  contentToConvert!: ElementRef;
  id: string | null = null;
  name: string | null = null;
  createdDate: Date = new Date();
  createdDateForPdf!: string;

  reportData: CropReport = {};
  chartOptions: any;
  loadingChart = true;
  loadingTable = true;
  isDownloading = false;

  empId: string | null = null;
  lastName: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private tokenService: TokenService,
    private router: Router,
    private themeService: ThemeService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.id = params.get("id");
      this.name = params.get("name");
      this.empId = params.get("empId");
      this.lastName = params.get("lastName");

    });

    setTimeout(() => {
      this.fetchReport();
    }, 1000);
  }

  // ── Helper ──────────────────────────────────────────────────────────
  hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 0, 0];
  }

  fetchReport(): void {
    console.log('called')
    const Token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${Token}`,
      "Content-Type": "application/json",
    });
    this.loadingChart = true;
    this.loadingTable = true;

    let formattedDate = '';
    console.log('createdDate', this.createdDate)
    if (this.createdDate) {
      this.createdDateForPdf = new Date().toISOString().split("T")[0];
      console.log('date for pdf', this.createdDateForPdf)
      formattedDate = this.convertToISO(this.createdDate);
    }

    console.log('formattedDate', formattedDate)

    const url = `${environment.API_URL}auth/collection-officer/get-collection-officer-report/${this.id}/${formattedDate}`;

    if (this.id) {
      this.http.get<CropReport>(url, { headers }).subscribe(
        (data) => {
          this.reportData = data;
          // this.empId = data.empId
          this.loadingTable = false;
          this.updateChartOptions();
        },
        (error) => {
          console.error("Error fetching report:", error);
        },
      );
    }
  }

  updateChartOptions(): void {
    let chartData: any[] = [];
    
  
    if (Object.keys(this.reportData).length > 0) {
      chartData = Object.entries(this.reportData).map(([crop, grades]) => ({
        label: crop,
        y: grades["Total"],
        gradeA: grades["Grade A"],
        gradeB: grades["Grade B"],
        gradeC: grades["Grade C"],
      }));
    }

    const labelColor = "#000000"
    const titleColor = "#000000"
    const gridColor = "#000000"
    const tickColor = "#000000"
  
    this.chartOptions = {
      backgroundColor: "transparent",
      
      axisX: {
        title: "Crop Variety",
        titleFontSize: 14,
        titleFontColor: '#000000',
        titlePadding: 10,        // ← space between title and axis labels
      
        labelFontSize: 12,
        labelFontColor: '#000000',
        labelPadding: 8,         // ← space between labels and axis line
      
        gridColor: gridColor,
        gridThickness: 1,
        margin: 10,              // ← outer margin around the axis block
      },
      
      // ── Y Axis ──────────────────────────────────────────────────────
      axisY: {
        title: "Weight (kg)",
        titleFontSize: 14,
        titleFontColor: titleColor,
        titlePadding: 10,        // ← space between title and axis labels
      
        labelFontSize: 12,
        labelFontColor: labelColor,
        labelPadding: 8,         // ← space between labels and axis line
      
        gridColor: gridColor,
        gridThickness: 1,
        includeZero: true,
        margin: 10,              // ← outer margin around the axis block
      },
  
      // ── Legend ────────────────────────────────────────────────────
      
legend: {
  verticalAlign: "top",
  horizontalAlign: "center",
  fontSize: 13,
  fontColor: labelColor,
  fontWeight: "normal",
  padding: 16,
  markerMargin: 8,
  itemWidth: 110,
  margin: 20,              // ← pushes legend away from the chart area
},
  
      // ── Data series ───────────────────────────────────────────────
      data: [
        {
          type: "stackedBar",
          name: "Grade A",
          showInLegend: true,
          yValueFormatString: "#,### Kg",
          color: "#FF9263",
  
          // Bar styling
          lineColor: "transparent",  // border around each bar segment
          lineThickness: 0,
          fillOpacity: 0.92,
  
          // Tooltip / data-label text
          indexLabelFontSize: 11,
          indexLabelFontColor: "#FFFFFF",
          indexLabelPlacement: "inside",
  
          dataPoints: chartData.map((item) => ({
            label: item.label,
            y: item.gradeA,
          })),
        },
        {
          type: "stackedBar",
          name: "Grade B",
          showInLegend: true,
          yValueFormatString: "#,### Kg",
          color: "#5F75E9",
  
          lineColor: "transparent",
          lineThickness: 0,
          fillOpacity: 0.92,
  
          indexLabelFontSize: 11,
          indexLabelFontColor: "#FFFFFF",
          indexLabelPlacement: "inside",
  
          dataPoints: chartData.map((item) => ({
            label: item.label,
            y: item.gradeB,
          })),
        },
        {
          type: "stackedBar",
          name: "Grade C",
          showInLegend: true,
          yValueFormatString: "#,### Kg",
          color: "#3DE188",
  
          lineColor: "transparent",
          lineThickness: 0,
          fillOpacity: 0.92,
  
          indexLabelFontSize: 11,
          indexLabelFontColor: "#333333",   // darker text on light green
          indexLabelPlacement: "inside",
  
          dataPoints: chartData.map((item) => ({
            label: item.label,
            y: item.gradeC,
          })),
        },
      ],
    };
  
    this.loadingChart = false;
    this.cdr.detectChanges();
  }

  get reportEntries(): [
    string,
    { "Grade A": number; "Grade B": number; "Grade C": number; Total: number },
  ][] {
    return Object.entries(this.reportData);
  }

  ngAfterViewInit(): void {
    if (!this.contentToConvert) {
      console.error("contentToConvert is undefined");
    }
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
      doc.text(`${this.name} ${this.lastName}`, pageWidth / 2, 18, { align: 'center' });
      doc.text(`${this.createdDateForPdf}`, pageWidth / 2, 24, { align: 'center' });
  
      if (Object.keys(this.reportData).length === 0) {
        doc.setFontSize(10);
        doc.text('No data available to display.', 30, 35);
        doc.save(`${this.createdDateForPdf}_Report.pdf`);
        this.isDownloading = false;
        return;
      }
  
      const groupedData = Object.entries(this.reportData).map(([cropName, grades]) => ({
        cropName,
        gradeA: grades['Grade A'] || 0,
        gradeB: grades['Grade B'] || 0,
        gradeC: grades['Grade C'] || 0,
        totalWeight: grades['Total'] || 0,
      }));
  
      // ── Legend ────────────────────────────────────────────────────
      const legendY = 32;
      const legendItems = [
        { label: 'Grade A', color: colors.gradeA },
        { label: 'Grade B', color: colors.gradeB },
        { label: 'Grade C', color: colors.gradeC },
      ];
      const legendBoxSize = 4;
      const legendItemWidth = 30;
      const legendStartX = pageWidth / 2 - (legendItems.length * legendItemWidth) / 2;
  
      legendItems.forEach((item, i) => {
        const lx = legendStartX + i * legendItemWidth;
        const [r, g, b] = this.hexToRgb(item.color);
        doc.setFillColor(r, g, b);
        doc.rect(lx, legendY, legendBoxSize, legendBoxSize, 'F');
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text(item.label, lx + legendBoxSize + 2, legendY + legendBoxSize - 1);
      });
  
      // ── Chart layout ──────────────────────────────────────────────
      // Left margin reserved for crop labels (handle long names)
      const labelAreaWidth = 38;   // px reserved for Y-axis crop labels
      const chartStartX = 15 + labelAreaWidth;  // where bars begin
      const chartStartY = legendY + 12;
      const barHeight = 9;
      const rowGap = 14;           // total row height including spacing
      const chartWidth = 120;      // max bar width
  
      const maxWeight = Math.max(...groupedData.map((c) => c.totalWeight));
  
      // ── Y-axis title (rotated) ────────────────────────────────────
      const totalChartHeight = groupedData.length * rowGap;
      const chartMidY = chartStartY + totalChartHeight / 2;
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text('Crop Variety', 35, chartMidY, { angle: 90, align: 'center' });
  
      // ── Draw each crop row ────────────────────────────────────────
      groupedData.forEach((crop, rowIndex) => {
        const rowY = chartStartY + rowIndex * rowGap;
        const barMidY = rowY + barHeight / 2;
  
        // Wrap long crop names to 2 lines (max ~16 chars per line)
        const maxChars = 14;
        let labelLines: string[];
        if (crop.cropName.length <= maxChars) {
          labelLines = [crop.cropName];
        } else {
          // Split at last space before maxChars, else force-split
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
          labelLines.length === 1
            ? barMidY + 1
            : barMidY - lineHeight / 2 + 1;
  
        labelLines.forEach((line, li) => {
          doc.text(line, chartStartX - 2, labelBaseY + li * lineHeight, { align: 'right' });
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
                { align: 'center' }
              );
            }
            currentX += barWidth;
          }
        });
      });
  
      // ── X-axis line + title ───────────────────────────────────────
      const axisY = chartStartY + groupedData.length * rowGap + 2;
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.4);
      doc.line(chartStartX, chartStartY, chartStartX, axisY);        // Y-axis spine
      doc.line(chartStartX, axisY, chartStartX + chartWidth, axisY); // X-axis baseline
  
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
      doc.text('Weight (kg)', chartStartX + chartWidth / 2, axisY + 10, { align: 'center' });
  
      // ── Table ─────────────────────────────────────────────────────
const tableStartY = axisY + 18;
const cellHeight = 8;
const cellPadding = 2;
const tableColWidths = [50, 30, 30, 30, 30];

// Centre the table horizontally
const totalTableWidth = tableColWidths.reduce((a, b) => a + b, 0); // 170
const startX = (pageWidth - totalTableWidth) / 2;

let rowY = tableStartY;

const headers = ['Crop', 'Grade A', 'Grade B', 'Grade C', 'Total'];

doc.setLineWidth(0.2);
doc.setDrawColor(180, 180, 180);

doc.setFontSize(9);
doc.setFont('helvetica', 'bold');
doc.setTextColor(60, 60, 60);
headers.forEach((header, index) => {
  const cellX = startX + tableColWidths.slice(0, index).reduce((a, b) => a + b, 0);
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
    const cellX = startX + tableColWidths.slice(0, index).reduce((a, b) => a + b, 0);
    doc.rect(cellX, rowY, tableColWidths[index], cellHeight);
    doc.text(value, cellX + cellPadding, rowY + cellHeight / 2 + 2.5);
  });
  rowY += cellHeight;
});
  
      doc.save(`Daily Report_${this.empId}_${this.createdDateForPdf}.pdf`);
      this.isDownloading = false;
    }, 0);
  }
  
  

  back(): void {
    this.router.navigate(["/reports/collective-officer-report"]);
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

    return `${year}-${month}-${day}`;
  }
}
