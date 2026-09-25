import { Component } from '@angular/core';
import { RowOneComponent } from './row-one/row-one.component';
import { ColumRightComponent } from './colum-right/colum-right.component';
import { LeftColumnComponent } from './left-column/left-column.component';
import { RowTwoComponent } from './row-two/row-two.component';
import { RowFourComponent } from './row-four/row-four.component';

@Component({
  selector: 'app-call-center-dashboard',
  standalone: true,
  imports: [RowFourComponent, RowTwoComponent, RowOneComponent, ColumRightComponent, LeftColumnComponent, LeftColumnComponent, ColumRightComponent],
  templateUrl: './call-center-dashboard.component.html',
  styleUrl: './call-center-dashboard.component.css',
})
export class CallCenterDashboardComponent {}
