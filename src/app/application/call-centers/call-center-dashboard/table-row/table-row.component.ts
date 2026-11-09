import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { Pagination, RecentCalls } from '../../../../models/call-center.model';
import { recordStart } from '../../../../utils/call-center.utils';

@Component({
  selector: 'app-table-row',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.css',
})
export class TableRowComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) recentCalls!: RecentCalls;
  @Input() search = '';

  @Output() searchChange = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() exportCsv = new EventEmitter<void>();

  filterText = '';

  private typing$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.filterText = this.search;
    // debounce so we don't hit the API on every keystroke
    this.typing$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((v) => this.searchChange.emit(v.trim()));
  }

  ngOnChanges(changes: SimpleChanges): void {
    // keep the box in sync only if the parent reset it (don't overwrite while typing)
    if (changes['search'] && !changes['search'].firstChange && this.search === '' && this.filterText.trim() !== '') {
      this.filterText = '';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFilterInput(value: string): void {
    this.typing$.next(value);
  }

  get records() { return this.recentCalls.records; }
  get pg(): Pagination { return this.recentCalls.pagination; }
  get currentPage(): number { return this.pg.page; }
  get pageSize(): number { return this.pg.limit; }
  get totalEntries(): number { return this.pg.total; }

  get fromEntry(): number { return this.pg.total === 0 ? 0 : (this.pg.page - 1) * this.pg.limit + 1; }
  get toEntry(): number { return this.pg.total === 0 ? 0 : this.fromEntry + this.records.length - 1; }

  /** up to 5 page buttons centred on the current page */
  get pages(): number[] {
    const total = this.pg.totalPages;
    const size = Math.min(5, total);
    let start = Math.max(1, this.pg.page - Math.floor(size / 2));
    start = Math.min(start, total - size + 1);
    return Array.from({ length: Math.max(size, 0) }, (_, i) => start + i);
  }

  formatStart(iso: string): string { return recordStart(iso); }
  trackById(_: number, r: { id: number }): number { return r.id; }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.pg.totalPages && page !== this.pg.page) this.pageChange.emit(page);
  }
  previousPage(): void { this.goToPage(this.pg.page - 1); }
  nextPage(): void { this.goToPage(this.pg.page + 1); }

  statusClass(status: string | null): { wrap: string; dot: string } {
    switch (status) {
      case 'FAILED': return { wrap: 'bg-red-50 text-red-600', dot: 'bg-red-500' };
      case 'ANSWERED': return { wrap: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-600' };
      default: return { wrap: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
    }
  }
}