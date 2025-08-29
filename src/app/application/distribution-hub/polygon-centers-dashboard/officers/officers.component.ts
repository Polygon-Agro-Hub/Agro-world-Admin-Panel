import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router } from '@angular/router';
import { DestributionService } from '../../../../services/destribution-service/destribution-service.service';

@Component({
  selector: 'app-officers',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    CalendarModule,
    DropdownModule,
    NgxPaginationModule,
  ],
  templateUrl: './officers.component.html',
  styleUrl: './officers.component.css',
})
export class OfficersComponent implements OnChanges {
  @Input() centerObj!: CenterDetails;
  isLoading = false;
  hasData: boolean = false;
  officersArr!: Officeres[];
  officerCount : number = 0;

  constructor(
    private router: Router,
    private DestributionSrv: DestributionService,
    // private datePipe: DatePipe // Inject DatePipe
    // public tokenService: TokenService,
    // public permissionService: PermissionService
  ) { }


  ngOnChanges(): void {
    this.fetchData()
  }

  fetchData() {

    // Format the date for the API call
    // let formattedDate = '';
    // if (this.selectedDate) {
    //   formattedDate = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd') || '';
    // }

    this.DestributionSrv.getDistributedCenterOfficers(this.centerObj.centerId).subscribe(
      (res) => {
        // this.targetArr = res.data;
        // this.targetCount = res.data.length || 0;
        console.log("Distributed Center Officers", res);
        this.officersArr = res.data;
        this.officerCount = res.data?.length || 0;
      }
    )
  }


}

interface CenterDetails {
  centerId: number;
  centerName: string;
  centerRegCode: string;
}


class Officeres {
  id!:number 
  firstNameEnglish!:string
  lastNameEnglish!:string 
  jobRole!:string 
  empId!:string 
  status!:string 
  phoneCode01!:string
  phoneNumber01!:string 
  nic!:string
}
