import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router } from '@angular/router';
import { DestributionService } from '../../../../services/destribution-service/destribution-service.service';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    CalendarModule,
    DropdownModule,
    NgxPaginationModule,
  ],
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.css',
  providers: [DatePipe] // Add DatePipe to providers
})
export class ProgressComponent implements OnChanges {
  @Input() centerObj!: CenterDetails;
  isLoading = false;
  hasData: boolean = false;
  targetArr!: Target[];
  targetCount: number = 0;
  selectedStatus: string = '';
  selectedDate: Date | null = null; // Change type to Date | null
  searchText: string = '';

  statusOptions = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Opened', value: 'Opened' },
    { label: 'Completed', value: 'Completed' },
  ]

  constructor(
    private router: Router,
    private DestributionSrv: DestributionService,
    private datePipe: DatePipe // Inject DatePipe
    // public tokenService: TokenService,
    // public permissionService: PermissionService
  ) { }


  ngOnChanges(): void {
    console.log("Center obj eka", this.centerObj);
    this.fetchData();
  }

  fetchData() {
    console.log(this.selectedDate);
    
    // Format the date for the API call
    let formattedDate = '';
    if (this.selectedDate) {
      formattedDate = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd') || '';
    }
    
    this.DestributionSrv.getCenterTargetDetails(this.centerObj.centerId, this.selectedStatus, formattedDate, this.searchText).subscribe(
      (res) => {
        this.targetArr = res.data;
        this.targetCount = res.data.length || 0;
      }
    )
  }

  clearDate() {
    this.selectedDate = null;
    this.fetchData();
  }

  isToday(dateString: string): boolean {
    const today = new Date();
    const date = new Date(dateString);
    return date.toDateString() === today.toDateString();
  }

  isTomorrow(dateString: string): boolean {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const date = new Date(dateString);
    return date.toDateString() === tomorrow.toDateString();
  }

  isDayAfterTomorrow(dateString: string): boolean {
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    const date = new Date(dateString);
    return date.toDateString() === dayAfterTomorrow.toDateString();
  }

  changeStatus(){
    console.log(this.selectedStatus);
    this.fetchData();
  }

  clearSearch(){
    this.searchText = '';
    this.fetchData();
  }

  onSearch(){
    this.fetchData();
  }
}

interface CenterDetails {
  centerId: number;
  centerName: string;
  centerRegCode: string;
}

class Target {
  invNo!: string;
  firstNameEnglish!: string;
  lastNameEnglish!: string;
  sheduleDate!: string;
  isComplete!: number;
  packageStatus!: string;
  additionalItemsStatus!: string;
}