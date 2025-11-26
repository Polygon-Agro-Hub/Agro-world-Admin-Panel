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
  providers: [DatePipe]
})
export class ProgressComponent implements OnChanges {
  @Input() centerObj!: CenterDetails;
  isLoading = false;
  hasData: boolean = false;
  targetArr!: Target[];
  targetCount: number = 0;
  selectedStatus: string = '';
  selectedDate: Date | null = null;
  searchText: string = '';

  statusOptions = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Opened', value: 'Opened' },
    { label: 'Completed', value: 'Completed' },
  ]

  constructor(
    private router: Router,
    private DestributionSrv: DestributionService,
    private datePipe: DatePipe
  ) { }

  ngOnChanges(): void {
    this.fetchData();
  }

  fetchData() {
    this.isLoading = true;
    let formattedDate = '';
    if (this.selectedDate) {
      formattedDate = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd') || '';
    }
    
    this.DestributionSrv.getCenterTargetDetails(
      this.centerObj.centerId, 
      this.selectedStatus, 
      formattedDate, 
      this.searchText
    ).subscribe(
      (res) => {
        this.targetArr = res.data;
        this.targetCount = res.data.length || 0;
        this.hasData = this.targetCount > 0;
        this.isLoading = false;
      }
    );
  }

  clearDate() {
    this.selectedDate = null;
    this.fetchData();
  }

  getDateColor(item: any): string {
    const today = new Date();
    const schedule = new Date(item.sheduleDate);
  
    // Normalize both to midnight
    today.setHours(0, 0, 0, 0);
    schedule.setHours(0, 0, 0, 0);
  
    const diffDays = Math.floor((schedule.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Get combined status
    const combinedStatus = this.getCombinedStatus(item);
  
    if (combinedStatus === 'Pending' || combinedStatus === 'Opened') {
      if (diffDays > 0) {
        // Future date
        return '#606060';
      } else if (diffDays < 0) {
        // Past date
        return '#AC0003';
      } else {
        // Today - check if it's late or not
        const currentTime = new Date();
        const scheduleTime = new Date(item.sheduleDate);
        
        // If current time is after 12 PM (noon), consider it late
        if (currentTime.getHours() >= 12) {
          return '#FF0000'; // Today (Late Orders)
        } else {
          return '#415CFF'; // Today (No Late Orders)
        }
      }
    }
  
    // Default color for Completed or other statuses
    return '#415CFF';
  }

  getDisplayDate(dateString: string): string {
    const today = new Date();
    const schedule = new Date(dateString);
    
    // Normalize both to midnight
    today.setHours(0, 0, 0, 0);
    schedule.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((schedule.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today 8-12 AM';
    } else if (diffDays === 1) {
      return 'Tomorrow 8-12 AM';
    } else if (diffDays === 2) {
      return 'Day after tomorrow 4-8 PM';
    } else {
      return this.datePipe.transform(dateString, 'mediumDate') || '';
    }
  }

  getCombinedStatus(item: any): string {
    if ((item.packageStatus === 'Pending' && item.additionalItemsStatus === 'Unknown') ||
        (item.packageStatus === 'Unknown' && item.additionalItemsStatus === 'Pending') ||
        (item.packageStatus === 'Pending' && item.additionalItemsStatus === 'Pending')) {
      return 'Pending';
    } else if (item.packageStatus === 'Opened' || item.additionalItemsStatus === 'Opened') {
      return 'Opened';
    } else if ((item.packageStatus === 'Completed' && item.additionalItemsStatus === 'Unknown') ||
               (item.packageStatus === 'Unknown' && item.additionalItemsStatus === 'Completed') ||
               (item.packageStatus === 'Completed' && item.additionalItemsStatus === 'Completed')) {
      return 'Completed';
    }
    return 'Unknown';
  }

  changeStatus() {
    this.fetchData();
  }

  clearSearch() {
    this.searchText = '';
    this.fetchData();
  }

  onSearch() {
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