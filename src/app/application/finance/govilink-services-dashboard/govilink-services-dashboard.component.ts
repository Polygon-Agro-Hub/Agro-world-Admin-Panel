import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {
  FinanceService,
  GoviJobDashboardResponse,
  MonthlyStatistic,
} from '../../../services/finance/finance.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';

interface ChartPoint {
  x: number;
  y: number;
  value: number;
}

interface ChartData {
  labels: string[];
  values: number[];
}

interface ChartPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

@Component({
  selector: 'app-govilink-services-dashboard',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './govilink-services-dashboard.component.html',
  styleUrls: ['./govilink-services-dashboard.component.css'],
})
export class GovilinkServicesDashboardComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @ViewChild('incomeChart') incomeChart!: ElementRef<HTMLCanvasElement>;
  @Input() monthlyStats: MonthlyStatistic[] = [];

  // Data from API
  totalIncome = 0;
  incomeChangePercent = 0;
  incomeStatus = '';
  serviceRequestsThisMonth = 0;
  serviceRequestsToday = 0;

  recentPayments: {
    id: string;
    farmer: string;
    service: string;
    amount: string;
    datetime: string;
  }[] = [];

  isLoading = true;

  constructor(
    private location: Location,
    private financeService: FinanceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['monthlyStats'] && !changes['monthlyStats'].firstChange) {
      setTimeout(() => {
        this.createAreaChart();
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/finance/action/govicare-finance']);
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.financeService.getGoviJobDashboardData().subscribe({
      next: (response: GoviJobDashboardResponse) => {
        if (response.status && response.data) {
          this.updateComponentData(response.data);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
      },
    });
  }

  private updateComponentData(data: any): void {
    // Update statistics
    this.totalIncome = data.statistics.totalIncome || 0;
    this.incomeChangePercent = data.statistics.relativeIncomeValue || 0;
    this.incomeStatus = data.statistics.incomeStatus || 'neutral';
    this.serviceRequestsThisMonth =
      data.statistics.serviceRequestsThisMonth || 0;
    this.serviceRequestsToday = data.statistics.serviceRequestsToday || 0;

    // Update monthly stats for chart
    this.monthlyStats = data.monthlyStatistics || [];

    // Update recent payments
    this.recentPayments = data.recentPayments.map((payment: any) => ({
      id: payment.transactionId,
      farmer: payment.farmerName,
      service: payment.serviceName,
      amount: payment.amount,
      datetime: this.formatDateTime(payment.dateTime),
    }));

    // Update chart
    setTimeout(() => {
      this.createAreaChart();
    });
  }

  private formatDateTime(dateTimeString: string): string {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      });
    } catch (error) {
      return dateTimeString;
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createAreaChart();
    });
  }

  private createAreaChart(): void {
    const data: ChartData = this.prepareChartData();

    const canvas = document.getElementById('MyChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2D context');
      return;
    }

    canvas.width = canvas.offsetWidth;
    canvas.height = 400;

    const padding: ChartPadding = { top: 60, right: 40, bottom: 60, left: 90 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.drawAreaChart(ctx, data, padding, chartWidth, chartHeight);
    this.drawAxes(ctx, data, padding, chartWidth, chartHeight);
  }

  private prepareChartData(): ChartData {
    if (!this.monthlyStats || this.monthlyStats.length === 0) {
      return {
        labels: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
        values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      };
    }

    const labels = this.monthlyStats.map((stat) => stat.monthName);
    const values = this.monthlyStats.map((stat) => Number(stat.revenue) || 0);

    return { labels, values };
  }

  private drawAreaChart(
    ctx: CanvasRenderingContext2D,
    data: ChartData,
    padding: ChartPadding,
    chartWidth: number,
    chartHeight: number
  ): void {
    const maxValue = Math.max(...data.values) || 100000;
    const points: ChartPoint[] = data.values.map(
      (value: number, index: number) => {
        const x =
          padding.left + (index * chartWidth) / (data.labels.length - 1);
        const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
        return { x, y, value };
      }
    );

    const gradient = ctx.createLinearGradient(
      0,
      padding.top,
      0,
      padding.top + chartHeight
    );
    gradient.addColorStop(0, 'rgba(250, 204, 21, 0.6)');
    gradient.addColorStop(1, 'rgba(250, 204, 21, 0.05)');

    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartHeight);

    points.forEach((point: ChartPoint) => {
      ctx.lineTo(point.x, point.y);
    });

    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    points.forEach((point: ChartPoint, index: number) => {
      if (index > 0) {
        ctx.lineTo(point.x, point.y);
      }
    });

    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    points.forEach((point: ChartPoint) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#FACC15';
      ctx.fill();
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  private drawAxes(
    ctx: CanvasRenderingContext2D,
    data: ChartData,
    padding: ChartPadding,
    chartWidth: number,
    chartHeight: number
  ): void {
    const maxValue = Math.max(...data.values) || 100000;
    const yLabels: number[] = this.generateYLabels(maxValue);

    // Draw Y-axis labels
    ctx.fillStyle = '#FACC15';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'right';

    yLabels.forEach((value: number) => {
      const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
      ctx.fillText(
        'Rs.' +
          value.toLocaleString('en-LK', {
            style: 'decimal',
            maximumFractionDigits: 0,
          }),
        padding.left - 15,
        y + 4
      );
    });

    // Draw Y-axis label (vertical text)
    ctx.save();
    ctx.translate(15, padding.top + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FACC15';
    ctx.font = '12px Arial';
    ctx.fillText('Income (Rs)', 0, 0);
    ctx.restore();

    // Draw X-axis labels
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FACC15';
    ctx.font = '12px Arial';

    data.labels.forEach((label: string, index: number) => {
      const x = padding.left + (index * chartWidth) / (data.labels.length - 1);
      const y = padding.top + chartHeight + 20;
      ctx.fillText(label, x, y);
    });

    // Draw legend - Income label with pink dot at center top
    const legendX = padding.left + chartWidth / 2;
    const legendY = padding.top - 25;

    ctx.beginPath();
    ctx.arc(legendX - 30, legendY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#FACC15';
    ctx.fill();

    ctx.fillStyle = '#888888';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Income', legendX - 20, legendY + 4);

    // Draw grid lines
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 3]);

    yLabels.forEach((value: number) => {
      if (value > 0) {
        const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartWidth, y);
        ctx.stroke();
      }
    });

    // Draw axes
    ctx.setLineDash([]);
    ctx.strokeStyle = '#4B5563';
    ctx.lineWidth = 1;

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.stroke();

    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartHeight);
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.stroke();
  }

  private generateYLabels(maxValue: number): number[] {
    // Handle edge case where maxValue is 0
    if (maxValue === 0) {
      return [0, 25000, 50000, 75000, 100000];
    }

    // Calculate appropriate step size based on magnitude
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
    const normalizedMax = maxValue / magnitude;

    let stepDivisor: number;
    if (normalizedMax <= 2) {
      stepDivisor = 0.5;
    } else if (normalizedMax <= 5) {
      stepDivisor = 1;
    } else {
      stepDivisor = 2;
    }

    const step = stepDivisor * magnitude;
    const numSteps = Math.ceil(maxValue / step);

    // Generate labels from 0 to just above maxValue
    const labels: number[] = [];
    for (let i = 0; i <= numSteps; i++) {
      labels.push(i * step);
    }

    return labels;
  }

  // Helper method to format currency
  formatCurrency(amount: number): string {
    return (
      'Rs.' +
      amount.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    );
  }

  // Helper method to get arrow and color based on income status
  getIncomeChangeDisplay(): { icon: string; color: string; text: string } {
  // Clamp the percentage value between 0 and 100
  const clampedPercent = Math.max(0, Math.min(100, this.incomeChangePercent));
  // Round to 1 decimal place for cleaner display
  const formattedPercent = parseFloat(clampedPercent.toFixed(1));
  
  if (this.incomeStatus === 'increased') {
    return {
      icon: 'fa-arrow-trend-up',
      color: 'text-teal-600',
      text: `${formattedPercent}%`, // Removed the + sign
    };
  } else if (this.incomeStatus === 'decreased') {
    return {
      icon: 'fa-arrow-trend-down',
      color: 'text-red-600',
      text: `${formattedPercent}%`, // Removed the - sign
    };
  } else {
    return {
      icon: 'fa-arrow-right-long',
      color: 'text-gray-500',
      text: `${formattedPercent}%`,
    };
  }
}

  ViewAll(): void {
    this.router.navigate(['/finance/action/view-all-service-payments']);
  }
}
