import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import {
  ProcumentsService,
  DistributionCenterDto,
} from '../../../../services/procuments/procuments.service';
import { TokenService } from '../../../../services/token/services/token.service';
import { PermissionService } from '../../../../services/roles-permission/permission.service';

interface ShortageItem {
  id: number; // shortageAssignedId
  itemName: string;
  imageUrl: string;
  shortageKg: number;
  distributionCenters: DistributionCenterDto[];
  selectedDC: DistributionCenterDto | null;
  marketPricePerKg: number;
  ceilingPercent: number;
  assignedBy: string;
  finalized: boolean;
}

@Component({
  selector: 'app-shortage-finalization-today',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    DialogModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './shortage-finalization-today.component.html',
  styleUrl: './shortage-finalization-today.component.css',
})
export class ShortageFinalizationTodayComponent implements OnInit {
  isLoading = false;
  isFinalizing = false;
  errorMessage = '';

  shortageItems: ShortageItem[] = [];

  showConfirmModal = false;
  itemPendingFinalize: ShortageItem | null = null;

  constructor(
    private shortageService: ProcumentsService,
    public tokenService: TokenService,
    public permissionService: PermissionService,
  ) { }

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.shortageService.getShortageToFinalizeList().subscribe({
      next: (toFinalizeRes) => {
        const toFinalizeItems = this.mapToShortageItems(
          toFinalizeRes?.data || [],
          false
        );

        this.shortageService.getShortageFinalizedList().subscribe({
          next: (finalizedRes) => {
            const finalizedItems = this.mapToShortageItems(
              finalizedRes?.data || [],
              true
            );
            this.shortageItems = [...toFinalizeItems, ...finalizedItems];
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error fetching finalized list:', err);
            this.errorMessage = 'Failed to load finalized items.';
            this.isLoading = false;
          },
        });
      },
      error: (err) => {
        console.error('Error fetching to-finalize list:', err);
        this.errorMessage = 'Failed to load shortage data.';
        this.isLoading = false;
      },
    });
  }

  private mapToShortageItems(data: any[], finalized: boolean): ShortageItem[] {
    return data.map((item) => {
      const distributionCenters: DistributionCenterDto[] =
        item.distributionCenters || [];

      const preselectedDC =
        item.selectedDC ||
        distributionCenters.find((dc) => dc.comCenId === item.comCenId) ||
        null;

      return {
        id: item.shortageAssignedId,
        itemName: item.itemName,
        imageUrl: item.imageUrl,
        shortageKg: item.shortageKg,
        distributionCenters,
        selectedDC: preselectedDC,
        marketPricePerKg: Number(item.marketPricePerKg) || 0,
        ceilingPercent: Number(item.ceilingPercent) || 0,
        assignedBy: item.assignedBy || item.assignOfficerBy || null,
        finalized,
      };
    });
  }

  get toFinalizeList(): ShortageItem[] {
    return this.shortageItems.filter((item) => !item.finalized);
  }

  get finalizedList(): ShortageItem[] {
    return this.shortageItems.filter((item) => item.finalized);
  }

  formatCurrency(value: number): string {
    return `Rs. ${Number(value ?? 0).toFixed(2)}`;
  }

  onCeilingInput(event: Event, item: ShortageItem) {
    const inputEl = event.target as HTMLInputElement;
    let value = inputEl.value;

    let digitsOnly = value.replace(/\D/g, '');

    digitsOnly = digitsOnly.replace(/^0+/, '');

    digitsOnly = digitsOnly.slice(0, 2);

    let num = digitsOnly === '' ? 0 : Number(digitsOnly);

    if (num > 99) {
      num = 99;
      digitsOnly = '99';
    }

    if (digitsOnly !== value) {
      inputEl.value = digitsOnly;
    }

    item.ceilingPercent = num;
  }

  blockCeilingKey(event: KeyboardEvent) {
    if (['.', ',', 'e', 'E', '+', '-'].includes(event.key)) {
      event.preventDefault();
    }
  }

  onCeilingBlur(item: ShortageItem) {
    if (!item.ceilingPercent || item.ceilingPercent < 1) {
      item.ceilingPercent = 1;
    } else if (item.ceilingPercent > 99) {
      item.ceilingPercent = 99;
    }
  }

  onFinalizeClick(item: ShortageItem) {
    if (!item.selectedDC) {
      this.errorMessage = 'Please select a distribution centre before finalizing.';
      return;
    }

    if (!item.ceilingPercent || item.ceilingPercent < 1 || item.ceilingPercent > 99) {
      this.errorMessage = 'Ceiling (%) must be between 1 and 99.';
      return;
    }

    this.errorMessage = '';
    this.itemPendingFinalize = item;
    this.showConfirmModal = true;
  }

  onCancelFinalize() {
    this.itemPendingFinalize = null;
    this.showConfirmModal = false;
  }

  onConfirmFinalize() {
    const item = this.itemPendingFinalize;
    const selectedDC = item?.selectedDC;

    if (!item || !selectedDC) {
      return;
    }

    this.isFinalizing = true;

    this.shortageService
      .finalizeShortageAssigned(
        item.id,
        selectedDC.comCenId,
        item.ceilingPercent
      )
      .subscribe({
        next: () => {
          this.isFinalizing = false;
          this.itemPendingFinalize = null;
          this.showConfirmModal = false;
          // Re-fetch so the finalized card reflects the confirmed server state
          this.loadAllData();
        },
        error: (err) => {
          console.error('Error finalizing shortage assignment:', err);
          this.errorMessage = 'Failed to finalize. Please try again.';
          this.isFinalizing = false;
          this.showConfirmModal = false;
        },
      });
  }

  goBack() {
    window.history.back();
  }

  formatQty(value: number): string {
    return (Number(value) || 0).toFixed(2);
  }

  getCentreNameOnly(dc: DistributionCenterDto | null | undefined): string {
    if (!dc?.fullName) return '';
    // Strips a leading reg code like "REG001 - " or "REG001-" or "REG001: "
    return dc.fullName.replace(/^\s*[A-Za-z0-9-]+\s*[-:]\s*/, '').trim();
  }
}