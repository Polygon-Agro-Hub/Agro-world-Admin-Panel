import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CallSummary, ServiceQuality, TileKey, Timeline } from '../../../../models/call-center.model';
import { formatSeconds } from '../../../../utils/call-center.utils';

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

interface MiniStat {
  label: string;
  value: number;
}

const MIX_META: Record<TileKey, { label: string; dotClass: string }> = {
  incoming: { label: 'Incoming', dotClass: 'bg-[#2170E4]' },
  answered: { label: 'Answered', dotClass: 'bg-[#91F4E2]' },
  outgoing: { label: 'Outgoing', dotClass: 'bg-[#D8E2FF]' },
  failed: { label: 'Failed', dotClass: 'bg-[#BA1A1A]' },
  voicemail: { label: 'Voicemail', dotClass: 'bg-[#FFB95F]' },
  transfer: { label: 'Transfer', dotClass: 'bg-[#FFDDB8]' },
  conference: { label: 'Conference', dotClass: 'bg-[#BDC9C5]' },
};

@Component({
  selector: 'app-colum-right',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './colum-right.component.html',
  styleUrl: './colum-right.component.css',
})
export class ColumRightComponent implements OnChanges {
  @Input({ required: true }) timeline!: Timeline;
  @Input({ required: true }) callSummary!: CallSummary;
  @Input({ required: true }) serviceQuality!: ServiceQuality;

  callSummaryStats: StatItem[] = [];
  hourMix: HourMixItem[] = [];
  serviceQualityStats: StatItem[] = [];
  queueStats: MiniStat[] = [];

  selectedHour = '';
  activeTrunks: number | null = null;
  engineStatus: string | null = null;

  ngOnChanges(): void {
    const cs = this.callSummary;
    const sq = this.serviceQuality;
    const neutral = { labelClass: 'text-slate-500', valueClass: 'text-slate-800', bgClass: 'bg-[#E9F5FF]' };
    const neutralSq = { labelClass: 'text-slate-500', valueClass: 'text-slate-800', bgClass: 'bg-slate-100/80' };

    this.callSummaryStats = [
      { label: 'INBOUND CALLS', value: cs.inbound.count, subtext: `${cs.inbound.percent}% of all calls today`, ...neutral },
      { label: 'OUTBOUND CALLS', value: cs.outbound.count, subtext: `${cs.outbound.percent}% of all calls today`, ...neutral },
      { label: 'VOICEMAIL OUTCOMES', value: cs.voicemailOutcomes, subtext: `${cs.voicemailOutcomes} voicemail outcomes`, ...neutral },
      { label: 'TRANSFERS + CONF', value: cs.handoffEvents, subtext: `${cs.handoffEvents} handoff events`, ...neutral },
    ];

    this.selectedHour = this.timeline.selectedHourLabel;
    this.activeTrunks = this.timeline.activePbxTrunks;
    this.engineStatus = this.timeline.engineStatus;
    this.hourMix = this.timeline.mix.map(m => ({
      label: MIX_META[m.key].label,
      value: m.count,
      percent: m.percent,
      dotClass: MIX_META[m.key].dotClass,
    }));

    this.serviceQualityStats = [
      {
        label: 'ANSWER RATE', value: `${sq.answerRate.percent}%`, subtext: `${sq.answerRate.answered} calls answered`,
        labelClass: 'text-emerald-700', valueClass: 'text-emerald-600', bgClass: 'bg-emerald-50',
      },
      {
        label: 'FAILURE RATE', value: `${sq.failureRate.percent}%`, subtext: `${sq.failureRate.failed} calls failed`,
        labelClass: 'text-red-600', valueClass: 'text-red-500', bgClass: 'bg-red-50',
      },
      {
        label: 'AVG WAIT', value: formatSeconds(sq.avgWaitSeconds), subtext: 'Avg customer queue',
        labelClass: 'text-amber-700', valueClass: 'text-amber-700', bgClass: 'bg-amber-50',
      },
      {
        label: 'RING-TO-CONNECT', value: formatSeconds(sq.ringToConnectSeconds), subtext: 'Avg ring before answer',
        labelClass: 'text-blue-600', valueClass: 'text-blue-600', bgClass: 'bg-slate-100/80',
      },
      {
        label: 'AVG HANDLE TIME', value: formatSeconds(sq.avgHandleSeconds), subtext: 'Call duration average', ...neutralSq,
      },
      {
        label: 'BUSIEST HOUR', value: sq.busiestHour.label, subtext: `${sq.busiestHour.calls} calls in peak hour`, ...neutralSq,
      },
    ];

    this.queueStats = [
      { label: 'Queue', value: sq.counters.queue },
      { label: 'Voicemail', value: sq.counters.voicemail },
      { label: 'Transfers', value: sq.counters.transfers },
      { label: 'Conf', value: sq.counters.conference },
    ];
  }
}