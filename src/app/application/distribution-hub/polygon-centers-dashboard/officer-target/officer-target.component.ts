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
  selector: 'app-officer-target',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    CalendarModule,
    DropdownModule,
    NgxPaginationModule,
    FormsModule
  ],
  templateUrl: './officer-target.component.html',
  styleUrl: './officer-target.component.css',
})
export class OfficerTargetComponent implements OnChanges {
  @Input() centerObj!: CenterDetails;
  isLoading = false;
  hasData: boolean = false;
  ordersArr: Orders[] = [];
  orderCount: number = 0;
  selectDate: Date = new Date();

  constructor(
    private router: Router,
    private DestributionSrv: DestributionService,
  ) { }
  ngOnChanges(changes: SimpleChanges): void {
    this.fetchData();
  }

  fetchData() {
    this.isLoading = true
    // const dateParam = this.selectDate ? this.selectDate.toISOString().split('T')[0] : '';
    this.DestributionSrv.getDailyOfficerDistributedTarget(this.centerObj.centerId, this.formatDateForAPI(this.selectDate)).subscribe(
      (res) => {
        this.ordersArr = res.data;
        this.orderCount = res.data?.length || 0;
        this.hasData = this.orderCount > 0;
        this.isLoading = false
      }
    )
  }

  selectOfficer(id: number) {
    this.router.navigate([`/distribution-hub/action/view-polygon-centers/selected-officer-target`], { queryParams: { targetId: id } })
  }

  private formatDateForAPI(date: Date | null): string {
    if (!date) return '';

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`; 
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
