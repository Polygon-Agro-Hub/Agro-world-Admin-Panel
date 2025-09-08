import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router } from '@angular/router';
import { DestributionService } from '../../../../services/destribution-service/destribution-service.service';

@Component({
  selector: 'app-officer-target',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    CalendarModule,
    DropdownModule,
    NgxPaginationModule,
  ],
  templateUrl: './officer-target.component.html',
  styleUrl: './officer-target.component.css',
})
export class OfficerTargetComponent implements OnChanges {
  @Input() centerObj!: CenterDetails;
  isLoading = false;
  hasData: boolean = false;
  ordersArr: Orders[] = [];
  orderCount : number = 0;

  constructor(
    private router: Router,
    private DestributionSrv: DestributionService,
    // private datePipe: DatePipe // Inject DatePipe
    // public tokenService: TokenService,
    // public permissionService: PermissionService
  ) { }
  ngOnChanges(changes: SimpleChanges): void {
    this.fetchData();
  }

  fetchData() {
    this.DestributionSrv.getDailyOfficerDistributedTarget(this.centerObj.centerId).subscribe(
      (res) => {
        // this.targetArr = res.data;
        // this.targetCount = res.data.length || 0;
        console.log("Distributed Center Officers", res);
        this.ordersArr = res.data;
        this.orderCount = res.data?.length || 0;
        this.hasData = this.orderCount > 0;
      }
    )
  }

  selectOfficer() {
    this.router.navigate([`/distribution-hub/action/view-polygon-centers/selected-officer-target`])
  }
}

interface CenterDetails {
  centerId: number;
  centerName: string;
  centerRegCode: string;
}

class Orders {
  id!: number;
  target!: number;
  complete!: number;
  empId!: string;
  firstNameEnglish!: string;
  lastNameEnglish!: string;
}
