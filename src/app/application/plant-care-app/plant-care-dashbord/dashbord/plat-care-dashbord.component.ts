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
import Swal from 'sweetalert2';
import { Chart } from 'chart.js';

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
  isDownloading: boolean = false;

  constructor(private dashbordService: PlantcareDashbordService) {}

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData(district?: string): void {
    this.isLoading = true;
    this.dashbordService.getDashboardData(district).subscribe(
      (data: any) => {
        if (data && data.data) {
          this.dashboardData = data.data;
          // Ensure percentages are numbers
          this.dashboardData.user_increase_percentage =
            Number(this.dashboardData.user_increase_percentage) || 0;
          this.dashboardData.qr_user_increase_percentage =
            Number(this.dashboardData.qr_user_increase_percentage) || 0;
          this.dashboardData.cultivation_increase_percentage =
            Number(this.dashboardData.cultivation_increase_percentage) || 0;

          this.calculateTotalCultivation();
          this.hasData = true;
        } else {
          this.hasData = false;
        }
        this.isLoading = false;
      },
      (error) => {
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

  async captureScreenshot(): Promise<void> {
    this.isDownloading = true;

    try {
      if (!this.dashboardData) {
        return;
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      const margin = 10;
      const pageWidth = pdf.internal.pageSize.getWidth() - 2 * margin;
      const pageHeight = pdf.internal.pageSize.getHeight() - 2 * margin;

      pdf.setFontSize(18);
      pdf.text('Report', margin, margin);
      let y = margin + 15;

      const firstRowTiles = 6;
      const tileGap = 5;
      const firstRowTileWidth =
        (pageWidth - (firstRowTiles - 1) * tileGap) / firstRowTiles;
      const firstRowTileHeight = 40;
      const borderRadius = 5;

      const firstRowData = [
        {
          title: 'Vegetable',
          value: 'Total Enrollments',
          subValue: this.dashboardData.vegCultivation,
        },
        {
          title: 'Fruits',
          value: 'Total Enrollments',
          subValue: this.dashboardData.fruitCultivation,
        },
        {
          title: 'Grains',
          value: 'Total Enrollments',
          subValue: this.dashboardData.grainCultivation,
        },
        {
          title: 'Mushrooms',
          value: 'Total Enrollments',
          subValue: this.dashboardData.mushCultivation,
        },
        {
          title: 'Active Users',
          value: 'Today',
          subValue: this.dashboardData.active_users,
        },
        {
          title: 'New Users',
          value: 'Today',
          subValue: this.dashboardData.new_users,
        },
      ];

      const tileColors = [
        { bg: [13, 148, 136], text: [255, 255, 255] },
        { bg: [218, 98, 0], text: [255, 255, 255] },
        { bg: [59, 130, 246], text: [255, 255, 255] },
        { bg: [160, 92, 166], text: [255, 255, 255] },
        { bg: [0, 123, 255], text: [0, 0, 0] },
        { bg: [220, 53, 69], text: [0, 0, 0] },
      ];

      for (let i = 0; i < firstRowTiles; i++) {
        const x = margin + i * (firstRowTileWidth + tileGap);
        const tileData = firstRowData[i];
        const tileColor = tileColors[i];

        const isLastTwoTiles = i >= firstRowTiles - 2;

        if (!isLastTwoTiles) {
          pdf.setFillColor(tileColor.bg[0], tileColor.bg[1], tileColor.bg[2]);
          pdf.roundedRect(
            x,
            y,
            firstRowTileWidth,
            firstRowTileHeight,
            borderRadius,
            borderRadius,
            'F'
          );
        } else {
          pdf.setDrawColor(0, 0, 0);
          pdf.setLineWidth(0.5);
          pdf.roundedRect(
            x,
            y,
            firstRowTileWidth,
            firstRowTileHeight,
            borderRadius,
            borderRadius,
            'S'
          );
        }

        pdf.setTextColor(
          tileColor.text[0],
          tileColor.text[1],
          tileColor.text[2]
        );

        const textWidth = (text: string) =>
          (pdf.getStringUnitWidth(text) * pdf.getFontSize()) /
          pdf.internal.scaleFactor;

        pdf.setFontSize(10);
        const titleX = x + (firstRowTileWidth - textWidth(tileData.title)) / 2;
        pdf.text(tileData.title, titleX, y + 10);

        pdf.setFontSize(8);
        const valueX = x + (firstRowTileWidth - textWidth(tileData.value)) / 2;
        pdf.text(tileData.value, valueX, y + 20);

        pdf.setFontSize(12);
        const subValueX =
          x +
          (firstRowTileWidth -
            textWidth(tileData.subValue?.toString() || '0')) /
            2;
        pdf.text(tileData.subValue?.toString() || '0', subValueX, y + 30);
      }

      y += firstRowTileHeight + 10;

      const secondRowTiles = 3;
      const secondRowTileWidth =
        (pageWidth - (secondRowTiles - 1) * tileGap) / secondRowTiles;
      const secondRowTileHeight = 50;

      const secondRowData = [
        {
          title: 'Total Farmers',
          value: this.dashboardData.allusers,
          percentage: this.dashboardData.user_increase_percentage,
          description: 'Compared to last month',
        },
        {
          title: 'Total farmers with QR',
          value: this.dashboardData.qrUsers,
          percentage: this.dashboardData.qr_user_increase_percentage,
          description: 'Compared to last month',
        },
        {
          title: 'Total Crop Enrollments',
          value: this.totalCultivationCount,
          percentage: this.dashboardData.cultivation_increase_percentage,
          description: 'Compared to last month',
        },
      ];

      for (let i = 0; i < secondRowTiles; i++) {
        const x = margin + i * (secondRowTileWidth + tileGap);
        const tileData = secondRowData[i];

        pdf.roundedRect(
          x,
          y,
          secondRowTileWidth,
          secondRowTileHeight,
          borderRadius,
          borderRadius
        );

        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text(tileData.title, x + 5, y + 10);
        pdf.setFontSize(14);
        pdf.text(tileData.value?.toString() || '0', x + 5, y + 25);
        pdf.setFontSize(10);
        pdf.text(tileData.percentage.toString(), x + 5, y + 35);
        pdf.text(tileData.description, x + 5, y + 45);
      }

      y += secondRowTileHeight + 10;

      const thirdRowHeight = 80;
      const chartWidth = (pageWidth - tileGap) / 2;

      const barChartCanvas = document.createElement('canvas');
      const scaleFactor = 5;
      const dpr = window.devicePixelRatio || 1;
      barChartCanvas.width = chartWidth * scaleFactor * dpr;
      barChartCanvas.height = thirdRowHeight * scaleFactor * dpr;
      const barChartCtx = barChartCanvas.getContext('2d');

      if (barChartCtx) {
        barChartCanvas.style.width = `${chartWidth}px`;
        barChartCanvas.style.height = `${thirdRowHeight}px`;
        barChartCtx.scale(dpr * scaleFactor, dpr * scaleFactor);

        const barChartData = {
          labels: ['QR Registered', 'Unregistered'],
          datasets: [
            {
              label: 'Farmers',
              data: [
                this.dashboardData.qrUsers,
                this.dashboardData.allusers - this.dashboardData.qrUsers,
              ],
              backgroundColor: ['#90EE90', '#ADD8E6'],
            },
          ],
        };

        new Chart(barChartCtx, {
          type: 'bar',
          data: barChartData,
          options: {
            responsive: false,
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });

        await new Promise((resolve) => setTimeout(resolve, 500));

        const barChartImage = barChartCanvas.toDataURL('image/png', 1.0);
        pdf.addImage(
          barChartImage,
          'PNG',
          margin,
          y,
          chartWidth,
          thirdRowHeight
        );

        const donutChartCanvas = document.createElement('canvas');
        donutChartCanvas.width = chartWidth * scaleFactor * dpr;
        donutChartCanvas.height = thirdRowHeight * scaleFactor * dpr;
        const donutChartCtx = donutChartCanvas.getContext('2d');

        donutChartCanvas.style.width = `${chartWidth}px`;
        donutChartCanvas.style.height = `${thirdRowHeight}px`;
        if (donutChartCtx) {
          donutChartCtx.scale(dpr * scaleFactor, dpr * scaleFactor);
        }

        const donutChartData = {
          labels: ['Vegetables', 'Fruits', 'Grains', 'Mushrooms'],
          datasets: [
            {
              label: 'Crop Enrollments',
              data: [
                this.dashboardData.vegCultivation,
                this.dashboardData.fruitCultivation,
                this.dashboardData.grainCultivation,
                this.dashboardData.mushCultivation,
              ],
              backgroundColor: ['#4E9F78', '#E68A3D', '#3D75E6', '#9156A0'],
            },
          ],
        };

        if (donutChartCtx) {
          new Chart(donutChartCtx, {
            type: 'doughnut',
            data: donutChartData,
            options: {
              responsive: false,
              plugins: {
                datalabels: {
                  color: '#fff',
                  formatter: (value) => `${value}%`,
                },
              },
            },
          });

          await new Promise((resolve) => setTimeout(resolve, 500));

          const donutChartImage = donutChartCanvas.toDataURL('image/png', 1.0);
          pdf.addImage(
            donutChartImage,
            'PNG',
            margin + chartWidth + tileGap,
            y,
            chartWidth,
            thirdRowHeight
          );
        }

        y += thirdRowHeight + 10;

        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(
          `Report generated on ${new Date().toLocaleDateString()}, at ${new Date().toLocaleTimeString()}.`,
          margin,
          pdf.internal.pageSize.getHeight() - margin
        );

        const fileName = `report_${new Date().toISOString().slice(0, 10)}.pdf`;
        pdf.save(fileName);
      }
    } finally {
      this.isDownloading = false;
    }
  }
}
