import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';

import { Subscription } from 'rxjs';
import { CallCenterService, IvrSummaryType, IvrSummaryQuery, IvrSummaryItem } from '../../../../services/call-center/call-center.service';
type DetailsType = IvrSummaryType;

interface IvrRecord {
  campaignId?: string;
  scheduledTime?: string;
  executedTime?: string;
  callId?: string;
  cli?: string;
  agentCli?: string;
  userCli?: string;
  agent?: string;
  to?: string;
  startTime: string;
  endTime: string;
  status: string;
  details: string;
}

@Component({
  selector: 'app-ivr-call-summary',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    CalendarModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './ivr-call-summary.component.html',
  styleUrl: './ivr-call-summary.component.css',
})
export class IvrCallSummaryComponent implements OnDestroy {
  isLoading = false;
  hasSearched = false;

  ivrFlows = [{ label: 'Hotline', value: 1333197 }];
  detailTypes: DetailsType[] = [
    'ALL_DIAL_CALLS',
    'OUT_DIAL_CALLS',
    'DIRECT_CALL_MAPPING',
    'CONNECT_AGENT_CALLS',
    'TRANSFER_CALLS',
    'CONFERENCE_CALLS',
    'IVR_UPLOAD_CALLS',
  ];

  selectedFlow: number | null = 1333197;
  selectedType: DetailsType | null = null;

  // Latest selectable date (today at 00:00) - future dates are disabled
  today: Date = this.getDefaultEndDate();

  // End Date = today, Start Date = End Date - 7 days
  endDate: Date | null = this.getDefaultEndDate();
  startDate: Date | null = this.getDefaultStartDate(this.endDate);

  resultType: DetailsType | '' = '';
  records: IvrRecord[] = [];

  // Pagination
  rowsOptions = [2, 3, 4, 5, 10];
  rowsPerPage = 10;
  currentPage = 1;

  errorMessage = '';
  totalItems = 0;
  totalPages = 1;
  private request?: Subscription;
  private activeQuery: IvrSummaryQuery | null = null;

  constructor(private router: Router, private callCenter: CallCenterService) {}

  ngOnDestroy() { this.request?.unsubscribe(); }

