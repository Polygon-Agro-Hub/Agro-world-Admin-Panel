import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface StatCard {
  label: string;
  value: number;
  color: string;
  bg: string;
  icon: string;
}

interface HourRow {
  label: string;
  calls: number;
}

interface TrendRange {
  label: string;
  sub: string;
  title: string;
  view: string;
  xTitle: string;
  labels: string[];
  data: number[];
}

@Component({
  selector: 'app-left-column',
  standalone: true,
  imports: [],
  templateUrl: './left-column.component.html',
  styleUrl: './left-column.component.css'
})
export class LeftColumnComponent implements AfterViewInit, OnDestroy {
  @ViewChild('trendCanvas') trendCanvas!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  selectedTime = '22:05';

  stats: StatCard[] = [
    { label: 'Incoming', value: 0, color: '#1d4ed8', bg: '#dbeafe', icon: 'fa-arrow-down' },
    { label: 'Answered', value: 0, color: '#047857', bg: '#d1fae5', icon: 'fa-phone-volume' },
    { label: 'Outgoing', value: 0, color: '#2563eb', bg: '#e0e7ff', icon: 'fa-arrow-up' },
    { label: 'Failed', value: 0, color: '#dc2626', bg: '#fee2e2', icon: 'fa-phone-slash' },
    { label: 'Voicemail', value: 0, color: '#b45309', bg: '#fef3c7', icon: 'fa-voicemail' },
    { label: 'Transfer', value: 0, color: '#d97706', bg: '#ffedd5', icon: 'fa-share' },
  ];

  conferenceSessions = 0;

  hours: HourRow[] = [
    { label: '8 AM', calls: 0 },
    { label: '9 AM', calls: 0 },
    { label: '10 AM', calls: 0 },
    { label: '11 AM', calls: 0 },
  ];
  totalHours = 11;

  ranges: TrendRange[] = [
    {
      label: '13 Weeks', sub: 'Weeks', title: '13 Weeks', view: 'Weekly view', xTitle: 'Calendar Weeks (2026)',
      labels: ['W36', 'W37', 'W38', 'W39'], data: [16, 13, 15, 0],
    },
    {
      label: '26 Weeks', sub: 'Weeks', title: '26 Weeks', view: 'Weekly view', xTitle: 'Calendar Weeks (2026)',
      labels: ['W30', 'W31', 'W32', 'W33', 'W34', 'W35', 'W36', 'W37', 'W38', 'W39'],
      data: [9, 12, 7, 14, 10, 11, 16, 13, 15, 0],
    },
    {
      label: '12 Months', sub: 'Months', title: '12 Months', view: 'Monthly view', xTitle: 'Months',
      labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      data: [40, 52, 47, 38, 44, 60, 55, 49, 62, 58, 66, 44],
    },
    {
      label: '24 Months', sub: 'Months', title: '24 Months', view: 'Monthly view', xTitle: 'Months',
      labels: Array.from({ length: 24 }, (_, i) => `M${i + 1}`),
      data: Array.from({ length: 24 }, (_, i) => 30 + ((i * 17) % 40)),
    },
  ];
  selectedRange = this.ranges[0];

  get maxHourCalls(): number {
    return Math.max(...this.hours.map(h => h.calls), 0);
  }

  get rangeTotal(): number {
    return this.selectedRange.data.reduce((a, b) => a + b, 0);
  }

  get rangeAverage(): number {
    return Math.round(this.rangeTotal / this.selectedRange.data.length);
  }

  get busiest(): { label: string; calls: number } {
    const d = this.selectedRange.data;
    const i = d.indexOf(Math.max(...d));
    return { label: this.selectedRange.labels[i], calls: d[i] };
  }

  barWidth(calls: number): number {
    const max = this.maxHourCalls;
    return max ? (calls / max) * 100 : 0;
  }

  peakPercent(calls: number): number {
    const max = this.maxHourCalls;
    return max ? Math.round((calls / max) * 100) : 0;
  }

  shiftTime(deltaHours: number): void {
    const [h, m] = this.selectedTime.split(':').map(Number);
    const nh = (h + deltaHours + 24) % 24;
    this.selectedTime = `${String(nh).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  selectRange(range: TrendRange): void {
    this.selectedRange = range;
    this.renderChart();
  }

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private renderChart(): void {
    this.chart?.destroy();
    const r = this.selectedRange;
    const max = Math.max(...r.data);
    const colors = ['#0052cc', '#00806b', '#b0c4ff'];
    this.chart = new Chart(this.trendCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: r.labels,
        datasets: [{
          data: r.data,
          backgroundColor: r.data.map((_, i) => colors[i % colors.length]),
          borderRadius: 4,
          maxBarThickness: 56,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { display: false },
            title: { display: true, text: r.xTitle, color: '#9ca3af', font: { size: 10 } },
          },
          y: {
            beginAtZero: true,
            suggestedMax: max + 2,
            ticks: { display: false },
            grid: { color: '#e5e7eb' },
            border: { display: false },
          },
        },
      },
    });
  }
}
