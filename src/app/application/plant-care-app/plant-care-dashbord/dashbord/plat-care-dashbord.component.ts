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

  fetchDashboardData(): void {
    this.isLoading = true;
    this.dashbordService.getDashboardData().subscribe(
      (data: any) => {
        if (data && data.data) {
          this.dashboardData = data.data;
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

  captureScreenshot(): void {
    console.log('Capturing screenshot...');

    if (!this.reportSection) {
      console.error('Error: reportSection is undefined!');
      return;
    }

    html2canvas(this.reportSection.nativeElement, { scale: 2 }) // Higher scale for better quality
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait mode, millimeters, A4 size
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio

        pdf.addImage(imgData, 'PNG', 0, 10, imgWidth, imgHeight); // Add image to PDF
        pdf.save('report.pdf'); // Download PDF file
      })
      .catch((error) => console.error('Error capturing screenshot:', error));
  }
}
