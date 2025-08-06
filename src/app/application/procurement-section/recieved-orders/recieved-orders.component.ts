// import { CommonModule } from '@angular/common';
// import { HttpClientModule } from '@angular/common/http';
// import { Component } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { NgxPaginationModule } from 'ngx-pagination';
// import { DropdownModule } from 'primeng/dropdown';
// import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
// import { ProcumentsService } from '../../../services/procuments/procuments.service';
// import { Router } from '@angular/router';
// import { TokenService } from '../../../services/token/services/token.service';
// import { PermissionService } from '../../../services/roles-permission/permission.service';
// import Swal from 'sweetalert2';
// import { DatePipe } from '@angular/common';
// import { environment } from '../../../environment/environment';

// interface PurchaseReport {
//   id: number;
//   varietyNameEnglish: string;
//   cropNameEnglish: string;
//   quantity: number;
//   OrderDate: string;
//   sheduleDate: Date;
//   toCollectionCentre: Date;
//   toDispatchCenter: Date;

//   // orderDateFormatted?: string;
//   // scheduleDateFormatted?: string;
//   // toCollectionCenterFormatted: string;
//   // toDispatchCenterFormatted: string;
//   createdAt: Date;
// }

// @Component({
//   selector: 'app-recieved-orders',
//   standalone: true,
//   imports: [
//     CommonModule,
//     HttpClientModule,
//     NgxPaginationModule,
//     DropdownModule,
//     FormsModule,
//     LoadingSpinnerComponent,
//     DatePipe,
//   ],
//   templateUrl: './recieved-orders.component.html',
//   styleUrl: './recieved-orders.component.css',
// })
// export class RecievedOrdersComponent {
//   search: string = '';
//   isLoading = false;
//   page: number = 1;
//   totalItems: number = 0;
//   itemsPerPage: number = 10;
//   purchaseReport: PurchaseReport[] = [];
//   filterType: string = '';
//   date: string = '';
//   isDownloading = false;

//   constructor(
//     private procumentService: ProcumentsService,
//     private router: Router,
//     public tokenService: TokenService,
//     public permissionService: PermissionService
//   ) {}

//   ngOnInit() {
//     // this.fetchAllPurchaseReport(this.page, this.itemsPerPage);
//     this.fetchAllPurchaseReport();
//     // const today = new Date();
//     // this.maxDate = today.toISOString().split('T')[0];
//   }

//   fetchAllPurchaseReport(page: number = 1, limit: number = this.itemsPerPage) {
//     this.isLoading = true;

//     this.procumentService
//       .getRecievedOrdersQuantity(
//         page,
//         limit,
//         this.filterType,
//         this.date,
//         this.search
//       )
//       .subscribe(
//         (response) => {
//           this.purchaseReport = response.items.map(
//             (item: {
//               OrderDate: string;
//               scheduleDate: string;
//               toCollectionCenter: string;
//               toDispatchCenter: string;
//             }) => {
//               return {
//                 ...item,
//                 orderDateFormatted: this.formatDate(item.OrderDate),
//                 scheduleDateFormatted: this.formatDate(item.scheduleDate),
//                 toCollectionCenterFormatted: this.formatDate(
//                   item.toCollectionCenter
//                 ),
//                 toDispatchCenterFormatted: this.formatDate(
//                   item.toDispatchCenter
//                 ),
//               };
//             }
//           );
//           this.totalItems = response.total;
//           console.log(this.purchaseReport);
//           // this.purchaseReport.forEach((head) => {
//           //   head.createdAtFormatted = this.datePipe.transform(head.createdAt, 'yyyy/MM/dd \'at\' hh.mm a');
//           // });
//           this.isLoading = false;
//         },
//         (error) => {
//           console.error('Error fetching ongoing cultivations:', error);
//           if (error.status === 401) {
//           }
//           this.isLoading = false;
//         }
//       );
//   }

// //   fetchAllPurchaseReport(page: number = 1, limit: number = this.itemsPerPage) {
// //   this.isLoading = true;

