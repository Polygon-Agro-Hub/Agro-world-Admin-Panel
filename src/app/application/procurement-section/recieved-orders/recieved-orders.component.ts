import { CommonModule } from '@angular/common';
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
import { DatePipe } from '@angular/common';


interface PurchaseReport {
  id: number;
  varietyNameEnglish: string;
  cropNameEnglish:string;
  TotalQuantity: string;
  OrderDate: string;
  scheduleDate: string;
  toCollectionCenter: string;
  toDispatchCenter: string;

  orderDateFormatted?: string;
  scheduleDateFormatted?: string;
  toCollectionCenterFormatted: string;
  toDispatchCenterFormatted: string;
}



@Component({
  selector: 'app-recieved-orders',
  standalone: true,
  imports: [CommonModule,
        HttpClientModule,
        NgxPaginationModule,
        DropdownModule,
        FormsModule,
        LoadingSpinnerComponent,
        DatePipe ],
  templateUrl: './recieved-orders.component.html',
  styleUrl: './recieved-orders.component.css'
})
export class RecievedOrdersComponent {
  search: string = '';
  isLoading = false;
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  purchaseReport: PurchaseReport[] = [];
  filterType: string = '';
  date: string = '';

constructor(
  private procumentService: ProcumentsService,
  private router: Router,
  public tokenService: TokenService,
  public permissionService: PermissionService,
) {}



ngOnInit() {
  // this.fetchAllPurchaseReport(this.page, this.itemsPerPage);
  this.fetchAllPurchaseReport();
  // const today = new Date();
  // this.maxDate = today.toISOString().split('T')[0];
}


fetchAllPurchaseReport(page: number = 1, limit: number = this.itemsPerPage) {
  this.isLoading = true;


  this.procumentService
    .getRecievedOrdersQuantity(page, limit, this.filterType, this.date)
    .subscribe(
      (response) => {
        this.purchaseReport = response.items.map((item: { OrderDate: string; scheduleDate: string; toCollectionCenter : string; toDispatchCenter: string }) => {
          return {
            ...item,
            orderDateFormatted: this.formatDate(item.OrderDate),
            scheduleDateFormatted: this.formatDate(item.scheduleDate),
            toCollectionCenterFormatted: this.formatDate(item.toCollectionCenter),
            toDispatchCenterFormatted: this.formatDate(item.toDispatchCenter)
          };
        });
        this.totalItems = response.total;
        console.log(this.purchaseReport)
        // this.purchaseReport.forEach((head) => {
        //   head.createdAtFormatted = this.datePipe.transform(head.createdAt, 'yyyy/MM/dd \'at\' hh.mm a');
        // });
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching ongoing cultivations:', error);
        if (error.status === 401) {
        }
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
 
}



clearSearch(): void {
  this.search = '';

}



applysearch() {

}



back(): void {
  this.router.navigate(['/procurement']);
}




showFilterDialog() {
  Swal.fire({
    title: 'Select Filter',
    html: `
      <div style="text-align: left;">
        <div class="mb-4">
          <label class="block text-gray-700 dark:text-gray-200 mb-2">Filter By</label>
          <select class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
            <option value="">--Filter By--</option>
            <option value="crop">OrderDate</option>
            <option value="variety">scheduleDate</option>
            <option value="date">toCollectionCenter</option>
          </select>
        </div>
        <div>
          <label class="block text-gray-700 dark:text-gray-200 mb-2">Select Date</label>
          <input type="date" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Filter',
    cancelButtonText: 'Cancel',
    buttonsStyling: false,
    customClass: {
      confirmButton: 'bg-[#818AA1] text-white font-medium py-2 px-5 rounded-md text-lg mx-2',
      cancelButton: 'bg-gray-200 text-gray-800 font-medium py-2 px-5 rounded-md text-lg mx-2 dark:bg-gray-600 dark:text-white'
    }
  }).then((result) => {
    if (result.isConfirmed) {
      // Handle filter logic here
      console.log('Filter applied');
    }
  });
}
}
