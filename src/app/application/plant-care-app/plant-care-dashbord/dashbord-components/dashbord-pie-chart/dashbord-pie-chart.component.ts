import { Component } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { PlantcareDashbordService } from '../../../../../services/plant-care/plantcare-dashbord.service';

interface DashboardData {
  vegCultivation: number;
  grainCultivation: number;
  fruitCultivation: number;
  mushCultivation: number;
}

@Component({
  selector: 'app-dashbord-pie-chart',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './dashbord-pie-chart.component.html',
  styleUrls: ['./dashbord-pie-chart.component.css'],
})
export class DashbordPieChartComponent {
  dashboardData: DashboardData = {} as DashboardData;
  data: any;
  options: any;

  constructor(private dashboardService: PlantcareDashbordService) {}

  ngOnInit(): void {
    this.dashboardService.getDashboardData().subscribe((data) => {
      const {
        vegCultivation,
        grainCultivation,
        fruitCultivation,
        mushCultivation,
      } = data.data;
      this.initializeChart(
        vegCultivation,
        grainCultivation,
        fruitCultivation,
        mushCultivation
      );
    });
  }

  initializeChart(
    vegCultivation: number,
    grainCultivation: number,
    fruitCultivation: number,
    mushCultivation: number
  ) {
    const total =
      vegCultivation + grainCultivation + fruitCultivation + mushCultivation;

    // Prevent division by zero
    const calculatePercentage = (value: number) =>
      total ? ((value / total) * 100).toFixed(0) : '0';

    this.data = {
      labels: ['Vegetables', 'Fruits', 'Grains', 'Mushrooms'],
      datasets: [
        {
          data: [
            calculatePercentage(vegCultivation),
            calculatePercentage(fruitCultivation),
            calculatePercentage(grainCultivation),
            calculatePercentage(mushCultivation),
          ],
          backgroundColor: ['#4E9F78', '#E68A3D', '#3D75E6', '#9156A0'],
          hoverBackgroundColor: ['#4E9F78', '#E68A3D', '#3D75E6', '#9156A0'],
        },
      ],
    };

    this.options = {
      plugins: {
        legend: {
          position: 'bottom',
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem: any) => {
              let dataset = tooltipItem.dataset.data;
              let index = tooltipItem.dataIndex;
              return `${dataset[index]}%`; // Show percentage in tooltip
            },
          },
        },
      },
      cutout: '60%', // Converts to Donut Chart
    };
  }
}
