import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';


import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { environment } from '../../../environment/environment';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CalendarModule } from 'primeng/calendar';
import { FloatLabelModule } from 'primeng/floatlabel';
import Swal from 'sweetalert2';

declare var html2pdf: any;

interface CropReport {
  [crop: string]: {
    'Grade A': number;
    'Grade B': number;
    'Grade C': number;
    'Total': number;
  };
}

@Component({
  selector: 'app-collection-officer-report-view',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, CanvasJSAngularChartsModule, LoadingSpinnerComponent, CalendarModule, FloatLabelModule],
  templateUrl: './collection-officer-report-view.component.html',
  styleUrl: './collection-officer-report-view.component.css'
})
export class CollectionOfficerReportViewComponent implements OnInit {
  @ViewChild('contentToConvert', { static: false }) contentToConvert!: ElementRef;
  id: string | null = null;
  name: string | null = null;
  createdDate: string = new Date().toISOString().split('T')[0];
  
  reportData: CropReport = {};
  chartOptions: any;
  loadingChart = true;
  loadingTable = true;




  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    
  ) {}
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');
      this.name = params.get('name');
      
    });

    setTimeout(() => {
      this.fetchReport();
      
    }, 1000);
  }

  fetchReport(): void {
    const Token = `${environment.TOKEN}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${Token}`,
      'Content-Type': 'application/json',
    });
    this.loadingChart = true;
    this.loadingTable = true;
    
    const url = `${environment.API_BASE_URL}collection-officer/get-collection-officer-report/${this.id}/${this.createdDate}`;
  
    if (this.id) {
      this.http.get<CropReport>(url, { headers })
      .subscribe(
        (data) => {
          this.reportData = data;
          this.loadingTable = false;
          this.updateChartOptions();
          console.log('Report data:', this.reportData);
        },
        (error) => {
          console.error('Error fetching report:', error);
        }
      );
    }
  }

  updateChartOptions(): void {
    // Clear the chartData array
    let chartData: any[] = [];
  
    console.log('Updating chart options. Current reportData:', this.reportData);
  
    // Only proceed if reportData is not empty
    if (Object.keys(this.reportData).length > 0) {
      chartData = Object.entries(this.reportData).map(([crop, grades]) => ({
        label: crop,
        y: grades['Total'],
        gradeA: grades['Grade A'],
        gradeB: grades['Grade B'],
        gradeC: grades['Grade C'],
      }));
    }
  
    console.log('Processed chartData:', chartData);
  
    this.chartOptions = {
      animationEnabled: true,
      exportEnabled: true,
      title: {
        text: `Crop Report by Grade ${this.createdDate}`
      },
      axisY: {
        title: "Weight (Kg)",
        includeZero: true
      },
      // toolTip: {
      //   shared: true,
      //   content: "<strong>{label}</strong><br/>Total: {y} Kg<br/>Grade A: {gradeA} Kg<br/>Grade B: {gradeB} Kg<br/>Grade C: {gradeC} Kg"
      // },
      legend: {
        verticalAlign: "top"
      },
      data: [
        {
          type: "stackedBar",
          name: "Grade A",
          showInLegend: true,
          yValueFormatString: "#,### Kg",
          color: "#FF9263",
          dataPoints: chartData.map(item => ({ label: item.label, y: item.gradeA }))
        },
        {
          type: "stackedBar",
          name: "Grade B",
          showInLegend: true,
          yValueFormatString: "#,### Kg",
          color: "#5F75E9",
          dataPoints: chartData.map(item => ({ label: item.label, y: item.gradeB }))
        },
        {
          type: "stackedBar",
          name: "Grade C",
          showInLegend: true,
          yValueFormatString: "#,### Kg",
          color : "#3DE188",
          dataPoints: chartData.map(item => ({ label: item.label, y: item.gradeC }))
        }
      ]
    };
  
    console.log('Updated chartOptions:', this.chartOptions);
    this.loadingChart = false;
  
    // Trigger change detection
    this.cdr.detectChanges();
  }

 

  onDateChange(): void {
    
      console.log(this.createdDate);
    if (this.createdDate === '') {
      Swal.fire({
        title: 'Error!',
        text: 'Please select a date',
        icon: 'error',
        confirmButtonText: 'OK'
      }).then(() => {
        // Set today's date to createdDate after the user presses OK
        this.createdDate = new Date().toISOString().split('T')[0];
        // Call fetchReport after setting the date
        this.fetchReport();
        
      });
    } else {
      
        this.fetchReport();
      
    }
  
  }
  


  get reportEntries(): [string, { 'Grade A': number; 'Grade B': number; 'Grade C': number; 'Total': number }][] {
    return Object.entries(this.reportData);
  }

  ngAfterViewInit(): void {
    // This will ensure the element is available after the view is fully initialized
    if (!this.contentToConvert) {
      console.error('contentToConvert is undefined');
    }
  }

  downloadPDF(): void {
    const element = this.contentToConvert.nativeElement; // Get the content element to convert
    const pdf = new jsPDF('p', 'mm', 'a4'); // Initialize jsPDF with A4 page size
    const margin = 10; // Margin for the content in the PDF
  
    // Calculate available width and height for content in A4 size
    const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
    const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2;
  
    html2canvas(element, { scale: 2 }).then((canvas) => {
      const imageWidth = canvas.width;
      const imageHeight = canvas.height;
  
      // Scale the content to fit within the PDF page
      const scaleFactor = Math.min(pageWidth / imageWidth, pageHeight / imageHeight);
      const outputWidth = imageWidth * scaleFactor;
      const outputHeight = imageHeight * scaleFactor;
  
      const imgData = canvas.toDataURL('image/png'); // Convert canvas to image data
      pdf.addImage(imgData, 'PNG', margin, margin, outputWidth, outputHeight);
  
      // Trigger download
      pdf.save(`Crop_Report_${this.createdDate}.pdf`);
    }).catch((error) => {
      console.error('Error generating PDF:', error);
    });
  }
}