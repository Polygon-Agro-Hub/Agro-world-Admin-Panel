import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router } from '@angular/router';
import { DestributionService } from '../../../../services/destribution-service/destribution-service.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-out-of-delivery',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    CalendarModule,
    DropdownModule,
    NgxPaginationModule,
    FormsModule
  ],
  templateUrl: './out-of-delivery.component.html',
  styleUrl: './out-of-delivery.component.css',
})
export class OutOfDeliveryComponent implements OnChanges {
  @Input() centerObj!: CenterDetails;
  orderArr!: Orders[];
  orderCount: number = 0;
  selectDate: string = '';
  selectStatus: string = '';
  searchText: string = '';

  statusOptions = [
    { label: 'Late', value: 'Late' },
    { label: 'On Time', value: 'On Time' },
  ]


  ngOnChanges(): void {
    this.fetchData();
  }

  changeStatus(){
    console.log(this.selectStatus);
    this.fetchData();
  }

  constructor(
    private router: Router,
    private DestributionSrv: DestributionService,
    // private datePipe: DatePipe // Inject DatePipe
    // public tokenService: TokenService,
    // public permissionService: PermissionService
  ) { }

  fetchData() {
    this.DestributionSrv.getCenterOutForDlvryOrders(this.centerObj.centerId, this.selectDate, this.selectStatus, this.searchText).subscribe(
      (res) => {
        this.orderArr = res.data
        this.orderCount = res.data ? res.data.length : 0;
      }
    )
  }
  isLoading = false;
  hasData: boolean = false;
}

interface CenterDetails {
  centerId: number;
  centerName: string;
  centerRegCode: string;
}

class Orders {
  id!:number
  invNo!:string 
  firstNameEnglish!:string
  lastNameEnglish!:string 
  sheduleDate!:string 
  outDlvrDate!:string 
  outDlvrStatus!:string 
}
