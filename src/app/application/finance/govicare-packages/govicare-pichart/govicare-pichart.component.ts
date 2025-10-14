import { Component, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-govicare-pichart',
  standalone: true,
  imports: [],
  templateUrl: './govicare-pichart.component.html',
  styleUrl: './govicare-pichart.component.css',
})
export class GovicarePichartComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    this.createPieChart();
  }

  private createPieChart(): void {
    const ctx = document.getElementById('pieChart') as HTMLCanvasElement;

    if (!ctx) return;

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Free', 'Pro'],
        datasets: [
          {
            data: [444, 830],
            backgroundColor: [
              '#3B82F6', // Blue for Free
              '#10B981', // Green for Pro
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
            display: false, // We'll use custom legend in HTML
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
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              },
            },
            backgroundColor: '#1E293B',
            titleColor: '#F1F5F9',
            bodyColor: '#F1F5F9',
            borderColor: '#334155',
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
    });
  }
}
