import { Component, AfterViewInit, Input, OnInit, OnDestroy } from '@angular/core';
import { Chart, ChartType } from 'chart.js/auto';
import { ThemeService } from '../../../../../services/theme.service';
import { Subscription } from 'rxjs';

interface PieData {
  category: string[];
  count: number[];
}

@Component({
  selector: 'app-dashbord-pie-chart',
  standalone: true,
  templateUrl: './dashbord-pie-chart.component.html',
  styleUrls: ['./dashbord-pie-chart.component.css'],
})
export class DashbordPieChartComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() pieData!: PieData;

  private chartInstance?: Chart;
  private themeSubscription?: Subscription;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.subscribeToThemeChanges();
  }

  ngAfterViewInit(): void {
    this.initializeChart();
  }

  ngOnDestroy(): void {
    this.themeSubscription?.unsubscribe();
    this.chartInstance?.destroy();
  }

  private subscribeToThemeChanges(): void {
    this.themeSubscription = this.themeService.themeChanged$.subscribe(() => {
      this.updateChartTheme();
    });
  }

  private getLabelColor(): string {
    return this.themeService.isDarkTheme() ? '#ffffff' : '#333333';
  }

  private updateChartTheme(): void {
    if (!this.chartInstance) return;

    const labelColor = this.getLabelColor();
    const legend = this.chartInstance.options.plugins?.legend;

    if (legend?.labels) {
      legend.labels.color = labelColor;
      this.chartInstance.update();
    }
  }

  initializeChart(): void {
    this.chartInstance = new Chart('pieChart', {
      type: 'doughnut' as ChartType,
      data: {
        labels: this.pieData.category,
        datasets: [
          {
            data: this.pieData.count,
            backgroundColor: ['#0D9488', '#A54D00', '#3B82F6', '#FB923C', '#648885', '#A05CA6'],
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: this.getLabelColor(),  // ← reads current theme on init
              usePointStyle: true,
              pointStyle: 'circle',
              pointStyleWidth: 15,
              padding: 20,
            },
          },
        },
      },
    });
  }
}