import { Component } from '@angular/core';
import { DashbordFirstRowComponent } from '../dashbord-components/dashbord-first-row/dashbord-first-row.component';

@Component({
  selector: 'app-market-place-dashbord',
  standalone: true,
  imports: [DashbordFirstRowComponent],
  templateUrl: './market-place-dashbord.component.html',
  styleUrl: './market-place-dashbord.component.css'
})
export class MarketPlaceDashbordComponent {

}
