import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-finance-info-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './finance-info-tab.component.html',
  styleUrl: './finance-info-tab.component.css',
})
export class FinanceInfoTabComponent implements OnChanges {
  @Input() financeArr!: Question[];

  finance = {
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    branchName: '',
    existingDebts: '',
    dependents: '',
    assets: {
      Land: [] as string[],
      Building: [] as string[],
      Vehicle: [] as string[],
      Machinery: [] as string[],
      SpecialFarmTools: '',
    },
  };

  private parseMaybeJson<T = any>(val: any): T | any {
    if (typeof val !== 'string') return val;
    const trimmed = val.trim();
    try {
      return JSON.parse(trimmed);
    } catch {
      if (
        (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ) {
        return trimmed.slice(1, -1);
      }
      return val;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const byLabel = (label: string) =>
      (this.financeArr || []).find((q) => q.quaction === label)?.answer ?? '';

    this.finance.accountHolderName = byLabel('Account Holders Name');
    this.finance.accountNumber = byLabel('Account Number');
    this.finance.bankName = byLabel('Bank Name');
    this.finance.branchName = byLabel('Branch Name');
    this.finance.existingDebts = byLabel('Existing debts of the farmer');
    this.finance.dependents = byLabel('No. of Dependents');

    const rawAssets = byLabel('Assets owned by the farmer');
    const assetsAns = this.parseMaybeJson<any>(rawAssets);
    if (assetsAns && typeof assetsAns === 'object') {
      this.finance.assets.Land = Array.isArray(assetsAns.Land)
        ? assetsAns.Land
        : [];
      this.finance.assets.Building = Array.isArray(assetsAns.Building)
        ? assetsAns.Building
        : [];
      this.finance.assets.Vehicle = Array.isArray(assetsAns.Vehicle)
        ? assetsAns.Vehicle
        : [];
      this.finance.assets.Machinery = Array.isArray(assetsAns.Machinery)
        ? assetsAns.Machinery
        : [];
    } else {
      this.finance.assets.Land = [];
      this.finance.assets.Building = [];
      this.finance.assets.Vehicle = [];
      this.finance.assets.Machinery = [];
    }

    const rawTools = byLabel('Special Farm Tools');
    const toolsAns = this.parseMaybeJson<string>(rawTools);
    this.finance.assets.SpecialFarmTools =
      (typeof toolsAns === 'string' ? toolsAns : '') || '';

    console.log('[FinanceInfoTab] financeArr ->', this.financeArr);
    console.log('[FinanceInfoTab] parsed assets ->', assetsAns);
    console.log('[FinanceInfoTab] finance ->', this.finance);
  }
}

interface Question {
  answer: any;
  qIndex: number;
  ansType: string;
  quaction: string;
}
