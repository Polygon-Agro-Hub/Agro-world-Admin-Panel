import { Component, OnInit } from '@angular/core';
import { RowOneComponent } from './row-one/row-one.component';
import { ColumRightComponent } from './colum-right/colum-right.component';
import { LeftColumnComponent } from './left-column/left-column.component';
import { TableRowComponent } from './table-row/table-row.component';
import { RowTwoComponent } from './row-two/row-two.component';
import { RowFourComponent } from './row-four/row-four.component';
import { CallCenterService } from '../../../services/call-center/call-center.service';

@Component({
  selector: 'app-call-center-dashboard',
  standalone: true,
  imports: [
    RowFourComponent,
    RowTwoComponent,
    RowOneComponent,
    ColumRightComponent,
    LeftColumnComponent,
    LeftColumnComponent,
    ColumRightComponent,
    TableRowComponent,
  ],
  templateUrl: './call-center-dashboard.component.html',
  styleUrl: './call-center-dashboard.component.css',
})
export class CallCenterDashboardComponent implements OnInit {
  isLoading: boolean = true;

  constructor(
    private callCenterSrv: CallCenterService
  ) { }

  fetchdata() {
    this.isLoading = true;
    this.callCenterSrv.getDashbordData().subscribe(
      (res) =>{
        console.log(res);
        this.isLoading = false;
      }
    )
  }

  ngOnInit(): void {
    this.fetchdata();
  }

}
