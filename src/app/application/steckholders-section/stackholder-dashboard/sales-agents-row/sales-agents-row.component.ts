import { Component, Input, OnChanges} from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from "../../../../components/loading-spinner/loading-spinner.component";

@Component({
  selector: "app-sales-agents-row",
  standalone: true,
  imports: [CommonModule, DropdownModule, LoadingSpinnerComponent],
  templateUrl: "./sales-agents-row.component.html",
  styleUrl: "./sales-agents-row.component.css",
})
export class SalesAgentsRowComponent implements OnChanges {
  @Input() fourthRow: any = {};

  activeSalesAgents: number = 0;
  allSalesAgents : number = 0;
  newSalesAgents: number = 0;
  

  ngOnChanges(): void {
    this.fetchSalesAgentData(this.fourthRow)
  }

  fetchSalesAgentData(data: any) {
    
    console.log('Forth Row ->', data);
    this.activeSalesAgents = data?.activeSalesAgents?.activeSalesAgents ?? 0;
    this.allSalesAgents = data?.allSalesAgents?.totalSaleAgents ?? 0;
    this.newSalesAgents = data?.newSalesAgents?.newSalesAgents ?? 0;
    
  }
}
