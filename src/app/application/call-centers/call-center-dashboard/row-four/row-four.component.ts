import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { Chart, Plugin, registerables } from 'chart.js';
import { MonthlyOverview } from '../../../../models/call-center.model';

Chart.register(...registerables);

// Cycles for any number of months (API allows 2-12); last bar = current month
const PALETTE = ['#adc6ff', '#0057c2'];

@Component({
  selector: 'app-row-four',
  standalone: true,
  imports: [],
  templateUrl: './row-four.component.html',
  styleUrl: './row-four.component.css'
})
export class RowFourComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) monthly!: MonthlyOverview;
  @ViewChild('monthlyCanvas') monthlyCanvas!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;
  private viewReady = false;

  get months() {
    const n = this.monthly.months.length;
    return this.monthly.months.map((m, i) => ({
      ...m,
      color: i === n - 1 ? PALETTE[1] : PALETTE[0],
    }));
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['monthly'] && this.viewReady) this.renderChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private renderChart(): void {
    this.chart?.destroy();
    const months = this.months;
    const growthLabel = this.monthly.growthLabel; // null when previous month has 0 calls -> no pill
    const maxCalls = months.length ? Math.max(...months.map(m => m.calls)) : 0;

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

          if (i === meta.data.length - 1 && growthLabel) {
            ctx.font = '600 11px sans-serif';
            const w = ctx.measureText(growthLabel).width + 20;
            const h = 20;
            const x = bar.x - w / 2;
            const y = bar.y - 8 - 20 - h - 4;
            ctx.fillStyle = '#99f6e4';
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, 10);
            ctx.fill();
            ctx.fillStyle = '#115e59';
            ctx.textBaseline = 'middle';
            ctx.fillText(growthLabel, bar.x, y + h / 2 + 1);
          }
        });
        ctx.restore();
      },
    };

    this.chart = new Chart(this.monthlyCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: months.map(m => m.label),
        datasets: [{
          data: months.map(m => m.calls),
          backgroundColor: months.map(m => m.color),
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
            suggestedMax: Math.max(9, maxCalls + 2),
            ticks: { stepSize: 2, color: '#cbd5e1' },
            grid: { color: '#e2e8f0' },
            border: { display: false },
          },
        },
      },
      plugins: [labelsPlugin],
    });
  }
}