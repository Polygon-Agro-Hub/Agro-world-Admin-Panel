import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-dashbord-first-row',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashbord-first-row.component.html',
  styleUrl: './dashbord-first-row.component.css'
})
export class DashbordFirstRowComponent implements OnChanges {

  @Input() firstRow!: FirstRow;

  ngOnChanges(): void {
    console.log("FirstRow",this.firstRow);
    
  }

}

interface FirstRow {
  todaySalses: SalesDayCount;
  yesterdaySalses: SalesDayCount;
  thisMonthSales: SalesDayCount;
  newUserCount: UserCount;
}

interface SalesDayCount {
  count: number;
  total: number;
}

interface UserCount {
  userCount: number;
}
