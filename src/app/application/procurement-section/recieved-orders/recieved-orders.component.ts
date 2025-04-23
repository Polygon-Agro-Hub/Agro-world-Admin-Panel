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
import { environment } from '../../../environment/environment';


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
  isDownloading = false;

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
    .getRecievedOrdersQuantity(page, limit, this.filterType, this.date, this.search)
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
  this.fetchAllPurchaseReport();

}



back(): void {
  this.router.navigate(['/procurement']);
}




showFilterDialog() {
  const dialog = Swal.fire({
    title: 'Select Filter',
    html: `
      <div style="text-align: left;">
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Filter By</label>
          <select id="filterTypeSelect" class="w-full p-2 border rounded">
            <option value="">--Filter By--</option>
            <option value="OrderDate">Order Date</option>
            <option value="scheduleDate">Scheduled Date</option>
            <option value="toCollectionCenter">To Collection Centre</option>
            <option value="toDispatchCenter">To Dispatch Centre</option>
          </select>
        </div>
        <div>
          <label class="block text-gray-700  mb-2">Select Date</label>
          <input type="date" id="filterDateInput" class="w-full p-2 border rounded ">
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Filter',
    cancelButtonText: 'Cancel',
    buttonsStyling: false,
    customClass: {
      confirmButton: 'bg-[#818AA1] text-white font-medium py-2 px-5 rounded-md text-lg mx-2',
      cancelButton: 'bg-gray-200 text-gray-800 font-medium py-2 px-5 rounded-md text-lg mx-2'
    },
    didOpen: () => {
      const filterTypeSelect = document.getElementById('filterTypeSelect') as HTMLSelectElement;
      const filterDateInput = document.getElementById('filterDateInput') as HTMLInputElement;
      const confirmButton = Swal.getConfirmButton();

      // Initially disable the confirm button
      if (confirmButton) {
        confirmButton.disabled = true;
      }

      // Add event listeners to both inputs
      const validateInputs = () => {
        if (confirmButton) {
          confirmButton.disabled = !(filterTypeSelect.value && filterDateInput.value);
        }
      };

      filterTypeSelect.addEventListener('change', validateInputs);
      filterDateInput.addEventListener('input', validateInputs);
    },
    preConfirm: () => {
      const filterType = (document.getElementById('filterTypeSelect') as HTMLSelectElement).value;
      const date = (document.getElementById('filterDateInput') as HTMLInputElement).value;
      
      if (!filterType || !date) {
        Swal.showValidationMessage('Please select both filter type and date');
        return false;
      }
      
      return { filterType, date };
    }
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      this.filterType = result.value.filterType;
      this.date = result.value.date;
      this.fetchAllPurchaseReport();
    }
  });
}




downloadTemplate1() {
        this.isDownloading = true;
        
        // Prepare query parameters
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
        
        // Trigger the download
        fetch(apiUrl, {
          method: "GET",
        })
          .then((response) => {
            if (response.ok) {
              return response.blob();
            } else {
              throw new Error("Failed to download the file");
            }
          })
          .then((blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            
            // Create a meaningful filename
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
              icon: "success",
              title: "Downloaded",
              text: "Please check your downloads folder",
            });
            this.isDownloading = false;
          })
          .catch((error) => {
            Swal.fire({
              icon: "error",
              title: "Download Failed",
              text: error.message,
            });
            this.isDownloading = false;
          });
      }


}
