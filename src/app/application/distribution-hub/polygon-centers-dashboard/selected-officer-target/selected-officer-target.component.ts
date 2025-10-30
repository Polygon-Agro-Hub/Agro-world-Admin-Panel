import { CommonModule, DatePipe, Location  } from '@angular/common';
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

  officerId: number = 111;

  date:  string = '';

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  hasData: boolean = true;

  isLoading:boolean = true;

  selectedOfficerId: number | '' = '';

  selectedOrderIds: number[] = []; 
  allChecked: boolean = false;
  
  filteredOrdersArr!: orders[] 

  isPassTarget = false;

  isStatusDropdownOpen = false;
  statusDropdownOptions = ['Pending', 'Completed', 'Opened'];

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
    
    this.fetchSelectedOfficerTargets();
    
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const statusDropdownElement = document.querySelector('.custom-status-dropdown-container');
    const statusDropdownClickedInside = statusDropdownElement?.contains(event.target as Node);

    if (!statusDropdownClickedInside && this.isStatusDropdownOpen) {
      this.isStatusDropdownOpen = false;
    }

  }

  fetchSelectedOfficerTargets(
    officerId: number = this.officerId, 
    search: string = this.searchText, 
    status: string = this.selectStatus
  ) {
    this.isLoading = true;
    this.DestributionSrv.getSelectedOfficerTargets(officerId, search, status).subscribe(
      (res) => {
        this.ordersArr = res.items.map((item: any) => {
          let status = '';
        
          if (item.packageStatus === 'Pending' && (item.additionalItemsStatus === 'Unknown' || item.additionalItemsStatus === 'Pending')) {
            status = 'Pending';
          }
          else if (item.packageStatus === 'Pending' && (item.additionalItemsStatus === 'Opened' || item.additionalItemsStatus === 'Completed')) {
            status = 'Opened';
          }
          else if (item.packageStatus === 'Opened') {
            status = 'Opened';
          }
          else if (item.packageStatus === 'Completed' && item.additionalItemsStatus === 'Unknown') {
            status = 'Completed';
          }
          else if (item.packageStatus === 'Completed' && item.additionalItemsStatus === 'Pending') {
            status = 'Pending';
          }
          else if (item.packageStatus === 'Completed' && item.additionalItemsStatus === 'Opened') {
            status = 'Opened';
          }
          else if (item.packageStatus === 'Completed' && item.additionalItemsStatus === 'Completed') {
            status = 'Completed';
          }
          else if (item.packageStatus === 'Unknown' && item.additionalItemsStatus === 'Pending') {
            status = 'Pending';
          }
          else if (item.packageStatus === 'Unknown' && item.additionalItemsStatus === 'Opened') {
            status = 'Opened';
          }
          else if (item.packageStatus === 'Unknown' && item.additionalItemsStatus === 'Completed') {
            status = 'Completed';
          }
          else if (item.packageStatus === 'Unknown' && item.additionalItemsStatus === 'Unknown') {
            status = 'Unknown';
          }
        
          return {
            ...item,
            combinedStatus: status
          };
        });
        
  
        this.totalItems = res.total;
  
        this.hasData = this.ordersArr.length > 0;
        this.isLoading = false;
      }
    );
  }

  onSearch() {
    this.fetchSelectedOfficerTargets();

  }

  offSearch() {
    this.searchText = '';
    this.fetchSelectedOfficerTargets();

  }

  getDisplayDate(scheduleDate: string | Date): string {
    const today = new Date();
    const schedule = new Date(scheduleDate);
  
    // Normalize times to midnight for accurate date-only comparison
    today.setHours(0, 0, 0, 0);
    schedule.setHours(0, 0, 0, 0);
  
    const diffDays = Math.floor((schedule.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays === 2) {
      return 'Day after tomorrow';
    } else {
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
}