// //   this.procumentService
// //     .getRecievedOrdersQuantity(page, limit, this.filterType, this.date, this.search)
// //     .subscribe(
// //       (response) => {
// //         // Step 1: format dates and prepare data
// //         const formattedItems = response.items.map((item: any) => ({
// //           ...item,
// //           orderDateFormatted: this.formatDate(item.OrderDate),
// //           scheduleDateFormatted: this.formatDate(item.scheduleDate),
// //           toCollectionCenterFormatted: this.formatDate(item.toCollectionCenter),
// //           toDispatchCenterFormatted: this.formatDate(item.toDispatchCenter),
// //         }));

// //         // Step 2: group by cropNameEnglish + varietyNameEnglish + OrderDate + scheduleDate
// //         const groupedMap = new Map<string, PurchaseReport>();

// //         formattedItems.forEach((item: any) => {
// //           // Create a unique key for grouping
// //           const key = `${item.cropNameEnglish}|${item.varietyNameEnglish}|${item.OrderDate}|${item.scheduleDate}`;

// //           if (groupedMap.has(key)) {
// //             // If group exists, sum the quantity
// //             const existing = groupedMap.get(key)!;
// //             existing.quantity += item.quantity;
// //           } else {
// //             // Otherwise, add new group entry
// //             groupedMap.set(key, { ...item });
// //           }
// //         });

// //         // Convert grouped map back to array
// //         this.purchaseReport = Array.from(groupedMap.values());

// //         this.totalItems = response.total; // might want to adjust this if necessary
// //         this.isLoading = false;
// //       },
// //       (error) => {
// //         console.error('Error fetching ongoing cultivations:', error);
// //         this.isLoading = false;
// //       }
// //     );
// // }


//   private formatDate(dateString: string): string {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     return new DatePipe('en-US').transform(date, 'd MMM, yyyy') || '';
//   }

//   onPageChange(event: number) {
//     this.page = event;
//     this.fetchAllPurchaseReport(this.page, this.itemsPerPage);
//   }

//   clearSearch(): void {
//     this.search = '';
//     this.fetchAllPurchaseReport();
//   }

//   clearFilter(): void {
//     this.filterType = '';
//     this.date = '';
//     this.fetchAllPurchaseReport();
//   }

// applysearch() {
//   if (!this.search || this.search.trimStart() === '') {
//     console.warn('Search is empty or starts only with space(s)');
//     return;
//   }

//   this.search = this.search.trimStart(); // Remove leading spaces
//   this.fetchAllPurchaseReport();
// }



//   back(): void {
//     this.router.navigate(['/procurement']);
//   }

// showFilterDialog() {
//   const isDarkMode = document.body.classList.contains('dark'); // adjust this if using another method

//   const dateInputHtml = `
//   <input
//     type="date"
//     id="filterDateInput"
//     class="w-full p-2 border rounded"
//     style="${isDarkMode
//       ? 'background-color: #1f2937; color: #f9fafb; border-color: #4b5563;'
//       : 'background-color: #ffffff; color: #000000; border-color: #d1d5db;'}"
//   >
// `;
//   const dialog = Swal.fire({
//     title: 'Select Filter',
//     html: `
//       <div style="text-align: left; ${isDarkMode ? 'color: #f0f0f0;' : ''}">
//         <div class="mb-4">
//           <label class="${isDarkMode ? 'text-gray-300' : 'text-gray-700'} block mb-2">Filter By</label>
//           <select id="filterTypeSelect" class="w-full p-2 border rounded ${isDarkMode ? 'bg-gray-800 text-white border-gray-600' : ''}">
//             <option value="">--Filter By--</option>
//             <option value="ScheduleDate">Scheduled Date</option>
//             <option value="toCollectionCenter">To Collection Centre</option>
//             <option value="toDispatchCenter">To Dispatch Centre</option>
//           </select>
//         </div>
//          <div>
//     <label class="${isDarkMode ? 'text-gray-300' : 'text-gray-700'} block mb-2">Select Date</label>
// <input
//   type="date"
//   id="filterDateInput"
//   class="w-full p-2 border rounded
//     ${isDarkMode 
//       ? 'bg-gray-800 text-white border-gray-600' 
//       : 'bg-white text-black border-gray-300'}"
// />

