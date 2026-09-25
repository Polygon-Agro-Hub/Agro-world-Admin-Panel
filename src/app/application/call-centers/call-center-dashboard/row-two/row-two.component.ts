import { Component } from '@angular/core';

interface MetricCard {
  label: string;
  value: string;
  unit: string;
  note: string;
  dot: string;
  icon: string;
}

interface SummaryCard {
  label: string;
  value: string;
  description: string;
  footerLeft: string;
  footerRight: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  accent: string;
  footerRightColor: string;
}

@Component({
  selector: 'app-row-two',
  standalone: true,
  imports: [],
  templateUrl: './row-two.component.html',
  styleUrl: './row-two.component.css'
})
export class RowTwoComponent {
  metricCards: MetricCard[] = [
    { label: 'Incoming Calls', value: '0', unit: 'in queue', note: 'Clear now', dot: '#0d9488', icon: 'fa-phone-volume' },
    { label: 'Answer Rate', value: '0%', unit: 'ratio', note: '0 answered', dot: '#cbd5e1', icon: 'fa-chart-pie' },
    { label: 'Peak Hour', value: '8AM', unit: 'historical', note: '0 calls registered', dot: '#fbbf24', icon: 'fa-clock' },
  ];

  summaryCards: SummaryCard[] = [
    {
      label: 'Total Calls', value: '0', description: "Recorded across today's PBX activity",
      footerLeft: 'Daily Baseline', footerRight: 'PBX Pool A',
      icon: 'fa-phone', iconBg: '#dbe4ff', iconColor: '#1d4ed8', accent: '#0052cc', footerRightColor: '#0052cc',
    },
    {
      label: 'Answer Rate', value: '0%', description: '0 calls answered successfully',
      footerLeft: 'Target: 95.0%', footerRight: 'Optimal SLA',
      icon: 'fa-shield-halved', iconBg: '#99f6e4', iconColor: '#0f766e', accent: '#047857', footerRightColor: '#047857',
    },
    {
      label: 'Incoming Calls', value: '0', description: 'No waiting calls right now',
      footerLeft: 'Queue state', footerRight: 'Idle / Clear',
      icon: 'fa-phone-volume', iconBg: '#fed7aa', iconColor: '#9a3412', accent: '#b45309', footerRightColor: '#92400e',
    },
    {
      label: 'Avg Handle', value: '0s', description: '0 transfers and conferences',
      footerLeft: 'Hold Time', footerRight: '0.00s',
      icon: 'fa-headset', iconBg: '#fde5c0', iconColor: '#b45309', accent: '#fbbf24', footerRightColor: '#92400e',
    },
  ];
}
