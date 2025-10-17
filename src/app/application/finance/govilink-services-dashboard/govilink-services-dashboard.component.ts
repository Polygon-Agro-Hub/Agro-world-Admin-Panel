import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-govilink-services-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './govilink-services-dashboard.component.html',
  styleUrls: ['./govilink-services-dashboard.component.css'],
})
export class GovilinkServicesDashboardComponent implements AfterViewInit {
  @ViewChild('incomeChart') incomeChart!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;

  totalIncome = 500000;
  incomeChangePercent = -10.7;
  serviceRequestsThisMonth = 145;
  serviceRequestsToday = 145;

  chartData = [
    { month: 'Jan', value: 90000 },
    { month: 'Feb', value: 80000 },
    { month: 'Mar', value: 10000 },
    { month: 'Apr', value: 60000 },
    { month: 'May', value: 95000 },
    { month: 'Jun', value: 85000 },
    { month: 'Jul', value: 90000 },
    { month: 'Aug', value: 87000 },
    { month: 'Sep', value: 94000 },
    { month: 'Oct', value: 91000 },
    { month: 'Nov', value: 88000 },
    { month: 'Dec', value: 40000 },
  ];

  recentPayments = [
    {
      id: 11555,
      farmer: 'Wednesday Addams',
      service: 'Audit',
      amount: '-',
      datetime: '5 Nov, 2024 1:55PM',
    },
    {
      id: 11554,
      farmer: 'James Bond',
      service: 'Consultation',
      amount: '2,500.00',
      datetime: '5 Nov, 2024 10:55AM',
    },
    {
      id: 11553,
      farmer: 'Harry Potter',
      service: 'Consultation',
      amount: '2,500.00',
      datetime: '5 Nov, 2024 9:55AM',
    },
    {
      id: 11552,
      farmer: 'Ron Weasly',
      service: 'Consultation',
      amount: '2,500.00',
      datetime: '5 Nov, 2024 8:55AM',
    },
    {
      id: 11551,
      farmer: 'Hermione Granger',
      service: 'Consultation',
      amount: '2,500.00',
      datetime: '5 Nov, 2024 7:55AM',
    },
    {
      id: 11550,
      farmer: 'Chalana Prabhashwara',
      service: 'Consultation',
      amount: '2,500.00',
      datetime: '5 Nov, 2024 6:55AM',
    },
  ];

  constructor(private location: Location) {}

  onBack(): void {
    this.location.back();
  }

  ngAfterViewInit(): void {
    this.initChart();
  }

  initChart() {
    const ctx = this.incomeChart.nativeElement.getContext('2d');

    this.chart = new Chart(ctx!, {
      type: 'line',
      data: {
        labels: this.chartData.map((d) => d.month),
        datasets: [
          {
            label: 'Income',
            data: this.chartData.map((d) => d.value),
            fill: true,
            borderColor: '#FACC15',
            backgroundColor: 'rgba(250, 204, 21, 0.25)',
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#FACC15',
            pointHoverRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { top: 0, bottom: 0 },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100000,
            ticks: {
              stepSize: 25000,
              color: '#CBD5E1',
              callback: function (value) {
                return value.toLocaleString();
              },
            },
            grid: {
              color: '#334155',
            },
          },
          x: {
            ticks: {
              color: '#CBD5E1',
            },
            grid: {
              color: '#334155',
            },
          },
        },
        plugins: {
          legend: { display: false },
        },
      },
    });
  }
}