//       </div>
//     `,
//     background: isDarkMode ? '#1e1e2f' : '#fff',
//     color: isDarkMode ? '#f0f0f0' : '#000',
//     showCancelButton: true,
//     confirmButtonText: 'Filter',
//     cancelButtonText: 'Cancel',
//     buttonsStyling: false,
//     customClass: {
//       cancelButton: `${isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-800'} font-medium py-2 px-5 rounded-md text-lg mx-2`,
//       confirmButton: 'bg-[#3980C0] text-white font-medium py-2 px-5 rounded-md text-lg mx-2',
//     },
//     didOpen: () => {
//       const filterTypeSelect = document.getElementById('filterTypeSelect') as HTMLSelectElement;
//       const filterDateInput = document.getElementById('filterDateInput') as HTMLInputElement;
//       const confirmButton = Swal.getConfirmButton();

//       if (confirmButton) confirmButton.disabled = true;

//       const validateInputs = () => {
//         if (confirmButton) {
//           confirmButton.disabled = !(filterTypeSelect.value && filterDateInput.value);
//         }
//       };

//       filterTypeSelect.addEventListener('change', validateInputs);
//       filterDateInput.addEventListener('input', validateInputs);
//     },
//     preConfirm: () => {
//       const filterType = (document.getElementById('filterTypeSelect') as HTMLSelectElement).value;
//       const date = (document.getElementById('filterDateInput') as HTMLInputElement).value;

//       if (!filterType || !date) {
//         Swal.showValidationMessage('Please select both filter type and date');
//         return false;
//       }

//       return { filterType, date };
//     },
//   }).then((result) => {
//     if (result.isConfirmed && result.value) {
//       this.filterType = result.value.filterType;
//       this.date = result.value.date;
//       this.fetchAllPurchaseReport();
//     }
//   });
// }


//   downloadTemplate1() {
//     this.isDownloading = true;

//     // Prepare query parameters
//     let queryParams = [];

//     if (this.filterType) {
//       queryParams.push(`filterType=${this.filterType}`);
//     }

//     if (this.date) {
//       queryParams.push(`date=${this.date}`);
//     }

//     if (this.search) {
//       queryParams.push(`search=${this.search}`);
//     }

//     const queryString =
//       queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

//     console.log('filterType', this.filterType, 'date', this.date, 'search', this.search)

//     const apiUrl = `${environment.API_URL}procument/download-order-quantity-report${queryString}`;

//     // Trigger the download
//     fetch(apiUrl, {
//       method: 'GET',
//     })
//       .then((response) => {
//         if (response.ok) {
//           return response.blob();
//         } else {
//           throw new Error('Failed to download the file');
//         }
//       })
//       .then((blob) => {
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;

//         // Create a meaningful filename
//         let filename = 'Procument_Items_Report';
//         if (this.filterType) {
//           filename += `_${this.filterType}`;
//         }
//         if (this.date) {
//           filename += `_${this.date}`;
//         }

//         filename += '.xlsx';

//         a.download = filename;
//         a.click();
//         window.URL.revokeObjectURL(url);

//         Swal.fire({
//           icon: 'success',
//           title: 'Downloaded',
//           text: 'Please check your downloads folder',
//         });
//         this.isDownloading = false;
//       })
//       .catch((error) => {
//         Swal.fire({
//           icon: 'error',
//           title: 'Download Failed',
//           text: error.message,
//         });
//         this.isDownloading = false;
//       });
//   }
// }

import { CommonModule, DatePipe, formatDate } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { ProcumentsService } from '../../../services/procuments/procuments.service';
import { Router } from '@angular/router';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import Swal from 'sweetalert2';
import { environment } from '../../../environment/environment';
import { CalendarModule } from 'primeng/calendar';

interface PurchaseReport {
  id: number;
  varietyNameEnglish: string;
  cropNameEnglish: string;
  quantity: number;
  OrderDate: string;
  sheduleDate: Date;
  toCollectionCentre: Date;
  toDispatchCenter: Date;
  createdAt: Date;
}

