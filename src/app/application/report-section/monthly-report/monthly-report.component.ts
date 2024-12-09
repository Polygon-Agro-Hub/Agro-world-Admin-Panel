import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CollectionService } from '../../../services/collection.service';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-monthly-report',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './monthly-report.component.html',
  styleUrl: './monthly-report.component.css',
})
export class MonthlyReportComponent implements OnInit {
  @ViewChild('contentToConvert', { static: false }) contentToConvert!: ElementRef;
  fromDate: string = '2024/01/05';
  toDate: string = '2024/01/10';
  officerId!: number;
  officerData: any;
  dailyReports: any[] = [];
  generatedTime: string = '';
  generatedDate: string = '';
  finalTotalWeight: number = 0;
  finalTotalFarmers: number = 0;
  isLoading: boolean = true;
  visible:boolean = false;
  maxDate: string = '';
  

  constructor(
    private collectionoOfficer: CollectionCenterService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.officerId = this.route.snapshot.params['id'];
    this.getOfficerDetails(this.officerId);
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
    this.visible = false;
  }

  downloadReport(): void {
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
      pdf.save(`Monthly_Report.pdf`);
    }).catch((error) => {
      console.error('Error generating PDF:', error);
    });
  }

  getOfficerDetails(id: number) {
    this.isLoading = true;
    this.visible = false;
    
    this.collectionoOfficer.getOfficerReportById(id).subscribe(
      (response: any) => {
        this.officerData = response.officerData;
        this.isLoading = false;
        this.visible = true;
      },
      error => {
        console.error('Error fetching officer details:', error);
        this.isLoading = false;
      }
    );
  }

  getCollectionReport(): void {
    this.isLoading = true;
    this.collectionoOfficer.getCollectionReportByOfficerId(this.fromDate, this.toDate, this.officerId).subscribe(
      (response: any) => {
        this.dailyReports = response;
        this.calculateTotalWeight();
        this.calculateTotalFarmers();
        const now = new Date();
        this.generatedTime = now.toLocaleTimeString();
        this.generatedDate = now.toLocaleDateString();
        this.isLoading = false;
      },
      error => {
        console.error('Error fetching collection report:', error);
        this.isLoading = false;
      }
    );
  }

  calculateTotalWeight() {
    this.finalTotalWeight = this.dailyReports.reduce((sum, report) => {
      const weight = parseFloat(report.totalWeight);
      return !isNaN(weight) ? sum + weight : sum;
    }, 0);
  }

  calculateTotalFarmers() {
    this.finalTotalFarmers = this.dailyReports.reduce((sum, report) => {
      const farmers = parseInt(report.totalFarmers); // Fixed key
      return !isNaN(farmers) ? sum + farmers : sum;
    }, 0);
  }
}
