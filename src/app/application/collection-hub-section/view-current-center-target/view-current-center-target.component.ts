import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-current-center-target',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './view-current-center-target.component.html',
  styleUrl: './view-current-center-target.component.css'
})
export class ViewCurrentCenterTargetComponent implements OnInit {

  centerId!: number;

  targetArr!: DailyTargets[];

  searchText: string = '';
  selectStatus: string = '';
  selectValidity: string = '';
  today!: string;

  isDownloading = false;

  hasData: boolean = false;
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;


  isLoading: boolean = false;

  isStatusDropdownOpen = false;
  statusDropdownOptions = ['Pending', 'Completed', 'Exceeded'];

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
    private route: ActivatedRoute,
    private collectionCenterSrv: CollectionCenterService,

  ) { }

  ngOnInit(): void {
    this.centerId = this.route.snapshot.params['centerId'];
    const date = new Date();
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    this.today = `${year}/${month}/${day}`;

    this.fetchAllTarget();

  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const statusDropdownElement = document.querySelector('.custom-status-dropdown-container');
    const statusDropdownClickedInside = statusDropdownElement?.contains(event.target as Node);

    if (!statusDropdownClickedInside && this.isStatusDropdownOpen) {
      this.isStatusDropdownOpen = false;
    }

  }

  fetchAllTarget(centerId: number = this.centerId, page: number = 1, limit: number = this.itemsPerPage, status: string = this.selectStatus, search: string = this.searchText) {
    this.isLoading = true;
    console.log('fetching')
    console.log(this.hasData);
    this.collectionCenterSrv.getAllCenterDailyTarget(centerId, page, limit, status, search).subscribe(
      (res) => {
        this.targetArr = res.items;
        console.log(res.items)
        if (res.items.length > 0) {
          this.hasData = true;
          console.log('fetched')
          console.log(this.hasData);
        } else {
          this.hasData = false;
        }
        this.isLoading = false;

      }
    );
  }

  onSearch() {
    if (this.searchText) {
      this.searchText = this.searchText.trimStart();
    }
    this.fetchAllTarget();
  }
  offSearch() {
    this.searchText = '';
    this.fetchAllTarget()
  }

  filterStatus() {
    this.fetchAllTarget();
  }

  // cancelStatus() {
  //   this.selectStatus = '';
  //   this.fetchAllTarget();
  // }

  cancelStatus(event?: MouseEvent) {
    if (event) {
      event.stopPropagation(); // Prevent triggering the dropdown toggle
    }
    this.selectStatus = '';
    this.fetchAllTarget();
  }


  getTimeRemaining(toDate: string, toTime: string): string {
    // Split date into parts and create a Date object in YYYY-MM-DD format (which is unambiguous)
    const [day, month, year] = toDate.split('/').map(Number);
    const targetDateTime = new Date(`${year}-${month}-${day} ${toTime}`);

    const currentDate = new Date();

    // If target date is invalid or in the past, return 'Expired'
    if (isNaN(targetDateTime.getTime()) || targetDateTime < currentDate) {
      return 'Expired';
    }

    // Calculate time difference in milliseconds
    const timeDiff = targetDateTime.getTime() - currentDate.getTime();

    // Convert to days, hours, and minutes
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hoursDiff = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesDiff = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    // Only handle the first three conditions
    if (daysDiff > 0) {
      return `Expires in ${daysDiff} day${daysDiff > 1 ? 's' : ''}`;
    }
    if (hoursDiff > 0) {
      return `Expires in ${hoursDiff} hour${hoursDiff > 1 ? 's' : ''}`;
    }
    if (minutesDiff > 0) {
      return `Expires in ${minutesDiff} minute${minutesDiff > 1 ? 's' : ''}`;
    }

    // Default return 'Expired'
    return 'Expired';
  }


  cancelValidity() {
    this.selectValidity = '';
    this.fetchAllTarget();
  }


  onPageChange(event: number) {
    this.page = event;
    this.fetchAllTarget(this.page, this.itemsPerPage);

  }
  navigate(path: string) {
    this.router.navigate([path]);
  }


  navigateToAssignTarget(id: number) {
    this.router.navigate([`/target/assing-target/${id}`]);
  }

  navigateToEditAssignTarget(id: number) {
    this.router.navigate([`/target/edit-assing-target/${id}`]);
  }

  formatTime(time: string): string {
    const [hoursStr, minutesStr] = time.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr; // use as is, assuming it's already 2-digit
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // convert '0' to 12 for midnight and adjust hours >12
    return `${hours}:${minutes} ${period}`;
  }

  navigateToCenters() {
    this.router.navigate(['/centers']); // Change '/reports' to your desired route
  }

  downloadTemplate1() {
    this.isDownloading = true;

    this.collectionCenterSrv.downloadCurrentTargetReport(this.centerId, this.selectStatus, this.searchText).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `Current Centre Target Report For ${this.today}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);
          Swal.fire({
            icon: "success",
            title: "Downloaded",
            text: "Please check your downloads folder",
            customClass: {
              popup: 'bg-white dark:bg-[#363636]', // Light mode: white, Dark mode: gray-800
              title: 'text-gray-800 dark:text-textDark', // Title text (dark: almost white)
              htmlContainer: 'text-gray-600 dark:text-white', // Body text (dark: light gray)
            }
          });

          this.isDownloading = false;
        },
        error: (error) => {
          Swal.fire({
            icon: "error",
            title: "Download Failed",
            text: error.message,
          });
          this.isDownloading = false;
        }
      });
  }

}


class DailyTargets {
  id!: number;
  cropNameEnglish!: string;
  varietyNameEnglish!: string;
  target!: number;
  grade!: string;
  complete!: number;
  status!: string;
  date!: Date;
  regCode!: string;
}
