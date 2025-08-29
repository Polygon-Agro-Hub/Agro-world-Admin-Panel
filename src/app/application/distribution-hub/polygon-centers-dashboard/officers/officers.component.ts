import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router } from '@angular/router';
import { DestributionService } from '../../../../services/destribution-service/destribution-service.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-officers',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    CalendarModule,
    DropdownModule,
    NgxPaginationModule,
    FormsModule
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
  selectRole:string = '';
  selectStatus:string = '';
  searchText: string = '';

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
    this.DestributionSrv.getDistributedCenterOfficers(this.centerObj.centerId, this.selectRole, this.selectStatus, this.searchText).subscribe(
      (res) => {
        // this.targetArr = res.data;
        // this.targetCount = res.data.length || 0;
        console.log("Distributed Center Officers", res);
        this.officersArr = res.data;
        this.officerCount = res.data?.length || 0;
      }
    )
  }

  onSearch(){
    this.fetchData()
  }

  offSearch(){
    this.searchText = '';
    this.fetchData()
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
