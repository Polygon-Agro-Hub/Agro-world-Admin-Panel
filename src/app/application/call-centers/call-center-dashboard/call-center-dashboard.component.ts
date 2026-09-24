import { Component } from '@angular/core';
import { RowOneComponent } from './row-one/row-one.component';
import { ColumRightComponent } from './colum-right/colum-right.component';

@Component({
  selector: 'app-call-center-dashboard',
  standalone: true,
  imports: [RowOneComponent, ColumRightComponent],
  templateUrl: './call-center-dashboard.component.html',
  styleUrl: './call-center-dashboard.component.css',
})
export class CallCenterDashboardComponent {}
