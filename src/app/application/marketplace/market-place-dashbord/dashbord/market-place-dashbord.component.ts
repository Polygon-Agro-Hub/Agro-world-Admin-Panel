import { Component } from '@angular/core';
import { DashbordFirstRowComponent } from '../dashbord-components/dashbord-first-row/dashbord-first-row.component';
import { DashbordAreaChartComponent } from '../dashbord-components/dashbord-area-chart/dashbord-area-chart.component';
import { DashbordPieChartComponent } from '../dashbord-components/dashbord-pie-chart/dashbord-pie-chart.component';

@Component({
  selector: 'app-market-place-dashbord',
  standalone: true,
  imports: [DashbordFirstRowComponent, DashbordAreaChartComponent, DashbordPieChartComponent],
  templateUrl: './market-place-dashbord.component.html',
  styleUrl: './market-place-dashbord.component.css'
})
export class MarketPlaceDashbordComponent {

}
