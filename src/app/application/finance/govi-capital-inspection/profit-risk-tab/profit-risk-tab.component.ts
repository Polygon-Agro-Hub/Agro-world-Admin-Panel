import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

interface InvestmentDataItem {
  id: string;
  label: string;
  type: string;
  value: string | number;
}

@Component({
  selector: 'app-profit-risk-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profit-risk-tab.component.html',
  styleUrl: './profit-risk-tab.component.css'
})
export class ProfitRiskTabComponent implements OnChanges {

  @Input() profitRiskObj!: IProfitRisk;

  ngOnChanges(changes: SimpleChanges): void {
    console.log('---------------------------------------------------------------');
    console.log(this.profitRiskObj);
    
    
  }

}


interface IProfitRisk {
  id: number
  reqId: string
  profit: number
  isProfitable: number
  isRisk: number
  risk: string
  solution: string
  manageRisk: string
  worthToTakeRisk: string
  createdAt: Date
}