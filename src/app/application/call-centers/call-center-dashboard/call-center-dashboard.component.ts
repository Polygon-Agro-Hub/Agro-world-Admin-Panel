import { Component } from '@angular/core';
import { RowOneComponent } from './row-one/row-one.component';
import { ColumRightComponent } from './colum-right/colum-right.component';
import { LeftColumnComponent } from './left-column/left-column.component';

@Component({
  selector: 'app-call-center-dashboard',
  standalone: true,
  imports: [RowOneComponent, ColumRightComponent, LeftColumnComponent, LeftColumnComponent, ColumRightComponent],
  templateUrl: './call-center-dashboard.component.html',
  styleUrl: './call-center-dashboard.component.css',
})
export class CallCenterDashboardComponent {}
