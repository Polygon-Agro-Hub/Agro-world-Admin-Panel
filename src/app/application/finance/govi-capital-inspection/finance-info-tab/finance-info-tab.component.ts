import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-finance-info-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './finance-info-tab.component.html',
  styleUrl: './finance-info-tab.component.css',
})
export class FinanceInfoTabComponent {
  @Input() financeInfo!: IFinance;
  @Input() currentPage: number = 3;
  @Input() totalPages: number = 11;
  @Output() nextPage = new EventEmitter<void>();
  @Output() previousPage = new EventEmitter<void>();

  onNextPage(): void {
    this.nextPage.emit();
  }

  onPreviousPage(): void {
    this.previousPage.emit();
  }
}

export interface IFinance {
  accHolder: string;
  accNum: string;
  bank: string;
  branch: string;
  debtsOfFarmer: string;
  noOfDependents: number;
  assetsLand: string[] | null;
  assetsBuilding: string[] | null;
  assetsVehicle: string[] | null;
  assetsMachinery: string[] | null;
  assetsFarmTool: string;
}
