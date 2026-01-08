import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-finance-info-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './finance-info-tab.component.html',
  styleUrl: './finance-info-tab.component.css',
})
export class FinanceInfoTabComponent {
  @Input() financeInfo!: IFinance;
}

export interface IFinance {
  accHolder: string;
  accNum: string;
  bank: string;
  branch: string;
  debtsOfFarmer: string;
  noOfDependents: number;
  assetsLand: { Land: string[] };
  assetsBuilding: { Building: string[] };
  assetsVehicle: { Vehicle: string[] };
  assetsMachinery: { Machinery: string[] };
  assetsFarmTool: string;
}
