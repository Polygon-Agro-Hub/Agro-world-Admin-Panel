import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, catchError, map, merge, of, startWith, switchMap, takeUntil, timer } from 'rxjs';
import { RowOneComponent } from './row-one/row-one.component';
import { RowTwoComponent } from './row-two/row-two.component';
import { LeftColumnComponent } from './left-column/left-column.component';
import { ColumRightComponent } from './colum-right/colum-right.component';
import { RowFourComponent } from './row-four/row-four.component';
import { TableRowComponent } from './table-row/table-row.component';
import { CallCenterService } from '../../../services/call-center/call-center.service';
import { DashboardQuery, DashboardResponse, TrendRangeKey } from '../../../models/call-center.model';

const POLL_MS = 60000;

@Component({
  selector: 'app-call-center-dashboard',
  standalone: true,
  imports: [
    RowOneComponent,
    RowTwoComponent,
    LeftColumnComponent,
    ColumRightComponent,
    RowFourComponent,
    TableRowComponent,
  ],
  templateUrl: './call-center-dashboard.component.html',
  styleUrl: './call-center-dashboard.component.css',
})
export class CallCenterDashboardComponent implements OnInit, OnDestroy {
  data: DashboardResponse | null = null;
  isLoading = true;
  isRefreshing = false;
  errorMessage = '';

  query: DashboardQuery = { range: '13w', months: 2, search: '', page: 1, limit: 10 };

  private reload$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(
    private callCenterSrv: CallCenterService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    merge(this.reload$, timer(POLL_MS, POLL_MS))
      .pipe(
        startWith(0),
        switchMap(() =>
          this.callCenterSrv.getDashboardData(this.query).pipe(
            map((res) => ({ res, err: null as any })),
            catchError((err) => of({ res: null as DashboardResponse | null, err }))
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(({ res, err }) => {
        console.log('dashboard response', res, err); // remove once working
        this.isLoading = false;
        this.isRefreshing = false;
        if (res) {
          this.data = res;
          this.errorMessage = '';
        } else {
          this.errorMessage = this.toMessage(err);
        }
        this.cdr.markForCheck(); // needed for zoneless apps
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  retry(): void {
    this.isLoading = !this.data;
    this.reload$.next();
  }

  private toMessage(err: any): string {
    if (err?.status === 503 || err?.error?.code === 'DWESK_UNAVAILABLE') return 'Data temporarily unavailable.';
    if (err?.status === 400) return (err?.error?.details || [err?.error?.message]).join(', ');
    if (err?.name === 'TimeoutError') return 'The request timed out. Please retry.';
    return 'Something went wrong while loading the dashboard.';
  }

  private reload(): void {
    this.isRefreshing = true;
    this.reload$.next();
  }

  onHourChange(hour: number): void {
    this.query = { ...this.query, hour };
    this.reload();
  }

  onRangeChange(range: TrendRangeKey): void {
    this.query = { ...this.query, range };
    this.reload();
  }

  onSearchChange(search: string): void {
    this.query = { ...this.query, search, page: 1 };
    this.reload();
  }

  onPageChange(page: number): void {
    this.query = { ...this.query, page };
    this.reload();
  }

  onExport(): void {
    this.callCenterSrv.exportCsv(this.query.search || '').subscribe({
      next: (blob) => {
        const d = new Date();
        const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `call-records-${stamp}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
      },
      error: () => {
        this.errorMessage = 'Export failed. Please try again.';
        this.cdr.markForCheck();
      },
    });
  }
}