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
  createdDate: string = new Date().toISOString().split("T")[0];

  reportData: CropReport = {};
  chartOptions: any;
  loadingChart = true;
  loadingTable = true;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private tokenService: TokenService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.id = params.get("id");
      this.name = params.get("name");
    });

    setTimeout(() => {
      this.fetchReport();
    }, 1000);
  }

  fetchReport(): void {
    const Token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${Token}`,
      "Content-Type": "application/json",
    });
    this.loadingChart = true;
    this.loadingTable = true;

    const url = `${environment.API_URL}auth/collection-officer/get-collection-officer-report/${this.id}/${this.createdDate}`;

    if (this.id) {
      this.http.get<CropReport>(url, { headers }).subscribe(
        (data) => {
          this.reportData = data;
          this.loadingTable = false;
          this.updateChartOptions();
          console.log("Report data:", this.reportData);
        },
        (error) => {
          console.error("Error fetching report:", error);
        },
      );
    }
  }

  updateChartOptions(): void {
    // Clear the chartData array
    let chartData: any[] = [];

    console.log("Updating chart options. Current reportData:", this.reportData);

    // Only proceed if reportData is not empty
    if (Object.keys(this.reportData).length > 0) {
      chartData = Object.entries(this.reportData).map(([crop, grades]) => ({
        label: crop,
        y: grades["Total"],
        gradeA: grades["Grade A"],
        gradeB: grades["Grade B"],
        gradeC: grades["Grade C"],
      }));
    }

    console.log("Processed chartData:", chartData);

    this.chartOptions = {
      animationEnabled: true,
      exportEnabled: true,
      title: {
        text: `Crop Report by Grade ${this.createdDate}`,
      },
      axisY: {
        title: "Weight (Kg)",
        includeZero: true,
      },
      // toolTip: {
      //   shared: true,
      //   content: "<strong>{label}</strong><br/>Total: {y} Kg<br/>Grade A: {gradeA} Kg<br/>Grade B: {gradeB} Kg<br/>Grade C: {gradeC} Kg"
      // },
      legend: {
        verticalAlign: "top",
      },
      data: [
        {
          type: "stackedBar",
          name: "Grade A",
          showInLegend: true,
          yValueFormatString: "#,### Kg",
          color: "#FF9263",
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
          dataPoints: chartData.map((item) => ({
            label: item.label,
            y: item.gradeC,
          })),
        },
      ],
    };

    console.log("Updated chartOptions:", this.chartOptions);
    this.loadingChart = false;

    // Trigger change detection
    this.cdr.detectChanges();
  }

  onDateChange(): void {
    console.log(this.createdDate);
    if (this.createdDate === "") {
      Swal.fire({
        title: "Error!",
        text: "Please select a date",
        icon: "error",
        confirmButtonText: "OK",
      }).then(() => {
        // Set today's date to createdDate after the user presses OK
        this.createdDate = new Date().toISOString().split("T")[0];
        // Call fetchReport after setting the date
        this.fetchReport();
      });
    } else {
      this.fetchReport();
    }
  }

  get reportEntries(): [
    string,
    { "Grade A": number; "Grade B": number; "Grade C": number; Total: number },
  ][] {
    return Object.entries(this.reportData);
  }

  ngAfterViewInit(): void {
    // This will ensure the element is available after the view is fully initialized
    if (!this.contentToConvert) {
      console.error("contentToConvert is undefined");
    }
  }

  downloadPDF() {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const startX = 30;
    const startY = 30;
    const barHeight = 10;
    const gap = 15;
    const chartWidth = 140;
    const titleFontSize = 14;
    const contentFontSize = 10;
    const colors = {
      gradeA: "#FF9263",
      gradeB: "#5F75E9",
      gradeC: "#3DE188",
    };

    // Title
    doc.setFontSize(titleFontSize);
    doc.text(`${this.name}'s Report`, pageWidth / 2, 20, { align: "center" });

    // Check if report data exists
    if (Object.keys(this.reportData).length === 0) {
      doc.setFontSize(contentFontSize);
      doc.text("No data available to display.", startX, startY);
      doc.save(`${this.createdDate}_Report.pdf`);
      return;
    }

    // Transform report data into the format needed for visualization
    const groupedData = Object.entries(this.reportData).map(
      ([cropName, grades]) => ({
        cropName,
        gradeA: grades["Grade A"] || 0,
        gradeB: grades["Grade B"] || 0,
        gradeC: grades["Grade C"] || 0,
        totalWeight: grades["Total"] || 0,
      }),
    );

    const maxWeight = Math.max(...groupedData.map((crop) => crop.totalWeight));

    // Draw chart bars for each crop
    let currentY = startY;
    groupedData.forEach((crop) => {
      let currentX = startX;
      const labelYOffset = currentY + barHeight / 2 + 3;

      // Crop Name Label
      doc.setFontSize(contentFontSize);
      doc.setTextColor(0, 0, 0);
      doc.text(crop.cropName, startX - 20, labelYOffset);

      // Draw bars for each grade
      const grades = [
        { key: "gradeA", color: colors.gradeA },
        { key: "gradeB", color: colors.gradeB },
        { key: "gradeC", color: colors.gradeC },
      ];

      grades.forEach(({ key, color }) => {
        const gradeWeight = crop[key as keyof typeof crop] as number;
        if (gradeWeight > 0) {
          const barWidth = (gradeWeight / maxWeight) * chartWidth;
          doc.setFillColor(color);
          doc.rect(currentX, currentY, barWidth, barHeight, "F");

          // Display weight inside the bar
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          doc.text(
            `${gradeWeight} kg`,
            currentX + barWidth / 2,
            currentY + barHeight / 2 + 3,
            { align: "center" },
          );
          currentX += barWidth;
        }
      });

      currentY += gap;
    });

    // Draw table header
    const tableStartY = currentY + 20;
    const cellPadding = 5;
    const cellHeight = 8;
    const tableColWidths = [50, 30, 30, 30, 30];
    let rowY = tableStartY;

    const headers = ["Crop", "Grade A", "Grade B", "Grade C", "Total"];
    doc.setFontSize(contentFontSize);
    doc.setTextColor(0, 0, 0);
    headers.forEach((header, index) => {
      const cellX =
        startX + tableColWidths.slice(0, index).reduce((a, b) => a + b, 0);
      doc.rect(cellX, rowY, tableColWidths[index], cellHeight);
      doc.text(header, cellX + cellPadding, rowY + cellHeight / 2 + 3);
    });

    rowY += cellHeight;

    // Draw table rows
    groupedData.forEach((crop) => {
      const cropValues = [
        crop.cropName,
        crop.gradeA ? `${crop.gradeA} kg` : "-",
        crop.gradeB ? `${crop.gradeB} kg` : "-",
        crop.gradeC ? `${crop.gradeC} kg` : "-",
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

    // Save the PDF
    doc.save(`${this.createdDate}_CropGradeReport.pdf`);
  }

  back(): void {
    this.router.navigate(["/reports/collective-officer-report"]);
  }
}