  // ---------- Default dates ----------
  // Today at 00:00
  private getDefaultEndDate(): Date {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(new Date());
    const part = (name: string) => Number(parts.find(value => value.type === name)!.value);
    const d = new Date(part('year'), part('month') - 1, part('day'));
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // End Date minus 7 days
  private getDefaultStartDate(end: Date | null): Date {
    const d = end ? new Date(end) : this.getDefaultEndDate();
    d.setDate(d.getDate() - 7);
    return d;
  }

  private dateString(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  get dateError(): string {
    if (!this.startDate || !this.endDate) return 'Select both start and end dates.';
    if (!Number.isFinite(this.startDate.getTime()) || !Number.isFinite(this.endDate.getTime())) return 'Enter valid dates.';
    const from = this.dateString(this.startDate), to = this.dateString(this.endDate);
    const days = (Date.parse(to) - Date.parse(from)) / 86400000;
    if (days < 0 || days > 31) return 'End date must be on or after start date and no more than 31 days later.';
    if (to > this.dateString(this.today)) return 'Future dates are not allowed.';
    return '';
  }

  get canGet(): boolean {
    return !!this.selectedFlow && !!this.selectedType && !this.dateError && !this.isLoading;
  }

  onGet() {
    if (!this.canGet) return;
    this.activeQuery = { flowId: this.selectedFlow!, type: this.selectedType!,
      from: this.dateString(this.startDate!), to: this.dateString(this.endDate!), page: 1, size: this.rowsPerPage };
    this.loadPage(1);
  }

  get tableType(): string {
    if (this.resultType === 'DIRECT_CALL_MAPPING') return 'OUT_DIAL_CALLS';
    if (this.resultType === 'TRANSFER_CALLS' || this.resultType === 'CONFERENCE_CALLS') return 'CONNECT_AGENT_CALLS';
    return this.resultType;
  }

  private mapRecord(row: IvrSummaryItem, type: DetailsType): IvrRecord {
    return { callId: String(row.id ?? row.callId ?? ''),
      campaignId: row.campaignId ?? '', scheduledTime: row.scheduledTime ?? '', executedTime: row.executedTime ?? '', cli: row.callerNumber ?? '—',
      agentCli: row.fromNumber ?? '—', userCli: row.toNumber ?? '—',
      agent: row.agentCli ?? '—', to: row.customerNumber ?? '—',
      startTime: (type === 'ALL_DIAL_CALLS' ? row.dialStartTime : row.startTime) ?? '',
      endTime: (type === 'ALL_DIAL_CALLS' ? row.dialEndTime : row.endTime) ?? '',
      status: (type === 'IVR_UPLOAD_CALLS' ? row.result : row.status) ?? '\u2014', details: row.details ?? '' };
  }

  private loadPage(page: number) {
    if (!this.activeQuery) return;
    this.request?.unsubscribe();
    const query = { ...this.activeQuery, page, size: this.rowsPerPage };
    this.isLoading = true;
    this.errorMessage = '';
    this.request = this.callCenter.getIvrCallSummary(query).subscribe({
      next: result => {
        this.resultType = query.type;
        this.records = result.items.map(row => this.mapRecord(row, query.type));
        this.currentPage = result.page;
        this.totalItems = result.totalItems;
        this.totalPages = Math.max(1, result.totalPages);
        this.hasSearched = true;
        this.isLoading = false;
      },
      error: err => {
        this.errorMessage = err.error?.message || err.error?.error ||
          (err.status === 401 ? 'Your session has expired. Please sign in again.' :
          err.status === 0 ? 'Cannot reach the server. Check your connection and try again.' :
          'Unable to load IVR call summary. Please try again.');
        this.records = [];
        this.totalItems = 0;
        this.hasSearched = false;
        this.isLoading = false;
      },
    });
  }

  onClear() {
    this.request?.unsubscribe();
    this.activeQuery = null;
    this.isLoading = false;
    this.errorMessage = '';
    this.totalItems = 0;
    this.totalPages = 1;
    this.selectedFlow = null;
    this.selectedType = null;
    this.today = this.getDefaultEndDate();
    this.endDate = this.getDefaultEndDate();
    this.startDate = this.getDefaultStartDate(this.endDate);
    this.records = [];
    this.resultType = '';
    this.hasSearched = false;
    this.currentPage = 1;
  }

  back() {
    this.router.navigate(['/call-centers/action']).then(() => {});
  }

  // ---------- Pagination ----------

  get startIndex(): number {
    return (this.currentPage - 1) * this.rowsPerPage;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.rowsPerPage, this.totalItems);
  }

  get pagedRecords(): IvrRecord[] {
    return this.records;
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    const windowSize = 3;
    let start = Math.max(1, this.currentPage - 1);
    const end = Math.min(total, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  goToPage(page: number) {
    if (this.isLoading || page < 1 || page > this.totalPages) return;
    this.loadPage(page);
  }

  onRowsChange() {
    this.loadPage(1);
  }

  // ---------- Formatting helpers ----------
  getDatePart(value: string): string {
    return value ? value.split(/[T ]/)[0] : '—';
  }

  getTimePart(value: string): string {
    return value ? (value.split(/[T ]/)[1] ?? '').slice(0, 8) : '';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'SUCCESS':
        return 'bg-[#91F4E2] text-[#00685C]';
      case 'FAILED':
      case 'HANGUP':
        return 'bg-[#FFDAD6] text-[#BA1A1A]';
      case 'NORMAL_MENU':
        return 'bg-[#D8E2FF] text-[#0058BE]';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  }

  getDotClass(status: string): string {
    switch (status) {
      case 'SUCCESS':
        return 'bg-[#00685C]';
      case 'FAILED':
      case 'HANGUP':
        return 'bg-[#B42323]';
      case 'NORMAL_MENU':
        return 'bg-[#0058BE]';
      default:
        return 'bg-gray-500';
    }
  }
}
