import { Component, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import Chart from 'chart.js/auto';
import { PackageEnrollments } from '../../../../services/plant-care/plantcare-users.service';

@Component({
  selector: 'app-govicare-pichart',
  standalone: true,
  imports: [],
  templateUrl: './govicare-pichart.component.html',
  styleUrl: './govicare-pichart.component.css',
})
export class GovicarePichartComponent implements AfterViewInit, OnChanges {
  @Input() enrollments: PackageEnrollments | null = null;
  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createPieChart();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['enrollments'] && !changes['enrollments'].firstChange) {
      setTimeout(() => {
        this.createPieChart();
      });
    }
  }

  private createPieChart(): void {
    const ctx = document.getElementById('pieChart') as HTMLCanvasElement;

    if (!ctx) return;

    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    const freeCount = this.enrollments?.free || 0;
    const proCount = this.enrollments?.pro || 0;

    // Plugin to draw text in the center of each slice
    const centerTextPlugin = {
      id: 'centerText',
      afterDatasetDraw(chart: any) {
        const { ctx, data } = chart;
        const meta = chart.getDatasetMeta(0);
        
        meta.data.forEach((element: any, index: number) => {
          const { x, y } = element.tooltipPosition();
          
          ctx.save();
          ctx.font = 'bold 16px Arial';
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const value = data.datasets[0].data[index];
          ctx.fillText(value.toString(), x, y);
          
          ctx.restore();
        });
      }
    };

    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Free', 'Pro'],
        datasets: [
          {
            data: [freeCount, proCount],
            backgroundColor: [
              '#415CFF', // Blue for Free
              '#FFDD00', // Yellow for Pro
            ],
            borderColor: '#061E2C',
            borderWidth: 4,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce(
                  (a: number, b: number) => a + b,
                  0
                );
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                return `${label}: ${value} (${percentage}%)`;
              },
            },
            backgroundColor: '#1E293B',
            titleColor: '#F1F5F9',
            bodyColor: '#F1F5F9',
            borderColor: '#000000',
            borderWidth: 1,
          },
        },
        layout: {
          padding: {
            top: 10,
            bottom: 10,
          },
        },
      },
      plugins: [centerTextPlugin],
    });
  }
}