import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { PersonalInfoTabComponent } from '../personal-info-tab/personal-info-tab.component';
import { IdProofTabComponent } from '../id-proof-tab/id-proof-tab.component';
import { FinanceInfoTabComponent } from '../finance-info-tab/finance-info-tab.component';
import { LandInfoTabComponent } from '../land-info-tab/land-info-tab.component';
import { InvestmentInfoTabComponent } from '../investment-info-tab/investment-info-tab.component';
import { CultivationInfoTabComponent } from '../cultivation-info-tab/cultivation-info-tab.component';
import { CroppingSystemTabComponent } from '../cropping-system-tab/cropping-system-tab.component';
import { ProfitRiskTabComponent } from '../profit-risk-tab/profit-risk-tab.component';
import { EconomicalTabComponent } from '../economical-tab/economical-tab.component';
import { LabourTabComponent } from '../labour-tab/labour-tab.component';
import { HarvestStorageTabComponent } from '../harvest-storage-tab/harvest-storage-tab.component';

@Component({
  selector: 'app-audit-personal-info',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    PersonalInfoTabComponent,
    IdProofTabComponent,
    FinanceInfoTabComponent,
    LandInfoTabComponent,
    InvestmentInfoTabComponent,
    CultivationInfoTabComponent,
    CroppingSystemTabComponent,
    ProfitRiskTabComponent,
    EconomicalTabComponent,
    LabourTabComponent,
    HarvestStorageTabComponent,
  ],
  templateUrl: './audit-personal-info.component.html',
  styleUrl: './audit-personal-info.component.css',
})
export class AuditPersonalInfoComponent {
  isLoading: boolean = false;
  activeTab: string = 'Personal';

  constructor() {}

  back(): void {
    window.history.back();
  }

  selectTab(tabName: string): void {
    this.activeTab = tabName;
  }
}
