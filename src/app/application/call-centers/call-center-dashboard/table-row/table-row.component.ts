import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CallRecord {
  callNumber: string;
  type: string;
  typeId: string;
  start: string;
  agent: string;
  duration: string;
  status: 'FAILED' | 'ANSWERED';
}

@Component({
  selector: 'app-table-row',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.css',
})
export class TableRowComponent {
  filterText: string = '';

  currentPage: number = 1;
  totalPages: number = 2;
  pageSize: number = 10;
  totalEntries: number = 14;

  callRecords: CallRecord[] = [
    {
      callNumber: '764897587',
      type: 'OUTGOING',
      typeId: '#387395',
      start: 'Sep 17, 09:00:59',
      agent: '779994374@dwesk.cloud',
      duration: '00:14',
      status: 'FAILED',
    },
    {
      callNumber: '764897587',
      type: 'OUTGOING',
      typeId: '#387391',
      start: 'Sep 17, 09:00:34',
      agent: '717472613@dwesk.cloud',
      duration: '00:09',
      status: 'ANSWERED',
    },
    {
      callNumber: '764897587',
      type: 'OUTGOING',
      typeId: '#387389',
      start: 'Sep 17, 08:59:17',
      agent: '717472613@dwesk.cloud',
      duration: '00:17',
      status: 'ANSWERED',
    },
    {
      callNumber: '0716371872',
      type: 'CONNECT_DIAL',
      typeId: '#387060',
      start: 'Sep 16, 16:07:24',
      agent: '717472613@dwesk.cloud',
      duration: '00:18',
      status: 'FAILED',
    },
    {
      callNumber: '0770058031',
      type: 'CONNECT_DIAL',
      typeId: '#385090',
      start: 'Sep 14, 11:52:42',
      agent: '717472613@dwesk.cloud',
      duration: '00:10',
      status: 'ANSWERED',
    },
    {
      callNumber: '0769411709',
      type: 'CONNECT_DIAL',
      typeId: '#380970',
      start: 'Sep 10, 11:01:23',
      agent: '717472613@dwesk.cloud',
      duration: '00:19',
      status: 'FAILED',
    },
    {
      callNumber: '0769411709',
      type: 'CONNECT_DIAL',
      typeId: '#380960',
      start: 'Sep 10, 10:58:26',
      agent: '717472613@dwesk.cloud',
      duration: '00:25',
      status: 'FAILED',
    },
    {
      callNumber: '0769411709',
      type: 'CONNECT_DIAL',
      typeId: '#380938',
      start: 'Sep 10, 10:51:29',
      agent: '717472613@dwesk.cloud',
      duration: '00:56',
      status: 'ANSWERED',
    },
    {
      callNumber: '0769411709',
      type: 'CONNECT_DIAL',
      typeId: '#380919',
      start: 'Sep 10, 10:42:35',
      agent: '717472613@dwesk.cloud',
      duration: '01:34',
      status: 'FAILED',
    },
    {
      callNumber: '0769411709',
      type: 'CONNECT_DIAL',
      typeId: '#372677',
      start: 'Aug 31, 12:58:20',
      agent: '717472613@dwesk.cloud',
      duration: '02:45',
      status: 'ANSWERED',
    },
  ];

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
}
