import { Component, Input } from '@angular/core';
import { SummaryCards, TopCards } from '../../../../models/call-center.model';
import { formatSeconds } from '../../../../utils/call-center.utils';

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
  @Input({ required: true }) topCards!: TopCards;
  @Input({ required: true }) summaryCards!: SummaryCards;

  get metricCards(): MetricCard[] {
    const t = this.topCards;
    const idle = t.queue.state === 'idle';
    return [
      {
        label: 'Incoming Calls', value: String(t.queue.waiting), unit: 'in queue',
        note: idle ? 'Clear now' : `${t.queue.ringing} ringing`,
        dot: idle ? '#0d9488' : '#f59e0b', icon: 'fa-phone-volume',
      },
      {
        label: 'Answer Rate', value: `${t.answerRate}%`, unit: 'ratio',
        note: `${t.answeredCalls} answered`, dot: '#cbd5e1', icon: 'fa-chart-pie',
      },
      {
        label: 'Peak Hour', value: t.peakHour.label, unit: 'historical',
        note: `${t.peakHour.calls} calls registered`, dot: '#fbbf24', icon: 'fa-clock',
      },
    ];
  }

  get cards(): SummaryCard[] {
    const s = this.summaryCards;
    const idle = s.queue.state === 'idle';
    return [
      {
        label: 'Total Calls', value: String(s.totalCalls), description: "Recorded across today's PBX activity",
        footerLeft: 'Daily Baseline', footerRight: 'PBX Pool A',
        icon: 'fa-phone', iconBg: '#dbe4ff', iconColor: '#1d4ed8', accent: '#0052cc', footerRightColor: '#0052cc',
      },
      {
        label: 'Answer Rate', value: `${s.answerRate}%`, description: `${s.answeredCalls} calls answered successfully`,
        footerLeft: `Target: ${s.answerRateTarget.toFixed(1)}%`,
        footerRight: s.meetsTarget ? 'Optimal SLA' : 'Below target',
        icon: 'fa-shield-halved', iconBg: '#99f6e4', iconColor: '#0f766e',
        accent: s.meetsTarget ? '#047857' : '#dc2626',
        footerRightColor: s.meetsTarget ? '#047857' : '#dc2626',
      },
      {
        label: 'Incoming Calls', value: String(s.queue.waiting),
        description: idle ? 'No waiting calls right now' : `${s.queue.waiting} waiting, ${s.queue.ringing} ringing`,
        footerLeft: 'Queue state', footerRight: idle ? 'Idle / Clear' : 'Active',
        icon: 'fa-phone-volume', iconBg: '#fed7aa', iconColor: '#9a3412', accent: '#b45309', footerRightColor: '#92400e',
      },
      {
        label: 'Avg Handle', value: formatSeconds(s.avgHandleSeconds),
        description: `${s.handoffEvents} transfers and conferences`,
        footerLeft: 'Hold Time',
        footerRight: s.holdTimeSeconds === null ? '--' : `${s.holdTimeSeconds.toFixed(2)}s`,
        icon: 'fa-headset', iconBg: '#fde5c0', iconColor: '#b45309', accent: '#fbbf24', footerRightColor: '#92400e',
      },
    ];
  }
}