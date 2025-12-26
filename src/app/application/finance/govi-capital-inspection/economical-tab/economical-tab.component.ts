import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-economical-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './economical-tab.component.html',
  styleUrl: './economical-tab.component.css'
})
export class EconomicalTabComponent implements OnChanges {

  @Input() EconomicalObj!: IEconomical;

  ngOnChanges(changes: SimpleChanges): void {
    console.log('---------------------------------------------------------------');
    console.log(this.EconomicalObj);
    
    
  }

}

interface IEconomical {
  id: number
  reqId: string
  isSuitaleSize: number
  isFinanceResource: number
  isAltRoutes: number
  createdAt: Date
}
