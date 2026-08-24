import { Component, Input, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { ThemeService } from '../../../../../services/theme.service';
import { Subscription } from 'rxjs';

interface DashboardData {
  vegCultivation: number;
  spicesCultivation: number;
  cerealsCultivation: number;
  fruitCultivation: number;
  leLegumesCultivation: number;
  mushCultivation: number;
}

@Component({
  selector: 'app-dashbord-pie-chart',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './dashbord-pie-chart.component.html',
  styleUrls: ['./dashbord-pie-chart.component.css'],
})
export class DashbordPieChartComponent implements OnChanges, OnInit, OnDestroy {
  @Input() dashboardData: DashboardData = {} as DashboardData;

  data: any;
  options: any;
  private themeSubscription?: Subscription;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.updateChartTheme();
    this.subscribeToThemeChanges();
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dashboardData'] && changes['dashboardData'].currentValue) {
      this.initializeChart(
        this.dashboardData.vegCultivation,
        this.dashboardData.spicesCultivation,
        this.dashboardData.cerealsCultivation,
        this.dashboardData.fruitCultivation,
        this.dashboardData.leLegumesCultivation,
        this.dashboardData.mushCultivation
      );
    }
  }

  private subscribeToThemeChanges(): void {
    this.themeSubscription = this.themeService.themeChanged$.subscribe(() => {
      this.updateChartTheme();
    });
  }

  private updateChartTheme(): void {
    const isDark = this.themeService.isDarkTheme();
    const labelColor = isDark ? '#ffffff' : '#333333';

    if (this.options) {
      this.options.plugins.legend.labels = {
        color: labelColor,
        usePointStyle: true,      // ← circle bullets
        pointStyle: 'circle',     // ← circle bullets
        pointStyleWidth: 15,
        padding: 20,
      };
      this.options = { ...this.options };
    }
  }

  initializeChart(
    vegCultivation: number,
    spicesCultivation: number,
    cerealsCultivation: number,
    fruitCultivation: number,
    leLegumesCultivation: number,
    mushCultivation: number
  ) {
    const total =
      vegCultivation + spicesCultivation + cerealsCultivation +
      fruitCultivation + leLegumesCultivation + mushCultivation;

    const calculatePercentage = (value: number) =>
      total ? ((value / total) * 100).toFixed(0) : '0';

    this.data = {
      labels: ['Vegetables', 'Spices', 'Cereals', 'Fruits', 'Legumes', 'Mushrooms'],
      datasets: [
        {
          data: [
            calculatePercentage(vegCultivation),
            calculatePercentage(spicesCultivation),
            calculatePercentage(cerealsCultivation),
            calculatePercentage(fruitCultivation),
            calculatePercentage(leLegumesCultivation),
            calculatePercentage(mushCultivation),
          ],
          backgroundColor: ['#2BA297', '#A54D00', '#3B82F6', '#FB923C', '#648885', '#9156A0'],
          hoverBackgroundColor: ['#2BA297', '#A54D00', '#3B82F6', '#FB923C', '#648885', '#9156A0'],
        },
      ],
    };

    const isDark = this.themeService.isDarkTheme();
    const labelColor = isDark ? '#ffffff' : '#333333';

    this.options = {
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: labelColor,
            usePointStyle: true,      // ← circle bullets
            pointStyle: 'circle',     // ← circle bullets
            pointStyleWidth: 15,      // ← bullet size
            padding: 20,              // ← spacing between items
          },
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem: any) => {
              const dataset = tooltipItem.dataset.data;
              const index = tooltipItem.dataIndex;
              return `${dataset[index]}%`;
            },
          },
        },
      },
      cutout: '60%',
    };
  }
}