import { CommonModule, DatePipe, Location } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
import { ActivatedRoute, Router } from '@angular/router';
import { DestributionService } from '../../../../services/destribution-service/destribution-service.service';

@Component({
  selector: 'app-selected-officer-target',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, LoadingSpinnerComponent],
  templateUrl: './selected-officer-target.component.html',
  styleUrl: './selected-officer-target.component.css'
})
export class SelectedOfficerTargetComponent implements OnInit {
  ordersArr!: orders[];
  searchText: string = '';
  selectStatus: string = '';

  totalOfficers: number = 0;

  isPass: boolean = false;

  officerId: number = 66;

  date: string = '';

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  hasData: boolean = true;

  isLoading: boolean = true;

  selectedOfficerId: number | '' = '';

  selectedOrderIds: number[] = [];
  allChecked: boolean = false;

  filteredOrdersArr!: orders[]

  isPassTarget = false;

  isStatusDropdownOpen = false;
  statusDropdownOptions = ['Pending', 'Completed', 'Opened'];
  selectCompletingStatus: string = '';
  isCompletingStatusDropdownOpen = false;
  completingStatusDropdownOptions = ['On Time', 'Late', 'Not Complete'];

  toggleStatusDropdown() {
    this.isStatusDropdownOpen = !this.isStatusDropdownOpen;
  }

  selectStatusOption(option: string) {
    this.selectStatus = option;
    this.isStatusDropdownOpen = false;
    this.filterStatus();
  }

  constructor(
    private router: Router,
    // private DistributionSrv: DistributionServiceService,
    private DestributionSrv: DestributionService,
    private location: Location,
    private route: ActivatedRoute
  ) { }


  ngOnInit(): void {
    this.officerId = this.route.snapshot.queryParams['targetId'];;
    this.fetchSelectedOfficerTargets();

  }

  // 2. Add new methods
toggleCompletingStatusDropdown() {
  this.isCompletingStatusDropdownOpen = !this.isCompletingStatusDropdownOpen;
}

selectCompletingStatusOption(option: string) {
  this.selectCompletingStatus = option;
  this.isCompletingStatusDropdownOpen = false;
  this.filterCompletingStatus();
}

filterCompletingStatus() {
  this.fetchSelectedOfficerTargets();
}

cancelCompletingStatus(event?: MouseEvent) {
  if (event) {
    event.stopPropagation();
  }
  this.selectCompletingStatus = '';
  this.fetchSelectedOfficerTargets();
}

// 3. Update @HostListener to include new dropdown
@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {
  const statusDropdownElement = document.querySelector('.custom-status-dropdown-container');
  const statusDropdownClickedInside = statusDropdownElement?.contains(event.target as Node);

  const completingStatusDropdownElement = document.querySelector('.custom-completing-status-dropdown-container');
  const completingStatusDropdownClickedInside = completingStatusDropdownElement?.contains(event.target as Node);

  if (!statusDropdownClickedInside && this.isStatusDropdownOpen) {
    this.isStatusDropdownOpen = false;
  }

  if (!completingStatusDropdownClickedInside && this.isCompletingStatusDropdownOpen) {
    this.isCompletingStatusDropdownOpen = false;
  }
}

// 4. Update fetchSelectedOfficerTargets method signature
fetchSelectedOfficerTargets(
  officerId: number = this.officerId, 
  search: string = this.searchText, 
  status: string = this.selectStatus,
  completingStatus: string = this.selectCompletingStatus
) {
  this.isLoading = true;
  this.DestributionSrv.getSelectedOfficerTargets(officerId, search, status, completingStatus).subscribe(
    (res) => {
      this.ordersArr = res.items
      // this.ordersArr = res.items.map((item: any) => {
        // let status = '';
          
        //   const pkgStatus = item.packageStatus;
        //   const addStatus = item.additionalItemsStatus;
          
        //   // Priority 1: If either is Pending, combinedStatus is Pending
        //   if (pkgStatus === 'Pending' || addStatus === 'Pending') {
        //     status = 'Pending';
        //   }
        //   // Priority 2: If either is Opened (and none are Pending), combinedStatus is Opened
        //   else if (pkgStatus === 'Opened' || addStatus === 'Opened') {
        //     status = 'Opened';
        //   }
        //   // Priority 3: If both are Completed, combinedStatus is Completed
        //   else if (pkgStatus === 'Completed' && addStatus === 'Completed') {
        //     status = 'Completed';
        //   }
        //   // Priority 4: If one is Completed and other is Unknown, use the non-Unknown status
        //   else if (pkgStatus === 'Completed' && addStatus === 'Unknown') {
        //     status = 'Completed';
        //   }
        //   else if (pkgStatus === 'Unknown' && addStatus === 'Completed') {
        //     status = 'Completed';
        //   }
        //   // Default: Both are Unknown
        //   else {
        //     status = 'Unknown';
        //   }
        
        //   return {
        //     ...item,
        //     combinedStatus: status
        //   };
      // });

      this.totalItems = res.total;
      this.hasData = this.ordersArr.length > 0;
      this.isLoading = false;
    }
  );
}

  onSearch() {
    this.searchText = this.searchText.trimStart();
    this.fetchSelectedOfficerTargets();

  }

  offSearch() {
    this.searchText = '';
    this.fetchSelectedOfficerTargets();

  }

  getDisplayDate(scheduleDate: string | Date): string {

    const schedule = new Date(scheduleDate);

      const day = schedule.getDate();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[schedule.getMonth()];

      // Get ordinal for the day
      const ordinal = (n: number) => {
        if (n > 3 && n < 21) return 'th';
        switch (n % 10) {
          case 1: return 'st';
          case 2: return 'nd';
          case 3: return 'rd';
          default: return 'th';
        }
      }

      return `${day}${ordinal(day)} ${month}`;

  }



  removeWithin(time: string): string {
    return time ? time.replace('Within ', '') : time;
  }

  filterStatus() {
    this.fetchSelectedOfficerTargets();
  }

  cancelStatus(event?: MouseEvent) {
    if (event) {
      event.stopPropagation(); // Prevent triggering the dropdown toggle
    }
    this.selectStatus = '';
    this.fetchSelectedOfficerTargets();
  }

  goBack() {
    this.location.back();
  }



}

class orders {
  processOrderId!: number
  orderId!: number
  invNo!: string
  isTargetAssigned!: boolean
  sheduleDate!: Date
  sheduleTime!: string
  packagePackStatus!: string
  status!: string
  officerId!: number
  empId!: string
  firstNameEnglish!: string
  lastNameEnglish!: string
  outDlvrDateLocal!: string
  distributedTargetId!: number
  combinedStatus!: string
  completeTimeStatus!: string
  packageStatus!: string;
  additionalItemsStatus!: string;
}
