import { Component, AfterViewInit } from '@angular/core';

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
  selector: 'app-govicare-area-chart',
  standalone: true,
  imports: [],
  templateUrl: './govicare-area-chart.component.html',
  styleUrl: './govicare-area-chart.component.css'
})
export class GovicareAreaChartComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    // Use setTimeout to ensure the DOM is fully rendered
    setTimeout(() => {
      this.createAreaChart();
    });
  }

  private createAreaChart(): void {
    // Sample data matching the image
    const data: ChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      values: [25000, 35000, 40000, 45000, 60000, 75000, 90000, 85000, 70000, 55000, 40000, 30000]
    };

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

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = 300;

    // Chart dimensions with padding
    const padding: ChartPadding = { top: 40, right: 40, bottom: 40, left: 60 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw chart area
    this.drawAreaChart(ctx, data, padding, chartWidth, chartHeight);

    // Draw axes and labels
    this.drawAxes(ctx, data, padding, chartWidth, chartHeight);
  }

  private drawAreaChart(
    ctx: CanvasRenderingContext2D, 
    data: ChartData, 
    padding: ChartPadding, 
    chartWidth: number, 
    chartHeight: number
  ): void {
    const maxValue = 100000;
    const points: ChartPoint[] = data.values.map((value: number, index: number) => {
      const x = padding.left + (index * chartWidth) / (data.labels.length - 1);
      const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
      return { x, y, value };
    });

    // Create gradient for area fill - Teal/Cyan colors from the image
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    gradient.addColorStop(0, 'rgba(45, 212, 191, 0.4)'); // Brighter teal at top
    gradient.addColorStop(1, 'rgba(45, 212, 191, 0.1)'); // Faded teal at bottom

    // Draw area
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartHeight);
    
    points.forEach((point: ChartPoint) => {
      ctx.lineTo(point.x, point.y);
    });
    
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line - Teal color from the image
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    points.forEach((point: ChartPoint, index: number) => {
      if (index > 0) {
        ctx.lineTo(point.x, point.y);
      }
    });
    
    ctx.strokeStyle = '#2DD4BF'; // Teal-400 color
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw data points
    points.forEach((point: ChartPoint) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#2DD4BF'; // Teal-400 color
      ctx.fill();
      ctx.strokeStyle = '#061E2C'; // Dark background color for border
      ctx.lineWidth = 2;
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
    const maxValue = 100000;
    
    // Y-axis labels
    const yLabels: number[] = [0, 25000, 50000, 75000, 100000];
    
    ctx.fillStyle = '#888888'; // Gray text color from the image
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    
    yLabels.forEach((value: number) => {
      const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
      ctx.fillText(value.toLocaleString(), padding.left - 10, y + 4);
    });

    // Y-axis title
    ctx.save();
    ctx.translate(20, padding.top + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#888888'; // Gray text color
    ctx.font = '12px Arial';
    ctx.fillText('Income', 0, 0);
    ctx.restore();

    // X-axis labels
    ctx.textAlign = 'center';
    ctx.fillStyle = '#888888'; // Gray text color
    ctx.font = '12px Arial';
    
    data.labels.forEach((label: string, index: number) => {
      const x = padding.left + (index * chartWidth) / (data.labels.length - 1);
      const y = padding.top + chartHeight + 20;
      ctx.fillText(label, x, y);
    });

    // Draw grid lines - Dark gray from the image
    ctx.strokeStyle = '#1E293B'; // Dark slate gray
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 3]); // Dashed grid lines like in the image
    
    yLabels.forEach((value: number) => {
      if (value > 0) { // Don't draw grid line at the bottom
        const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartWidth, y);
        ctx.stroke();
      }
    });

    // Reset line dash for axes
    ctx.setLineDash([]);

    // Draw axes lines - Medium gray
    ctx.strokeStyle = '#4B5563'; // Medium gray
    ctx.lineWidth = 1;
    
    // Y-axis line
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.stroke();
    
    // X-axis line
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartHeight);
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.stroke();
  }
}