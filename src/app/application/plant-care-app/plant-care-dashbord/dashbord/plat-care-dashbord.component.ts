import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashbordFirstRowComponent } from '../dashbord-components/dashbord-first-row/dashbord-first-row.component';
import { DashbordSecondRowComponent } from '../dashbord-components/dashbord-second-row/dashbord-second-row.component';
import { DashbordAreaChartComponent } from '../dashbord-components/dashbord-area-chart/dashbord-area-chart.component';
import { DashbordPieChartComponent } from '../dashbord-components/dashbord-pie-chart/dashbord-pie-chart.component';
import { PlantcareDashbordService } from '../../../../services/plant-care/plantcare-dashbord.service';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface DashboardData {
  active_users: any;
  new_users: number;
  allusersTillPreviousMonth: number;
  user_increase_percentage: number;
  qr_user_increase_percentage: number;
  vegCultivation: number;
  grainCultivation: number;
  fruitCultivation: number;
  mushCultivation: number;
  allusers: number;
  qrUsers: number;
  farmerRegistrationCounts: any;
  total_cultivation_till_previous_month: number;
  cultivation_increase_percentage: number;
}

@Component({
  selector: 'app-plat-care-dashbord',
  standalone: true,
  imports: [
    LoadingSpinnerComponent,
    DashbordFirstRowComponent,
    DashbordSecondRowComponent,
    DashbordAreaChartComponent,
    DashbordPieChartComponent,
    CommonModule,
  ],
  templateUrl: './plat-care-dashbord.component.html',
  styleUrl: './plat-care-dashbord.component.css',
})
export class PlatCareDashbordComponent implements OnInit {
  @ViewChild('reportSection', { static: false }) reportSection!: ElementRef;

  dashboardData: DashboardData = {} as DashboardData;
  totalCultivationCount: number = 0;
  hasData: boolean = false;
  isLoading: boolean = true;

  constructor(private dashbordService: PlantcareDashbordService) {}

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData(district?: string): void {
    this.isLoading = true;
    this.dashbordService.getDashboardData(district).subscribe(
      (data: any) => {
        console.log('dashboard data showing', data);

        if (data && data.data) {
          this.dashboardData = data.data;
          console.log('hit 01', this.dashboardData.farmerRegistrationCounts);
          console.log(this.dashboardData);
          this.calculateTotalCultivation();
          this.hasData = true;
        } else {
          console.warn('No data received from API.');
          this.hasData = false;
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching dashboard data:', error);
        this.hasData = false;
        this.isLoading = false;
      }
    );
  }

  calculateTotalCultivation(): void {
    this.totalCultivationCount =
      this.dashboardData.vegCultivation +
      this.dashboardData.grainCultivation +
      this.dashboardData.fruitCultivation +
      this.dashboardData.mushCultivation;
  }

  onDistrictSelected(district: string): void {
    this.fetchDashboardData(district);
  }

  captureScreenshot(): void {
    console.log('Capturing screenshot...');

    if (!this.reportSection) {
      console.error('Error: reportSection is undefined!');
      return;
    }

    // Hide the "Export Report" button
    const exportButton = document.querySelector('button') as HTMLElement;
    if (exportButton) {
      exportButton.style.display = 'none';
    }

    html2canvas(this.reportSection.nativeElement, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Handle cross-origin images
      logging: true, // Enable logging for debugging
      allowTaint: true, // Allow tainted images
      imageTimeout: 15000, // Set a timeout for images to load
    })
      .then((canvas) => {
        // Convert canvas to JPEG with reduced quality
        const imgData = canvas.toDataURL('image/jpeg', 0.6); // Use JPEG format with quality setting

        // Show the "Export Report" button again
        if (exportButton) {
          exportButton.style.display = 'block';
        }

        // Create a PDF and add the image with padding
        const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait mode, millimeters, A4 size
        const imgWidth = 190; // A4 width in mm minus padding (210 - 20)
        const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio

        // Add padding (10mm on each side)
        const padding = 10; // Padding in mm
        const x = padding; // X coordinate with padding
        const y = padding; // Y coordinate with padding

        pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight); // Add image to PDF with padding
        pdf.save('report.pdf'); // Download PDF file
      })
      .catch((error) => {
        console.error('Error capturing screenshot:', error);

        // Ensure the button is shown again in case of error
        if (exportButton) {
          exportButton.style.display = 'block';
        }
      });
  }
}