@Component({
  selector: 'app-recieved-orders',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    NgxPaginationModule,
    DropdownModule,
    FormsModule,
    LoadingSpinnerComponent,
    DatePipe,
    CalendarModule,
  ],
  templateUrl: './recieved-orders.component.html',
  styleUrl: './recieved-orders.component.css',
})
export class RecievedOrdersComponent {
  search: string = '';
  isLoading = false;
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  purchaseReport: PurchaseReport[] = [];
  filterType: string = '';
  date: string = ''; // will hold formatted date string like 'yyyy-MM-dd'
  isDownloading = false;
filterApplied = false;
  // For popup filter UI
  showFilterPopup = false;
  filterTypeTemp = '';
  dateTemp: Date | null = null; // <-- Use Date object here

  constructor(
    private procumentService: ProcumentsService,
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) {}

  ngOnInit() {
    this.fetchAllPurchaseReport();
  }

  fetchAllPurchaseReport(page: number = 1, limit: number = this.itemsPerPage) {
    this.isLoading = true;

    this.procumentService
      .getRecievedOrdersQuantity(page, limit, this.filterType, this.date, this.search)
      .subscribe(
        (response) => {
          this.purchaseReport = response.items.map((item: any) => ({
            ...item,
            orderDateFormatted: this.formatDate(item.OrderDate),
            scheduleDateFormatted: this.formatDate(item.scheduleDate),
            toCollectionCenterFormatted: this.formatDate(item.toCollectionCenter),
            toDispatchCenterFormatted: this.formatDate(item.toDispatchCenter),
          }));
          this.totalItems = response.total;
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching ongoing cultivations:', error);
          this.isLoading = false;
        }
      );
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new DatePipe('en-US').transform(date, 'd MMM, yyyy') || '';
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllPurchaseReport(this.page, this.itemsPerPage);
  }

  clearSearch(): void {
    this.search = '';
    this.fetchAllPurchaseReport();
  }

  clearFilter(): void {
    this.filterType = '';
    this.date = '';
    this.fetchAllPurchaseReport();
  }

  applysearch() {
    if (!this.search || this.search.trimStart() === '') {
      console.warn('Search is empty or starts only with space(s)');
      return;
    }

    this.search = this.search.trimStart(); // Remove leading spaces
    this.fetchAllPurchaseReport();
  }

  back(): void {
    this.router.navigate(['/procurement']);
  }

  // Popup filter methods
  toggleFilterPopup() {
    this.showFilterPopup = !this.showFilterPopup;
    if (this.showFilterPopup) {
      this.filterTypeTemp = this.filterType;

      // Convert string date to Date object for p-calendar
      this.dateTemp = this.date ? new Date(this.date) : null;
    }
  }

applyFilter() {
  if (!this.dateTemp) {
    Swal.fire('Error', 'Please select a date', 'error');
    return;
  }

  // You no longer need filterTypeTemp
  this.filterType = 'ScheduleDate';

  // Convert Date object to string in yyyy-MM-dd format for API
  this.date = formatDate(this.dateTemp, 'yyyy-MM-dd', 'en-US');

  this.showFilterPopup = false;
  this.filterApplied = true; // Add this to hide the Filter By button
  this.fetchAllPurchaseReport();
}

 cancelFilter() {
  this.showFilterPopup = false;
  this.filterApplied = false;
  this.dateTemp = null; // Optional: clear date input
}


  downloadTemplate1() {
    this.isDownloading = true;

    let queryParams = [];

    if (this.filterType) {
      queryParams.push(`filterType=${this.filterType}`);
    }

    if (this.date) {
      queryParams.push(`date=${this.date}`);
    }

    if (this.search) {
      queryParams.push(`search=${this.search}`);
    }

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

    const apiUrl = `${environment.API_URL}procument/download-order-quantity-report${queryString}`;

    fetch(apiUrl, {
      method: 'GET',
    })
      .then((response) => {
        if (response.ok) {
          return response.blob();
        } else {
          throw new Error('Failed to download the file');
        }
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        let filename = 'Procument_Items_Report';
        if (this.filterType) {
          filename += `_${this.filterType}`;
        }
        if (this.date) {
          filename += `_${this.date}`;
        }

        filename += '.xlsx';

        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);

        Swal.fire({
          icon: 'success',
          title: 'Downloaded',
          text: 'Please check your downloads folder',
        });
        this.isDownloading = false;
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Download Failed',
          text: error.message,
        });
        this.isDownloading = false;
      });
  }
}

