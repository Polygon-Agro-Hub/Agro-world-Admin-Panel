import { Component, OnInit } from '@angular/core';
import { DashbordFirstRowComponent } from '../dashbord-components/dashbord-first-row/dashbord-first-row.component';
import { DashbordAreaChartComponent } from '../dashbord-components/dashbord-area-chart/dashbord-area-chart.component';
import { DashbordPieChartComponent } from '../dashbord-components/dashbord-pie-chart/dashbord-pie-chart.component';
import { DashbordSecondRowComponent } from '../dashbord-components/dashbord-second-row/dashbord-second-row.component';
import { DashbordTableComponent } from '../dashbord-components/dashbord-table/dashbord-table.component';
import { MarketPlaceService } from '../../../../services/market-place/market-place.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-market-place-dashbord',
  standalone: true,
  imports: [DashbordFirstRowComponent, DashbordAreaChartComponent, DashbordPieChartComponent, DashbordSecondRowComponent, DashbordTableComponent],
  templateUrl: './market-place-dashbord.component.html',
  styleUrl: './market-place-dashbord.component.css'
})
export class MarketPlaceDashbordComponent implements OnInit {
  responceData!: Responce;

  constructor(
    private marketSrv: MarketPlaceService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    this.marketSrv.getMarketPlaceDashbordDetails().subscribe(
      (res) => {
        console.log(res);
        this.responceData = res;
      }
    )
  }

}

interface Responce {
  firstRow: FirstRow;
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
