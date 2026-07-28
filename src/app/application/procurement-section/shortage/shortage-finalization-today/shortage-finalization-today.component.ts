import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';

interface DistributionCenter {
  label: string;
  value: string;
  fullName: string;
}

interface ShortageItem {
  id: number;
  itemName: string;
  imageUrl: string;
  shortageKg: number;
  distributionCenters: DistributionCenter[];
  selectedDC: DistributionCenter | null;
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
export class ShortageFinalizationTodayComponent {
  isLoading = false;

  distributionCenterOptions: DistributionCenter[] = [
    {
      label: 'D-WPCK-01 Kollupitiya Centra..',
      value: 'D-WPCK-01',
      fullName: 'Kollupitiya Central Distribution Centre',
    },
    {
      label: 'D-WPCK-02 Kollupitiya Centra..',
      value: 'D-WPCK-02',
      fullName: 'Kollupitiya Central Distribution Centre 2',
    },
    {
      label: 'D-WPCK-03 Nugegoda Centra..',
      value: 'D-WPCK-03',
      fullName: 'Nugegoda Central Distribution Centre',
    },
  ];

  shortageItems: ShortageItem[] = [
    {
      id: 1,
      itemName: 'Garlic',
      imageUrl:
        'https://pub-79ee03a4a23e4dbbb70c7d799d3cb786.r2.dev/marketplacepackages/image/c3fe76e9-4d89-4327-ac62-4dbec33f7c36.png',
      shortageKg: 5,
      distributionCenters: this.distributionCenterOptions,
      selectedDC: this.distributionCenterOptions[0],
      marketPricePerKg: 100.0,
      ceilingPercent: 5,
      assignedBy: 'Kelum',
      finalized: false,
    },
    {
      id: 2,
      itemName: 'Garlic',
      imageUrl:
        'https://pub-79ee03a4a23e4dbbb70c7d799d3cb786.r2.dev/marketplacepackages/image/c3fe76e9-4d89-4327-ac62-4dbec33f7c36.png',
      shortageKg: 10,
      distributionCenters: this.distributionCenterOptions,
      selectedDC: this.distributionCenterOptions[1],
      marketPricePerKg: 100.0,
      ceilingPercent: 2,
      assignedBy: 'DCH',
      finalized: false,
    },
    {
      id: 3,
      itemName: 'Watermelon',
      imageUrl:
        'https://pub-79ee03a4a23e4dbbb70c7d799d3cb786.r2.dev/marketplacepackages/image/c3fe76e9-4d89-4327-ac62-4dbec33f7c36.png',
      shortageKg: 20,
      distributionCenters: this.distributionCenterOptions,
      selectedDC: this.distributionCenterOptions[0],
      marketPricePerKg: 100.0,
      ceilingPercent: 101,
      assignedBy: 'Kelum',
      finalized: false,
    },
    {
      id: 4,
      itemName: 'Yellow Lemon Premium',
      imageUrl:
        'https://pub-79ee03a4a23e4dbbb70c7d799d3cb786.r2.dev/marketplacepackages/image/c3fe76e9-4d89-4327-ac62-4dbec33f7c36.png',
      shortageKg: 0.5,
      distributionCenters: this.distributionCenterOptions,
      selectedDC: this.distributionCenterOptions[0],
      marketPricePerKg: 100.0,
      ceilingPercent: 2,
      assignedBy: 'Kelum',
      finalized: true,
    },
  ];

  showConfirmModal = false;
  itemPendingFinalize: ShortageItem | null = null;

  get toFinalizeList(): ShortageItem[] {
    return this.shortageItems.filter((item) => !item.finalized);
  }

  get finalizedList(): ShortageItem[] {
    return this.shortageItems.filter((item) => item.finalized);
  }

  formatCurrency(value: number): string {
    return `Rs. ${value.toFixed(2)}`;
  }

  onCeilingInput(event: Event, item: ShortageItem) {
    const inputEl = event.target as HTMLInputElement;
    let sanitized = inputEl.value.replace(/[^0-9.]/g, '');

    const firstDotIndex = sanitized.indexOf('.');
    if (firstDotIndex !== -1) {
      sanitized =
        sanitized.slice(0, firstDotIndex + 1) +
        sanitized.slice(firstDotIndex + 1).replace(/\./g, '');
    }

    inputEl.value = sanitized;
    item.ceilingPercent = sanitized === '' ? 0 : Number(sanitized);
  }

  onFinalizeClick(item: ShortageItem) {
    this.itemPendingFinalize = item;
    this.showConfirmModal = true;
  }

  onCancelFinalize() {
    this.itemPendingFinalize = null;
    this.showConfirmModal = false;
  }

  onConfirmFinalize() {
    if (this.itemPendingFinalize) {
      this.itemPendingFinalize.finalized = true;
    }
    this.itemPendingFinalize = null;
    this.showConfirmModal = false;
  }

  goBack() {
    window.history.back();
  }
}
