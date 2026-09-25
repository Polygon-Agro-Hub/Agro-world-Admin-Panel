import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Chart, Plugin, registerables } from 'chart.js';

Chart.register(...registerables);

interface MonthTotal {
  label: string;
  calls: number;
  color: string;
}

@Component({
  selector: 'app-row-four',
  standalone: true,
  imports: [],
  templateUrl: './row-four.component.html',
  styleUrl: './row-four.component.css'
})
export class RowFourComponent implements AfterViewInit, OnDestroy {
  @ViewChild('monthlyCanvas') monthlyCanvas!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  months: MonthTotal[] = [
    { label: 'Aug 2026', calls: 5, color: '#0057c2' },
    { label: 'Sept 2026', calls: 9, color: '#adc6ff' },
  ];

  get growthPercent(): number {
    const [prev, curr] = this.months;
    return prev.calls ? Math.round(((curr.calls - prev.calls) / prev.calls) * 100) : 0;
  }

  ngAfterViewInit(): void {
    const growth = this.growthPercent;

    // Draws the call count above each bar and a growth pill above the last bar
    const labelsPlugin: Plugin<'bar'> = {
      id: 'barLabels',
      afterDatasetsDraw: (chart) => {
        const ctx = chart.ctx;
        const meta = chart.getDatasetMeta(0);
        ctx.save();
        meta.data.forEach((bar, i) => {
          const value = chart.data.datasets[0].data[i] as number;
          ctx.font = '600 14px sans-serif';
          ctx.fillStyle = '#111827';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(String(value), bar.x, bar.y - 8);

          if (i === meta.data.length - 1) {
            const text = `${growth >= 0 ? '+' : ''}${growth}%`;
            ctx.font = '600 11px sans-serif';
            const w = ctx.measureText(text).width + 20;
            const h = 20;
            const x = bar.x - w / 2;
            const y = bar.y - 8 - 20 - h - 4;
            ctx.fillStyle = '#99f6e4';
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, 10);
            ctx.fill();
            ctx.fillStyle = '#115e59';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, bar.x, y + h / 2 + 1);
          }
        });
        ctx.restore();
      },
    };

    this.chart = new Chart(this.monthlyCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: this.months.map(m => m.label),
        datasets: [{
          data: this.months.map(m => m.calls),
          backgroundColor: this.months.map(m => m.color),
          borderRadius: { topLeft: 8, topRight: 8 },
          borderSkipped: false,
          maxBarThickness: 100,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 40 } },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: '#111827', font: { weight: 600 } },
          },
          y: {
            beginAtZero: true,
            suggestedMax: 9,
            ticks: { stepSize: 2, color: '#cbd5e1' },
            grid: { color: '#e2e8f0' },
            border: { display: false },
          },
        },
      },
      plugins: [labelsPlugin],
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
