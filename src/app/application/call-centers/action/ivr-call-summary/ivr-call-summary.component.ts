import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';

type DetailsType = 'ALL_DIAL_CALLS' | 'OUT_DIAL_CALLS' | 'CONNECT_AGENT_CALLS';

interface IvrRecord {
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
export class IvrCallSummaryComponent {
  isLoading = false;
  hasSearched = false;

  ivrFlows = ['Hotline', 'Support', 'Sales'];
  detailTypes: DetailsType[] = [
    'ALL_DIAL_CALLS',
    'OUT_DIAL_CALLS',
    'CONNECT_AGENT_CALLS',
  ];

  selectedFlow: string | null = null;
  selectedType: DetailsType | null = null;
  startDate: Date | null = new Date(2026, 8, 1);
  endDate: Date | null = new Date(2026, 8, 7);

  resultType: DetailsType | '' = '';
  records: IvrRecord[] = [];

  // Pagination
  rowsOptions = [2, 3, 4, 5, 10];
  rowsPerPage = 3;
  currentPage = 1;

  // ---------- Dummy data ----------
  private allDialSeeds: IvrRecord[] = [
    {
      cli: '716371872',
      startTime: '2026-09-17 09:00:59',
      endTime: '2026-09-17 09:01:13',
      status: 'FAILED',
      details:
        'Enter into agent dial out calls menu :\nout_dial_call\nCustomer dial success : 764897587\ncall hangup by customer.',
    },
    {
      cli: '716371872',
      startTime: '2026-09-17 09:00:34',
      endTime: '2026-09-17 09:00:43',
      status: 'SUCCESS',
      details:
        'Enter into agent dial out calls menu :\nout_dial_call\nCustomer dial success : 764897587\nUser answered 0764897587 Call Connect :\n0764897587 completed by customer.',
    },
    {
      cli: '0716371872',
      startTime: '2026-09-17 08:58:39',
      endTime: '2026-09-17 08:58:39',
      status: 'NORMAL_MENU',
      details: 'Enter into menu :\nMain',
    },
  ];

  private outDialSeeds: IvrRecord[] = [
    {
      agentCli: '716371872',
      userCli: '764897587',
      startTime: '2026-09-17 09:00:59',
      endTime: '2026-09-17 09:01:13',
      status: 'SUCCESS',
      details:
        'agent dialed and start customer dial success call hangup by customer.',
    },
    {
      agentCli: '716371872',
      userCli: '764897587',
      startTime: '2026-09-17 09:00:34',
      endTime: '2026-09-17 09:00:43',
      status: 'SUCCESS',
      details:
        'agent dialed and start customer dial success call connected.\ncall hangup by customer.\ncall hangup by customer.',
    },
    {
      agentCli: '716371872',
      userCli: '764897587',
      startTime: '2026-09-17 08:59:17',
      endTime: '2026-09-17 08:59:34',
      status: 'SUCCESS',
      details:
        'agent dialed and start customer dial success call connected.\ncall hangup by agent.',
    },
    {
      agentCli: '716371872',
      userCli: '764897587',
      startTime: '2026-09-17 08:55:10',
      endTime: '2026-09-17 08:55:40',
      status: 'FAILED',
      details: 'agent dialed and start customer dial failed no answer.',
    },
    {
      agentCli: '716371872',
      userCli: '0781668500',
      startTime: '2026-09-17 08:50:02',
      endTime: '2026-09-17 08:51:15',
      status: 'SUCCESS',
      details:
        'agent dialed and start customer dial success call connected completed by agent.',
    },
  ];

  private connectAgentSeeds: IvrRecord[] = [
    {
      agent: '716371872',
      to: '764897587',
      startTime: '2026-09-17 09:00:59',
      endTime: '2026-09-17 09:01:13',
      status: 'HANGUP',
      details: 'user dialed for connect and agent hangup.',
    },
    {
      agent: '716371872',
      to: '764897587',
      startTime: '2026-09-17 09:00:34',
      endTime: '2026-09-17 09:00:43',
      status: 'HANGUP',
      details: 'user dialed for connect and agent hangup.',
    },
  ];

  private dataByType: Record<DetailsType, IvrRecord[]> = {
    ALL_DIAL_CALLS: this.build(this.allDialSeeds, 14, 784086),
    OUT_DIAL_CALLS: this.build(this.outDialSeeds, 14, 163926),
    CONNECT_AGENT_CALLS: this.build(this.connectAgentSeeds, 14, 0),
  };

  constructor(private router: Router) {}

  // Repeats the seed rows up to `count` entries with unique call IDs
  private build(
    seeds: IvrRecord[],
    count: number,
    baseId: number,
  ): IvrRecord[] {
    return Array.from({ length: count }, (_, i) => {
      const seed = seeds[i % seeds.length];
      return {
        ...seed,
        callId: baseId ? String(baseId - i * 3) : undefined,
      };
    });
  }

  // ---------- Actions ----------
  get canGet(): boolean {
    return !!this.selectedFlow && !!this.selectedType;
  }

  onGet() {
    if (!this.canGet) return;
    this.isLoading = true;
    setTimeout(() => {
      this.resultType = this.selectedType as DetailsType;
      this.records = this.dataByType[this.selectedType as DetailsType] ?? [];
      this.currentPage = 1;
      this.hasSearched = true;
      this.isLoading = false;
    }, 500);
  }

  onClear() {
    this.selectedFlow = null;
    this.selectedType = null;
    this.startDate = new Date(2026, 8, 1);
    this.endDate = new Date(2026, 8, 7);
    this.records = [];
    this.resultType = '';
    this.hasSearched = false;
    this.currentPage = 1;
  }

  back() {
    this.router.navigate(['/call-centers/action']).then(() => {});
  }

  // ---------- Pagination ----------
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.records.length / this.rowsPerPage));
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.rowsPerPage;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.rowsPerPage, this.records.length);
  }

  get pagedRecords(): IvrRecord[] {
    return this.records.slice(this.startIndex, this.endIndex);
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
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  onRowsChange() {
    this.currentPage = 1;
  }

  // ---------- Formatting helpers ----------
  getDatePart(value: string): string {
    return value?.split(' ')[0] ?? '';
  }

  getTimePart(value: string): string {
    return value?.split(' ')[1] ?? '';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'SUCCESS':
        return 'bg-[#CFF5EA] text-[#0F6B55]';
      case 'FAILED':
      case 'HANGUP':
        return 'bg-[#FCE1E1] text-[#B42323]';
      case 'NORMAL_MENU':
        return 'bg-[#DDE6FB] text-[#2F55B8]';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  }

  getDotClass(status: string): string {
    switch (status) {
      case 'SUCCESS':
        return 'bg-[#0F6B55]';
      case 'FAILED':
      case 'HANGUP':
        return 'bg-[#B42323]';
      case 'NORMAL_MENU':
        return 'bg-[#2F55B8]';
      default:
        return 'bg-gray-500';
    }
  }
}
