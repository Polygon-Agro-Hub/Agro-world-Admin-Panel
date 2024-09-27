import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';


import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { environment } from '../../../environment/environment';

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
  imports: [CommonModule, HttpClientModule, FormsModule, CanvasJSAngularChartsModule],
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




  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    
  ) {}
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');
      this.name = params.get('name');
      this.fetchReport();
    });
  }

  fetchReport(): void {
    const Token = `${environment.TOKEN}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${Token}`,
      'Content-Type': 'application/json',
    });
    
    const url = `${environment.API_BASE_URL}collection-officer/get-collection-officer-report/${this.id}/${this.createdDate}`;
  
    if (this.id) {
      this.http.get<CropReport>(url, { headers })
      .subscribe(
        (data) => {
          this.reportData = data;
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
        text: "Crop Report by Grade"
      },
      axisY: {
        title: "Weight (Kg)",
        includeZero: true
      },
      toolTip: {
        shared: true,
        content: "<strong>{label}</strong><br/>Total: {y} Kg<br/>Grade A: {gradeA} Kg<br/>Grade B: {gradeB} Kg<br/>Grade C: {gradeC} Kg"
      },
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
  
    // Trigger change detection
    this.cdr.detectChanges();
  }

  onDateChange(): void {
    this.fetchReport();
    
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
    if (!this.contentToConvert) {
      console.error('Content to convert is not available');
      return;
    }

    const element = this.contentToConvert.nativeElement;
    const options = {
      margin: 10,
      filename: `${this.name}_report_${this.createdDate}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(options).save();
  }
}