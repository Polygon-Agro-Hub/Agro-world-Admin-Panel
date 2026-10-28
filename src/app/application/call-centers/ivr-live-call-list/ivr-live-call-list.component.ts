import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, catchError, debounceTime, of, switchMap, takeUntil, tap } from 'rxjs';
import { CallCenterService, IvrLiveCallItem } from '../../../services/call-center/call-center.service';

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
export class IvrLiveCallListComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private callCenterService: CallCenterService,
  ) { }

  searchTerm = '';
  statusFilters: StatusFilters = { answered: false, missed: false };

  currentPage = 1;
  pageSize = 6;
  pageSizeOptions = [4, 6, 8, 10];

  pagedRows: IvrLiveCallItem[] = [];
  totalEntries = 0;
  totalPages = 1;

  loading = false;
  errorMessage = '';

  private fetch$ = new Subject<void>();  
  private search$ = new Subject<void>(); 
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.search$
      .pipe(debounceTime(350), takeUntil(this.destroy$))
      .subscribe(() => this.fetch$.next());
    this.fetch$
      .pipe(
        tap(() => {
          this.loading = true;
          this.errorMessage = '';
        }),
        switchMap(() =>
          this.callCenterService
            .getIvrLiveCalls({
              page: this.currentPage,
              size: this.pageSize,
              status: this.activeStatuses(),
              search: this.searchTerm.trim(),
            })
            .pipe(
              catchError((err) => {
                this.errorMessage = err?.error?.message || 'Failed to load the call list.';
                return of(null);
              }),
            ),
        ),
        takeUntil(this.destroy$),
      )
      .subscribe((res) => {
        this.loading = false;
        if (!res) {
          this.pagedRows = [];
          this.totalEntries = 0;
          this.totalPages = 1;
          return;
        }
        this.pagedRows = res.items;
        this.totalEntries = res.totalItems;
        this.totalPages = Math.max(1, res.totalPages);

        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
          this.fetch$.next();
        }
      });

    this.fetch$.next();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private activeStatuses(): string[] {
    const list: string[] = [];
    if (this.statusFilters.answered) list.push('ANSWERED');
    if (this.statusFilters.missed) list.push('MISSED');
    return list;
  }

  get pageNumbers(): number[] {
    const windowSize = 5;
    let start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  get rangeStart(): number {
    return this.totalEntries === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalEntries);
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.search$.next();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.fetch$.next();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.fetch$.next();
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
    this.fetch$.next();
  }

  dateOf(time: string | null): string {
    return (time ?? '').split(' ')[0] ?? '';
  }

  clockOf(time: string | null): string {
    return (time ?? '').split(' ')[1] ?? '';
  }

  back(): void {
    this.router.navigate(['/call-centers/action']).then(() => { });
  }
}