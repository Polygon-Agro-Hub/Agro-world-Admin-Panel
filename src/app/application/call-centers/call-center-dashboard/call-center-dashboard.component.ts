import { Component } from '@angular/core';
import { LeftColumnComponent } from './left-column/left-column.component';

@Component({
  selector: 'app-call-center-dashboard',
  standalone: true,
  imports: [LeftColumnComponent],
  templateUrl: './call-center-dashboard.component.html',
  styleUrl: './call-center-dashboard.component.css'
})
export class CallCenterDashboardComponent {

}
