import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

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
  @Input() currentPage: number = 8;
  @Input() totalPages: number = 11;
  @Output() nextPage = new EventEmitter<void>();
  @Output() previousPage = new EventEmitter<void>();

  onNextPage(): void {
    this.nextPage.emit();
  }

  onPreviousPage(): void {
    this.previousPage.emit();
  }

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