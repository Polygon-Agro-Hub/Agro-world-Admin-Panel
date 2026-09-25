import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatItem {
  label: string;
  value: string | number;
  subtext: string;
  labelClass: string;
  valueClass: string;
  bgClass: string;
}

interface HourMixItem {
  label: string;
  value: number;
  percent: number;
  dotClass: string;
}

interface ServiceCard {
  label: string;
  value: string;
  subtext: string;
  labelClass: string;
  valueClass: string;
  bgClass: string;
}

interface MiniStat {
  label: string;
  value: number;
}

@Component({
  selector: 'app-colum-right',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './colum-right.component.html',
  styleUrl: './colum-right.component.css',
})
export class ColumRightComponent {
  callSummaryStats: StatItem[] = [
    {
      label: 'INBOUND CALLS',
      value: 0,
      subtext: '0% of all calls today',
      labelClass: 'text-slate-500',
      valueClass: 'text-slate-800',
      bgClass: 'bg-[#E9F5FF]',
    },
    {
      label: 'OUTBOUND CALLS',
      value: 0,
      subtext: '0% of all calls today',
      labelClass: 'text-slate-500',
      valueClass: 'text-slate-800',
      bgClass: 'bg-[#E9F5FF]',
    },
    {
      label: 'VOICEMAIL OUTCOMES',
      value: 0,
      subtext: '0 voicemail outcomes',
      labelClass: 'text-slate-500',
      valueClass: 'text-slate-800',
      bgClass: 'bg-[#E9F5FF]',
    },
    {
      label: 'TRANSFERS + CONF',
      value: 0,
      subtext: '0 handoff events',
      labelClass: 'text-slate-500',
      valueClass: 'text-slate-800',
      bgClass: 'bg-[#E9F5FF]',
    },
  ];

  selectedHour = '22:05';
  activeTrunks = 24;
  engineStatus = 'Engine Online';

  hourMix: HourMixItem[] = [
    { label: 'Incoming', value: 0, percent: 0, dotClass: 'bg-blue-500' },
    { label: 'Answered', value: 0, percent: 0, dotClass: 'bg-emerald-300' },
    { label: 'Outgoing', value: 0, percent: 0, dotClass: 'bg-slate-300' },
    { label: 'Failed', value: 0, percent: 0, dotClass: 'bg-red-500' },
    { label: 'Voicemail', value: 0, percent: 0, dotClass: 'bg-amber-400' },
    { label: 'Transfer', value: 0, percent: 0, dotClass: 'bg-orange-300' },
    { label: 'Conference', value: 0, percent: 0, dotClass: 'bg-slate-400' },
  ];

  serviceQualityStats: ServiceCard[] = [
    {
      label: 'ANSWER RATE',
      value: '0%',
      subtext: '0 calls answered',
      labelClass: 'text-emerald-700',
      valueClass: 'text-emerald-600',
      bgClass: 'bg-emerald-50',
    },
    {
      label: 'FAILURE RATE',
      value: '0%',
      subtext: '0 calls failed',
      labelClass: 'text-red-600',
      valueClass: 'text-red-500',
      bgClass: 'bg-red-50',
    },
    {
      label: 'AVG WAIT',
      value: '0s',
      subtext: 'Avg customer queue',
      labelClass: 'text-amber-700',
      valueClass: 'text-amber-700',
      bgClass: 'bg-amber-50',
    },
    {
      label: 'RING-TO-CONNECT',
      value: '0s',
      subtext: 'Avg ring before answer',
      labelClass: 'text-blue-600',
      valueClass: 'text-blue-600',
      bgClass: 'bg-slate-100/80',
    },
    {
      label: 'AVG HANDLE TIME',
      value: '0s',
      subtext: 'Call duration average',
      labelClass: 'text-slate-500',
      valueClass: 'text-slate-800',
      bgClass: 'bg-slate-100/80',
    },
    {
      label: 'BUSIEST HOUR',
      value: '8 AM',
      subtext: '0 calls in peak hour',
      labelClass: 'text-slate-500',
      valueClass: 'text-slate-800',
      bgClass: 'bg-slate-100/80',
    },
  ];

  queueStats: MiniStat[] = [
    { label: 'Queue', value: 0 },
    { label: 'Voicemail', value: 0 },
    { label: 'Transfers', value: 0 },
    { label: 'Conf', value: 0 },
  ];
}
