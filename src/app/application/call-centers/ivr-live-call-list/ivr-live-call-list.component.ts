import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

type CallStatus = 'ANSWERED' | 'MISSED';

interface IvrCallRow {
  flow: string;
  fromMain: string;
  fromSub: string;
  toMain: string;
  toSub: string;
  time: string;
  type: string;
  status: CallStatus;
  description: string;
  feedback?: string;
}

interface StatusFilters {
  answered: boolean;
  missed: boolean;
}

@Component({
  selector: 'app-ivr-live-call-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ivr-live-call-list.component.html',
  styleUrl: './ivr-live-call-list.component.css',
})
export class IvrLiveCallListComponent {
  constructor(private router: Router) {}

  searchTerm = '';
  statusFilters: StatusFilters = { answered: false, missed: false };

  currentPage = 1;
  pageSize = 6;
  pageSizeOptions = [4, 6, 8, 10];

  rows: IvrCallRow[] = [
    {
      flow: '1333597', fromMain: '716371872', fromSub: '777338298', toMain: '777338298', toSub: '716371872',
      time: '2026-09-17 09:00:39', type: 'CONNECT_AGENT_ONE_BY_ONE_DIAL', status: 'ANSWERED',
      description: 'call answered by agent (ID: 1333107, CLI: 777338298, AT: Mon Sep 17 17:52:49 IST 2026)',
      feedback: 'Feedback Sample',
    },
    {
      flow: '1333597', fromMain: '770058031', fromSub: '777338298', toMain: '777338298', toSub: '770058031',
      time: '2026-09-17 09:00:59', type: 'CONNECT_AGENT_ONE_BY_ONE_DIAL', status: 'MISSED',
      description: 'call generated successfully',
    },
    {
      flow: '1333597', fromMain: '769411709', fromSub: '779904374', toMain: '779904374', toSub: '769411709',
      time: '2026-09-17 07:00:56', type: 'CONNECT_AGENT_ONE_BY_ONE_DIAL', status: 'MISSED',
      description: 'call generated successfully',
    },
    {
      flow: '1333597', fromMain: '769411709', fromSub: '717472613', toMain: '717472613', toSub: '769411709',
      time: '2026-09-17 07:00:50', type: 'CONNECT_AGENT_ONE_BY_ONE_DIAL', status: 'MISSED',
      description: 'call generated successfully',
    },
    {
      flow: '1333597', fromMain: '702621689', fromSub: '717472613', toMain: '717472613', toSub: '702621689',
      time: '2026-09-17 06:00:00', type: 'CONNECT_AGENT_ONE_BY_ONE_DIAL', status: 'MISSED',
      description: 'call generated successfully',
    },
    {
      flow: '1333597', fromMain: '', fromSub: '', toMain: '', toSub: '764897587',
      time: '2026-09-17 09:00:59', type: 'CONNECT_AGENT_ONE_BY_ONE_DIAL', status: 'ANSWERED',
      description: 'call answered by agent (ID: 1333107, CLI: 387395, AT: Mon Sep 17 09:01:13 IST 2026)',
    },
    {
      flow: '1333597', fromMain: '717472613', fromSub: '387391', toMain: '387391', toSub: '717472613',
      time: '2026-09-17 09:00:34', type: 'CONNECT_AGENT_ONE_BY_ONE_DIAL', status: 'ANSWERED',
      description: 'call answered by agent (ID: 1333107, CLI: 387391, AT: Mon Sep 17 09:00:43 IST 2026)',
    },
    {
      flow: '1333597', fromMain: '717472613', fromSub: '387389', toMain: '387389', toSub: '717472613',
      time: '2026-09-17 08:59:17', type: 'CONNECT_AGENT_ONE_BY_ONE_DIAL', status: 'MISSED',
      description: 'call generated successfully',
    },
    {
      flow: '1333597', fromMain: '716371872', fromSub: '387060', toMain: '387060', toSub: '716371872',
      time: '2026-09-16 16:07:24', type: 'CONNECT_AGENT_ONE_BY_ONE_DIAL', status: 'MISSED',
      description: 'call generated successfully',
    },
    {
      flow: '1333597', fromMain: '770058031', fromSub: '385090', toMain: '385090', toSub: '770058031',
      time: '2026-09-14 11:52:42', type: 'CONNECT_AGENT_ONE_BY_ONE_DIAL', status: 'MISSED',
      description: 'call generated successfully',
    },
    {
      flow: '1333597', fromMain: '769411709', fromSub: '380970', toMain: '380970', toSub: '769411709',
      time: '2026-09-10 11:01:23', type: 'CONNECT_AGENT_ONE_BY_ONE_DIAL', status: 'MISSED',
      description: 'call generated successfully',
    },
    {
      flow: '1333597', fromMain: '769411709', fromSub: '380960', toMain: '380960', toSub: '769411709',
      time: '2026-09-10 10:58:26', type: 'CONNECT_AGENT_ONE_BY_ONE_DIAL', status: 'MISSED',
      description: 'call generated successfully',
    },
    {
      flow: '1333597', fromMain: '769411709', fromSub: '380938', toMain: '380938', toSub: '769411709',
      time: '2026-09-10 10:51:29', type: 'CONNECT_AGENT_ONE_BY_ONE_DIAL', status: 'ANSWERED',
      description: 'call answered by agent (ID: 1333107, CLI: 380938, AT: Thu Sep 10 10:52:23 IST 2026)',
    },
    {
      flow: '1333597', fromMain: '702621689', fromSub: '372677', toMain: '372677', toSub: '702621689',
      time: '2026-08-31 12:58:20', type: 'CONNECT_AGENT_ONE_BY_ONE_DIAL', status: 'MISSED',
      description: 'call generated successfully',
    },
  ];

  get filteredRows(): IvrCallRow[] {
    const activeStatuses: CallStatus[] = [];
    if (this.statusFilters.answered) activeStatuses.push('ANSWERED');
    if (this.statusFilters.missed) activeStatuses.push('MISSED');

    let list = this.rows;
    if (activeStatuses.length) {
      list = list.filter((r) => activeStatuses.includes(r.status));
    }

    const term = this.searchTerm.trim();
    if (term) {
      list = list.filter(
        (r) =>
          r.fromMain.includes(term) ||
          r.fromSub.includes(term) ||
          r.toMain.includes(term) ||
          r.toSub.includes(term)
      );
    }

    return list;
  }

  get totalEntries(): number {
    return this.filteredRows.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalEntries / this.pageSize));
  }

  get pagedRows(): IvrCallRow[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRows.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get rangeStart(): number {
    return this.totalEntries === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalEntries);
  }

  toggleStatusFilter(key: keyof StatusFilters): void {
    this.statusFilters[key] = !this.statusFilters[key];
    this.currentPage = 1;
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  refresh(): void {
    this.searchTerm = '';
    this.statusFilters = { answered: false, missed: false };
    this.currentPage = 1;
  }

  dateOf(time: string): string {
    return time.split(' ')[0] ?? time;
  }

  clockOf(time: string): string {
    return time.split(' ')[1] ?? '';
  }

  back(): void {
    this.router.navigate(['/call-centers/action']).then(() => {});
  }
}
