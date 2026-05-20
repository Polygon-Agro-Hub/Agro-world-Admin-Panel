import { Component, Input, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { ThemeService } from '../../../../../services/theme.service';
import { Subscription } from 'rxjs';

interface DashboardData {
  vegCultivation: number;
  spicesCultivation: number;
  cerealsCultivation: number;
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
export class DashbordPieChartComponent implements OnChanges, OnInit, OnDestroy {
  @Input() dashboardData: DashboardData = {} as DashboardData;
  
  data: any;
  options: any;
  private themeSubscription?: Subscription;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // Initialize chart with current theme
    this.updateChartTheme();
    
    // Subscribe to theme changes if your ThemeService has an observable
    // If not, you can use a polling approach or event listener
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
        this.dashboardData.mushCultivation
      );
    }
  }

  private subscribeToThemeChanges(): void {
    // Subscribe to theme changes using the enhanced ThemeService
    this.themeSubscription = this.themeService.themeChanged$.subscribe(() => {
      this.updateChartTheme();
    });
  }

  private updateChartTheme(): void {
    const isDark = this.themeService.isDarkTheme();
    const labelColor = isDark ? '#ffffff' : '#333333';
    
    if (this.options) {
      this.options.plugins.legend.labels = {
        color: labelColor
      };
      // Force chart to re-render
      this.options = { ...this.options };
    }
  }

  initializeChart(
    vegCultivation: number,
    spicesCultivation: number,
    cerealsCultivation: number,
    fruitCultivation: number,
    mushCultivation: number
  ) {
    const total =
      vegCultivation + spicesCultivation + cerealsCultivation + fruitCultivation + mushCultivation;

    const calculatePercentage = (value: number) =>
      total ? ((value / total) * 100).toFixed(0) : '0';

    this.data = {
      labels: ['Vegetables', 'Spices', 'Cereals', 'Fruits', 'Mushrooms'],
      datasets: [
        {
          data: [
            calculatePercentage(vegCultivation),
            calculatePercentage(spicesCultivation),
            calculatePercentage(cerealsCultivation),
            calculatePercentage(fruitCultivation),
            calculatePercentage(mushCultivation),
          ],
          backgroundColor: ['#2BA297', '#A54D00', '#3B82F6', '#FB923C', '#A05CA6'],
          hoverBackgroundColor: ['#2BA297', '#A54D00', '#3B82F6', '#FB923C',  '#A05CA6'],
        },
      ],
    };

    // Get current theme colors
    const isDark = this.themeService.isDarkTheme();
    const labelColor = isDark ? '#ffffff' : '#333333';

    this.options = {
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: labelColor,
          },
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem: any) => {
              let dataset = tooltipItem.dataset.data;
              let index = tooltipItem.dataIndex;
              return `${dataset[index]}%`;
            },
          },
        },
      },
      cutout: '60%',
    };
  }
}