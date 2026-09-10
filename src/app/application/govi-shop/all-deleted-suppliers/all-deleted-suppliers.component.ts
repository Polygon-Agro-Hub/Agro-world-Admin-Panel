import { CommonModule, Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { GovishopService } from '../../../services/govi-shop/govishop.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-all-deleted-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, NgxPaginationModule],
  templateUrl: './all-deleted-suppliers.component.html',
  styleUrl: './all-deleted-suppliers.component.css',
})

export class AllDeletedSuppliersComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  suppliers: DeletedSupplier[] = [];

  page = 1;
  limit = 10;
  totalItems = 0;

  itemsPerPage = 10;

  searchItem = '';
  isLoading = false;

  isReasonModalOpen = false;
  selectedReason = '';

  constructor(
    private govishopService: GovishopService,
    private location: Location,
    public permissionService: PermissionService,
    public tokenService: TokenService,) { }

  ngOnInit(): void {
    this.fetchDeletedSuppliers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  back(): void {
    this.location.back();
  }

  fetchDeletedSuppliers(): void {
    this.isLoading = true;

    this.govishopService
      .getAllDeletedSuppliers(this.page, this.itemsPerPage, this.searchItem)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: GetAllDeletedSuppliersResponse) => {
          this.suppliers = (res?.results || [])
            .map((s) => ({
              ...s,
              deletedBy: s.deletedInfo?.deletedBy || '—',
            }))
            .sort((a, b) => {
              const aTime = new Date(a.deletedInfo?.deletedAt || 0).getTime();
              const bTime = new Date(b.deletedInfo?.deletedAt || 0).getTime();
              return bTime - aTime;
            });

          this.totalItems = res?.total || 0;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.suppliers = [];
          this.totalItems = 0;
        },
      });
  }

  onPageChange(event: number): void {
    this.page = event;
    this.fetchDeletedSuppliers();
  }

  onSearch(): void {
    this.searchItem = (this.searchItem || '').trim();
    this.page = 1;
    this.fetchDeletedSuppliers();
  }

  clearSearch(): void {
    this.searchItem = '';
    this.page = 1;
    this.fetchDeletedSuppliers();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil((this.totalItems || 0) / this.limit));
  }

  get pageStart(): number {
    if (!this.totalItems) return 0;
    return (this.page - 1) * this.limit + 1;
  }

  get pageEnd(): number {
    if (!this.totalItems) return 0;
    return Math.min(this.page * this.limit, this.totalItems);
  }

  openReason(reason?: string): void {
    this.selectedReason = reason || '—';
    this.isReasonModalOpen = true;
  }

  closeReason(): void {
    this.isReasonModalOpen = false;
    this.selectedReason = '';
  }

  statusClass(status: string | undefined): string {
    switch (status) {
      case 'Self':
        return 'bg-[#FFD49F] text-[#8F5400]';
      case 'Admin':
        return 'bg-[#CCE9FF] text-[#4B75B5]';
      case 'GoViLink':
        return 'bg-[#FFC7D2] text-[#D7004B]';
      default:
        return 'bg-[#EDEDED] text-[#494949] dark:bg-[#1E2638] dark:text-textDark';
    }
  }
}

export interface DeletedSupplierDeletedInfo {
  reason: string;
  ownerId: number;
  deletedAt: string;
  deletedBy: string;
}

export type DeletedSupplierOnboardStatus = 'Self' | 'Admin' | 'GoViLink' | string;

export interface DeletedSupplier {
  id: number;
  ownername: string;
  nic: string;
  shopPhone: string;
  email: string;
  onbordStatus: DeletedSupplierOnboardStatus;
  deletedInfo: DeletedSupplierDeletedInfo;
}

export interface GetAllDeletedSuppliersResponse {
  results: DeletedSupplier[];
  total: number;
}
