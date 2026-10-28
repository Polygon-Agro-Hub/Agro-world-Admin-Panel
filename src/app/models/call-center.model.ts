export type TileKey = 'incoming' | 'answered' | 'outgoing' | 'failed' | 'voicemail' | 'transfer' | 'conference';
export type TrendRangeKey = '13w' | '26w' | '12m' | '24m';
export type QueueStateName = 'idle' | 'active';

export interface CountPercent { count: number; percent: number; }
export interface QueueState { waiting: number; ringing: number; state: QueueStateName; }
export interface HourRef { hour: number; label: string; calls: number; }

export interface DashboardHeader {
  companyName: string;
  telemetryStatus: 'active' | 'offline';
  lastUpdated: string;
  currentDateTime: string;
  timezone: string;
}

export interface TopCards {
  queue: QueueState;
  answerRate: number;
  answeredCalls: number;
  peakHour: HourRef;
}

export interface SummaryCards {
  totalCalls: number;
  answerRate: number;
  answeredCalls: number;
  answerRateTarget: number;
  meetsTarget: boolean;
  queue: QueueState;
  avgHandleSeconds: number | null;
  handoffEvents: number;
  holdTimeSeconds: number | null;
}

export interface Timeline {
  selectedHour: number;
  selectedHourLabel: string;
  totalInHour: number;
  tiles: Record<TileKey, CountPercent>;
  mix: { key: TileKey; count: number; percent: number }[];
  activePbxTrunks: number | null;
  engineStatus: string | null;
}

export interface HourlyDistribution {
  hours: { hour: number; label: string; calls: number; percentOfPeak: number }[];
  workingHours: { start: number; end: number };
}

export interface CallSummary {
  inbound: CountPercent;
  outbound: CountPercent;
  voicemailOutcomes: number;
  handoffEvents: number;
}

export interface ServiceQuality {
  answerRate: { percent: number; answered: number };
  failureRate: { percent: number; failed: number };
  avgWaitSeconds: number | null;
  ringToConnectSeconds: number | null;
  avgHandleSeconds: number | null;
  busiestHour: HourRef;
  counters: { queue: number; voicemail: number; transfers: number; conference: number };
}

export interface TrendBucket { label: string; weekStart?: string | null; calls: number; }

export interface Trends {
  range: TrendRangeKey;
  timeRange: { label: string; view: string };
  buckets: TrendBucket[];
  callsInRange: number;
  averagePerBucket: number;
  busiestPeriod: TrendBucket;
}

export interface MonthlyOverview {
  months: { key: string; label: string; calls: number }[];
  growthPercent: number | null;
  growthLabel: string | null;
}

export type CallStatus = 'ANSWERED' | 'FAILED' | 'VOICEMAIL' | 'TRANSFER' | 'CONFERENCE' | 'RINGING' | 'WAITING' | null;

export interface CallRecord {
  id: number;
  callerNumber: string;
  callType: 'INCOMING' | 'CONNECT_DIAL' | 'QUEUE_DIAL' | 'OUTGOING';
  direction: 'incoming' | 'outgoing';
  callStartTime: string;
  agentCli: string | null;
  agent: string | null;
  durationSeconds: number | null;
  duration: string;
  status: CallStatus;
}

export interface Pagination { page: number; limit: number; total: number; totalPages: number; }
export interface RecentCalls { records: CallRecord[]; pagination: Pagination; }

export interface DashboardResponse {
  header: DashboardHeader;
  topCards: TopCards;
  summaryCards: SummaryCards;
  timeline: Timeline;
  hourlyDistribution: HourlyDistribution;
  callSummary: CallSummary;
  serviceQuality: ServiceQuality;
  trends: Trends;
  monthlyOverview: MonthlyOverview;
  recentCalls: RecentCalls;
}

export interface DashboardQuery {
  hour?: number;
  range?: TrendRangeKey;
  months?: number;
  search?: string;
  page?: number;
  limit?: number;
}