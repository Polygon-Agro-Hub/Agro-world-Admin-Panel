import {
  AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { HourlyDistribution, TileKey, Timeline, TrendRangeKey, Trends } from '../../../../models/call-center.model';
import { shortDate } from '../../../../utils/call-center.utils';

Chart.register(...registerables);

interface StatDef { key: TileKey; label: string; color: string; bg: string; icon: string; }
interface RangeTab { key: TrendRangeKey; label: string; sub: string; }

@Component({
  selector: 'app-left-column',
  standalone: true,
  imports: [],
  templateUrl: './left-column.component.html',
  styleUrl: './left-column.component.css'
})
export class LeftColumnComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) timeline!: Timeline;
  @Input({ required: true }) hourly!: HourlyDistribution;
  @Input({ required: true }) trends!: Trends;

  @Output() hourChange = new EventEmitter<number>();
  @Output() rangeChange = new EventEmitter<TrendRangeKey>();

  @ViewChild('trendCanvas') trendCanvas!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;
  private viewReady = false;

  showAll = false;

  // UI config only; the numbers come from timeline.tiles
  statDefs: StatDef[] = [
    { key: 'incoming', label: 'Incoming', color: '#1d4ed8', bg: '#dbeafe', icon: 'fa-arrow-down' },
    { key: 'answered', label: 'Answered', color: '#047857', bg: '#d1fae5', icon: 'fa-phone-volume' },
    { key: 'outgoing', label: 'Outgoing', color: '#2563eb', bg: '#e0e7ff', icon: 'fa-arrow-up' },
    { key: 'failed', label: 'Failed', color: '#dc2626', bg: '#fee2e2', icon: 'fa-phone-slash' },
    { key: 'voicemail', label: 'Voicemail', color: '#b45309', bg: '#fef3c7', icon: 'fa-voicemail' },
    { key: 'transfer', label: 'Transfer', color: '#d97706', bg: '#ffedd5', icon: 'fa-share' },
  ];

  ranges: RangeTab[] = [
    { key: '13w', label: '13 Weeks', sub: 'Weeks' },
    { key: '26w', label: '26 Weeks', sub: 'Weeks' },
    { key: '12m', label: '12 Months', sub: 'Months' },
    { key: '24m', label: '24 Months', sub: 'Months' },
  ];

  // ---- timeline (A4) ----
  get selectedTime(): string { return this.timeline.selectedHourLabel; }
  tile(key: TileKey) { return this.timeline.tiles[key]; }
  get conferenceSessions(): number { return this.timeline.tiles.conference.count; }
  get conferencePercent(): number { return this.timeline.tiles.conference.percent; }

  shiftTime(delta: number): void {
    this.hourChange.emit((this.timeline.selectedHour + delta + 24) % 24);
  }

  // ---- hourly distribution (A5) ----
  get hours() { return this.hourly.hours; }
  get visibleHours() { return this.showAll ? this.hourly.hours : this.hourly.hours.slice(0, 4); }
  get totalHours(): number { return this.hourly.hours.length; }
  barWidth(percentOfPeak: number): number { return percentOfPeak; }
  peakPercent(percentOfPeak: number): number { return percentOfPeak; }

  // ---- trends (A8) ----
  get rangeTotal(): number { return this.trends.callsInRange; }
  get rangeAverage(): number { return this.trends.averagePerBucket; }

  get busiest(): { label: string; calls: number } {
    const b = this.trends.busiestPeriod;
    // weekly: "Week 36 (31 Aug)"; monthly: label as-is
    const label = b?.weekStart ? `Week ${b.label.replace(/^W/i, '')} (${shortDate(b.weekStart)})` : (b?.label ?? '--');
    return { label, calls: b?.calls ?? 0 };
  }

  private get xTitle(): string {
    const first = this.trends.buckets[0];
    return first?.weekStart ? `Calendar Weeks (${first.weekStart.slice(0, 4)})` : 'Months';
  }

  selectRange(r: RangeTab): void {
    if (r.key !== this.trends.range) this.rangeChange.emit(r.key);
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trends'] && this.viewReady) this.renderChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private renderChart(): void {
    this.chart?.destroy();
    const buckets = this.trends.buckets;
    const values = buckets.map(b => b.calls);
    const max = values.length ? Math.max(...values) : 0;
    const colors = ['#0052cc', '#00806b', '#b0c4ff'];
    this.chart = new Chart(this.trendCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: buckets.map(b => b.label),
        datasets: [{
          data: values,
          backgroundColor: values.map((_, i) => colors[i % colors.length]),
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
            title: { display: true, text: this.xTitle, color: '#9ca3af', font: { size: 10 } },
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