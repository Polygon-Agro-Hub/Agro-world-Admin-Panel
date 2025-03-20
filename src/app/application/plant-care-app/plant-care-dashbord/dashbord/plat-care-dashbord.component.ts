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

  async captureScreenshot() {
    try {
      // Check if dashboardData is defined
      if (!this.dashboardData) {
        console.error('Error: dashboardData is undefined!');
        return;
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      const margin = 10;
      const pageWidth = pdf.internal.pageSize.getWidth() - 2 * margin;
      const pageHeight = pdf.internal.pageSize.getHeight() - 2 * margin;

      // Add a title to the PDF
      pdf.setFontSize(18);
      pdf.text('Report', margin, margin);
      let y = margin + 15;

      // First row: 6 tiles
      const firstRowTiles = 6;
      const tileGap = 5; // Gap between tiles
      const firstRowTileWidth =
        (pageWidth - (firstRowTiles - 1) * tileGap) / firstRowTiles; // Adjusted width to include gaps
      const firstRowTileHeight = 40;
      const borderRadius = 5; // Border radius for tiles

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

      // Define colors for each tile
      const tileColors = [
        { bg: [34, 139, 34], text: [255, 255, 255] }, // Green for Vegetable
        { bg: [255, 165, 0], text: [0, 0, 0] }, // Orange for Fruits
        { bg: [210, 180, 140], text: [0, 0, 0] }, // Tan for Grains
        { bg: [128, 0, 128], text: [255, 255, 255] }, // Purple for Mushrooms
        { bg: [0, 123, 255], text: [255, 255, 255] }, // Blue for Active Users
        { bg: [220, 53, 69], text: [255, 255, 255] }, // Red for New Users
      ];

      // Add first row tiles with colors, gaps, and border radius
      for (let i = 0; i < firstRowTiles; i++) {
        const x = margin + i * (firstRowTileWidth + tileGap); // Add gap between tiles
        const tileData = firstRowData[i];
        const tileColor = tileColors[i];

        // Set background color
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

        // Set text color
        pdf.setTextColor(
          tileColor.text[0],
          tileColor.text[1],
          tileColor.text[2]
        );

        // Center the text horizontally
        const textWidth = (text: string) =>
          (pdf.getStringUnitWidth(text) * pdf.getFontSize()) /
          pdf.internal.scaleFactor;

        // Add tile content
        pdf.setFontSize(10); // Reduced font size for title
        const titleX = x + (firstRowTileWidth - textWidth(tileData.title)) / 2;
        pdf.text(tileData.title, titleX, y + 10);

        pdf.setFontSize(8); // Reduced font size for value
        const valueX = x + (firstRowTileWidth - textWidth(tileData.value)) / 2;
        pdf.text(tileData.value, valueX, y + 20);

        pdf.setFontSize(12); // Adjusted font size for subValue
        const subValueX =
          x +
          (firstRowTileWidth -
            textWidth(tileData.subValue?.toString() || '0')) /
            2;
        pdf.text(tileData.subValue?.toString() || '0', subValueX, y + 30); // Ensure subValue is a string
      }

      y += firstRowTileHeight + 10;

      // Second row: 3 tiles
      const secondRowTiles = 3;
      const secondRowTileWidth =
        (pageWidth - (secondRowTiles - 1) * tileGap) / secondRowTiles; // Adjusted width to include gaps
      const secondRowTileHeight = 50;

      const secondRowData = [
        {
          title: 'Total Farmers',
          value: this.dashboardData.allusers,
          percentage: '133.33%',
          description: 'Compared to last month',
        },
        {
          title: 'Total farmers with QR',
          value: this.dashboardData.qrUsers,
          percentage: '33.33%',
          description: 'Compared to last month',
        },
        {
          title: 'Total Crop Enrollments',
          value: this.dashboardData.farmerRegistrationCounts,
          percentage: '100.00%',
          description: 'Compared to last month',
        },
      ];

      // Add second row tiles with border radius and gaps
      for (let i = 0; i < secondRowTiles; i++) {
        const x = margin + i * (secondRowTileWidth + tileGap); // Add gap between tiles
        const tileData = secondRowData[i];

        // Draw tile border with rounded corners
        pdf.roundedRect(
          x,
          y,
          secondRowTileWidth,
          secondRowTileHeight,
          borderRadius,
          borderRadius
        );

        // Add tile content
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text(tileData.title, x + 5, y + 10);
        pdf.setFontSize(14);
        pdf.text(tileData.value?.toString() || '0', x + 5, y + 25); // Ensure value is a string
        pdf.setFontSize(10);
        pdf.text(tileData.percentage, x + 5, y + 35);
        pdf.text(tileData.description, x + 5, y + 45);
      }

      y += secondRowTileHeight + 10;

      // Third row: Bar Chart and Pie Chart
      const thirdRowHeight = 80; // Height for the third row
      const chartWidth = (pageWidth - tileGap) / 2; // Width for each chart

      // Create a canvas element for the bar chart
      const barChartCanvas = document.createElement('canvas');
      barChartCanvas.width = chartWidth * 2; // Higher resolution for better quality
      barChartCanvas.height = thirdRowHeight * 2;
      const barChartCtx = barChartCanvas.getContext('2d');

      if (barChartCtx) {
        // Bar Chart Data (Registered/Unregistered)
        const barChartData = {
          labels: ['Registered', 'Unregistered'],
          datasets: [
            {
              label: 'Farmers',
              data: [
                this.dashboardData.qrUsers,
                this.dashboardData.allusers - this.dashboardData.qrUsers,
              ],
              backgroundColor: ['#1E90FF', '#FF6347'], // Blue for Registered, Red for Unregistered
            },
          ],
        };

        // Render Bar Chart
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

        // Wait for the bar chart to render
        await new Promise((resolve) => setTimeout(resolve, 500)); // Adjust the delay as needed

        // Convert Bar Chart to image and add to PDF
        const barChartImage = barChartCanvas.toDataURL('image/png');
        pdf.addImage(
          barChartImage,
          'PNG',
          margin,
          y,
          chartWidth,
          thirdRowHeight
        );

        // Create a canvas element for the pie chart
        const pieChartCanvas = document.createElement('canvas');
        pieChartCanvas.width = chartWidth * 2; // Higher resolution for better quality
        pieChartCanvas.height = thirdRowHeight * 2;
        const pieChartCtx = pieChartCanvas.getContext('2d');

        // Pie Chart Data (Crop Enrollments)
        const pieChartData = {
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
              backgroundColor: ['#228B22', '#FFA500', '#D2B48C', '#800080'], // Colors for crops
            },
          ],
        };

        // Render Pie Chart
        if (pieChartCtx) {
          new Chart(pieChartCtx, {
            type: 'pie',
            data: pieChartData,
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

          // Wait for the pie chart to render
          await new Promise((resolve) => setTimeout(resolve, 500)); // Adjust the delay as needed

          // Convert Pie Chart to image and add to PDF
          const pieChartImage = pieChartCanvas.toDataURL('image/png');
          pdf.addImage(
            pieChartImage,
            'PNG',
            margin + chartWidth + tileGap,
            y,
            chartWidth,
            thirdRowHeight
          );
        }

        y += thirdRowHeight + 10;

        // Add a footer with the current date and time
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(
          `Report generated on ${new Date().toLocaleDateString()}, at ${new Date().toLocaleTimeString()}.`,
          margin,
          pdf.internal.pageSize.getHeight() - margin
        );

        // Save the PDF
        const fileName = `report_${new Date().toISOString().slice(0, 10)}.pdf`;
        pdf.save(fileName);

        // Show a success message
        Swal.fire({
          icon: 'success',
          title: 'Download Complete',
          html: `<b>${fileName}</b> has been downloaded successfully!`,
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while generating the PDF. Please try again.',
      });
    }
  }
}
