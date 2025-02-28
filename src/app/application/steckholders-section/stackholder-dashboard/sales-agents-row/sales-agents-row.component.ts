import { Component, Input, OnChanges} from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';

@Component({
  selector: "app-sales-agents-row",
  standalone: true,
  imports: [CommonModule, DropdownModule],
  templateUrl: "./sales-agents-row.component.html",
  styleUrl: "./sales-agents-row.component.css",
})
export class SalesAgentsRowComponent implements OnChanges {
  @Input() fourthRow: any = {};

  activeSalesAgents!: number;
  allSalesAgents!: number;
  newSalesAgents!: number;

  ngOnChanges(): void {
    this.fetchSalesAgentData(this.fourthRow)
  }

  fetchSalesAgentData(data: any) {
    console.log('Forth Row ->', data);
    this.activeSalesAgents = data.activeSalesAgents.activeSalesAgents ?? 0;
    this.allSalesAgents = data.allSalesAgents.totalSaleAgents ?? 0;
    this.newSalesAgents = data.newSalesAgents.newSalesAgents ?? 0;
  }
}
