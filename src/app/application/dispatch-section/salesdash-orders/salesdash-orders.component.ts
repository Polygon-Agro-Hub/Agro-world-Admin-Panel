import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";
import { ProcumentsService } from '../../../services/procuments/procuments.service';
import { Router } from '@angular/router';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DropdownModule } from 'primeng/dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { DispatchService } from '../../../services/dispatch/dispatch.service';


interface PremadePackages {
  id: number;
  invoiceNum: string;
  packageName: string;
  packagePrice: string;
  additionalPrice: any;
  scheduleDate: string;
  fullSubTotal: string;
  totalPrice: string;
  packageStatus: string;
  packItemStatus: string;
  addItemStatus: string;
  orderPackageItemsId: any;


  scheduleDateFormatted?: string;

}




interface SelectdPackage {
  id: number;
  invoiceNum: string;
  totalPrice: string;
  scheduleDate: string;
  fullSubTotal: string;
  packageStatus: string;


  scheduleDateFormattedSL?: string;

}



@Component({
  selector: 'app-salesdash-orders',
  standalone: true,
  imports: [LoadingSpinnerComponent,
    CommonModule,
    HttpClientModule,
    NgxPaginationModule,
    DropdownModule,
    FormsModule,
    DatePipe
  ],
  templateUrl: './salesdash-orders.component.html',
  styleUrl: './salesdash-orders.component.css'
})
export class SalesdashOrdersComponent {
  search: string = '';
  isLoading = false;
  status = ['Pending', 'Completed', 'Opened'];
  selectedStatus: any = '';
  date: string = '';
  itemsPerPage: number = 10;
  premadePackages: PremadePackages[] = [];
  selectdPackage: SelectdPackage[] = [];
  totalItems: number = 0;
  page: number = 1;
  isPremade = true;

  orderId: number = 0;
  orderName: string = '';
  orderPrice: string = '';
  orderInv: string = '';

  totalPackageItems: number = 0;

  packedItems: PackedItems[] = [];


  totalItemssl: number = 0;
  pagesl: number = 1;
  statussl = ['Pending', 'Completed', 'Opened'];
  selectedStatussl: any = '';
  datesl: string = '';
  itemsPerPagesl: number = 10;
  searchsl: string = '';


  showPopup = false;
packItems: any[] = [];
selectedInvoice = '';
totalPrice = 0;


originalPackItems: any[] = []; // Deep copy to track original values
selectedInvoiceId: number = 0; // Used when sending save API


isUpdating: boolean = false;

showPopupAdditional = false;
packItemsAdditional: any[] = [];
selectedInvoiceAdditional = '';
totalPriceAdditional = 0;

originalPackItemsAdditional: any[] = []; // Deep copy to track original values
selectedInvoiceIdAdditional: number = 0;

  isViewPackageItemsPopupOpen: boolean = false;

  packageItemsArr: packageItems[] = [];

  constructor(
    private dispatchService: DispatchService,
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService,
  ) { }


  getPreMadePackages(page: number = 1, limit: number = this.itemsPerPage) {
    this.isLoading = true;


    this.dispatchService
      .getPreMadePackages(page, limit, this.selectedStatus, this.date, this.search)
      .subscribe(
        (response) => {
          this.premadePackages = response.items.map((item: { scheduleDate: string; }) => {
            return {
              ...item,
              scheduleDateFormatted: this.formatDate(item.scheduleDate)
            };
          });
          this.totalItems = response.total;
          console.log(this.premadePackages)
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






  getSelectedPackages(pagesl: number = 1, limitsl: number = this.itemsPerPagesl) {
    this.isLoading = true;


    this.dispatchService
      .getSelectedPackages(pagesl, limitsl, this.selectedStatussl, this.datesl, this.searchsl)
      .subscribe(
        (response) => {
          this.selectdPackage = response.items.map((item: { scheduleDate: string; }) => {
            return {
              ...item,
              scheduleDateFormattedSL: this.formatDate(item.scheduleDate)
            };
          });
          this.totalItemssl = response.total;
          console.log(this.selectdPackage)
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


  togglePackageType(isPremade: boolean) {
    this.isPremade = isPremade;
  }

  ngOnInit() {
    // this.fetchAllPurchaseReport(this.page, this.itemsPerPage);
    this.getPreMadePackages();
    this.getSelectedPackages();
    // const today = new Date();
    // this.maxDate = today.toISOString().split('T')[0];
  }


  private formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new DatePipe('en-US').transform(date, 'd MMM, yyyy') || '';
  }



  applysearch() {
    this.getPreMadePackages();

  }

  clearSearch(): void {
    this.search = '';
    this.getPreMadePackages();
  }

  onPageChange(event: number) {
    this.page = event;
    this.getPreMadePackages(this.page, this.itemsPerPage);

  }


  applyStatus() {

    this.getPreMadePackages();

  }




  // This is for selected packages

  applysearchsl() {
    this.getSelectedPackages();

  }

  clearSearchsl(): void {
    this.searchsl = '';
    this.getSelectedPackages();
  }

  onPageChangesl(event: number) {
    this.pagesl = event;
    this.getSelectedPackages(this.pagesl, this.itemsPerPagesl);

  }


  applyStatussl() {

    this.getSelectedPackages();

  }


  back(): void {
    this.router.navigate(['/procurement']);
  }




 openPopup(invoiceId: number, invoiceNum: string, total: any) {
  this.isLoading = true;
  this.selectedInvoice = invoiceNum;
  this.totalPrice = total;

  this.dispatchService.getCustomPackItems(invoiceId).subscribe({
    next: (data: any) => {
      this.originalPackItems = JSON.parse(JSON.stringify(data)); // Deep copy for comparison
      this.packItems = data; // This will be bound to the checkboxes
      this.selectedInvoiceId = invoiceId;
      this.isLoading = false;
      this.showPopup = true;
    },
    error: (err: any) => {
      console.error('Failed to fetch custom pack items:', err);
      this.isLoading = false;
    }
  });
}

  
  closePopup() {
    this.showPopup = false;
  }
  
  saveData() {
    // Implement save logic if needed
    this.closePopup();
  }


  savePackedItems() {
    this.isUpdating = true;
    const changedItems = this.packItems
      .filter((item, index) => item.isPacked !== this.originalPackItems[index].isPacked)
      .map(item => ({
        id: item.id,              // Only include the item's ID
        isPacked: item.isPacked   // And the updated isPacked status
      }));
  
    if (changedItems.length === 0) {
      console.log('No changes to save.');
      this.isUpdating = false;
      this.showPopup = false;
      return;
    }
  
    this.dispatchService.updateCustomPackItems(this.selectedInvoiceId, changedItems).subscribe({
      next: () => {
        console.log('Successfully updated packed items.');
        this.isUpdating = false;
        this.showPopup = false;
        this.getSelectedPackages();
      },
      error: (err: any) => {
        console.error('Failed to update packed items:', err);
        this.getSelectedPackages();
      }
    });
  }
  
  


  onPackItemsCheckboxChange(event: Event, index: any): void {
    const target = event.target as HTMLInputElement;
  
    if (target != null) {
      this.packItems[index].isPacked = target.checked ? 1 : 0;
    }
  }











  openPopupAdditional(id: number, invoiceNum: string, total: any) {
    this.isLoading = true;
    this.selectedInvoiceAdditional = invoiceNum;
    this.totalPriceAdditional = total;
  
    this.dispatchService.getPackageOrderDetailsById(id).subscribe({
      next: (data: any) => {
        this.originalPackItemsAdditional = JSON.parse(JSON.stringify(data)); // Deep copy for comparison
        this.packItemsAdditional = data; // This will be bound to the checkboxes
        this.selectedInvoiceIdAdditional = id;
        this.isLoading = false;
        this.showPopupAdditional = true;
      },
      error: (err: any) => {
        console.error('Failed to fetch custom pack items:', err);
        this.isLoading = false;
      }
    });
  }


  closePopupAdditional() {
    this.showPopupAdditional = false;
  }

  openViewPackageItemPopup(id: number, name: string, price: string, inv: string) {

    this.isViewPackageItemsPopupOpen = true;
    console.log(this.isViewPackageItemsPopupOpen)
    console.log(id, name, inv)
    this.orderId = id;
    this.orderPrice = price;
    this.orderName = name;
    this.orderInv = inv;


    this.fetchPackageItems(id)
  }

  fetchPackageItems(id: number) {
    this.isLoading = true;
  
    this.dispatchService.getPackageItems(id).subscribe(
      (response) => {
        console.log(response);
  
        // Add a `total` string with exactly 2 decimal places
        this.packageItemsArr = response.items.map((item: packageItems) => {
          const total = item.quantity * item.discountedPrice;
          return {
            ...item,
            total: total.toFixed(2) // Keep as string to retain 2 decimal places
          };
        });
  
        this.totalPackageItems = response.total;
        this.isLoading = false;
  
        console.log('array', this.packageItemsArr);
      },
      (error) => {
        console.error('Error fetching ongoing cultivations:', error);
        if (error.status === 401) {
          // Handle unauthorized error if needed
        }
        this.isLoading = false;
      }
    );
  }
  
  

  onCheckboxChange(item: packageItems) {
    item.isPacking = item.isPacking === 1 ? 0 : 1;
  }


  onCheckboxChangeCh(event: Event, index: any): void {
    const target = event.target as HTMLInputElement;
    console.log('hit 01');
  
    if (target != null) {
      this.packItems[index].isPacked = target.checked ? 1 : 0;
      console.log('hit 02');
    }
  }

  saveCheckedItems() {
    console.log('All items:', this.packageItemsArr);
  
    // Create PackedItems for all items, regardless of isPacking value
    this.packedItems = this.packageItemsArr.map(item => {
      const packedItem = new PackedItems();
      packedItem.id = item.packageListId;
      packedItem.isPacked = item.isPacking; // can be 0 or 1
      return packedItem;
    });
  
    console.log('Packed items:', this.packedItems);
    console.log('All items:', this.packageItemsArr);
  
    this.isViewPackageItemsPopupOpen = false;
    this.setIsPacked(this.packedItems);
  }
  
  

  setIsPacked(array: PackedItems[]) {
    this.isLoading = true;
  
    this.dispatchService
      .updateIsPacked(this.packedItems)
      .subscribe(
        (response) => {
          if (response && response.success) {
            console.log('Items updated successfully:', response.message || response);
             
          } else {
            console.log('Update failed:', response.message || 'Unknown error occurred');
          }
          this.isLoading = false;

          // window.location.reload();
          this.getPreMadePackages(this.page, this.itemsPerPage);
        },
        (error) => {
          if (error.status === 401) {
            console.log('Unauthorized access. Maybe redirect to login?');
          } else {
            console.log('An unexpected error occurred while updating items.');
          }
          this.isLoading = false;
          this.getPreMadePackages(this.page, this.itemsPerPage);
          // window.location.reload();
        }
      );
      
      this.getPreMadePackages(this.page, this.itemsPerPage);
  }












  onCheckboxChangeChAdditional(event: Event, item: any): void {
    const target = event.target as HTMLInputElement;
    if (target != null && item) {
      item.isPacked = target.checked ? 1 : 0;
    }
  }
  
  


  savePackedItemsAdditional() {
    this.isUpdating = true;
  
    const changedItems = this.packItemsAdditional
      .filter((item, index) => item.isPacked !== this.originalPackItemsAdditional?.[index]?.isPacked)
      .map(item => ({
        id: item.id,
        isPacked: item.isPacked
      }));
  
    if (changedItems.length === 0) {
      console.log('No changes to save.');
      this.isUpdating = false;
      this.showPopupAdditional = false;
      return;
    }
  
    this.dispatchService.updatePackItemsAdditional(this.selectedInvoiceId, changedItems).subscribe({
      next: () => {
        console.log('Successfully updated packed items.');
        this.isUpdating = false;
        this.showPopupAdditional = false;
        this.getSelectedPackages(); // Reload data
      },
      error: (err: any) => {
        console.error('Failed to update packed items:', err);
        this.isUpdating = false;
        this.getSelectedPackages(); // Still reload to refresh UI
      }
    });
  }
  
  

}

class PackedItems {
  id!: number;
  isPacked!: number;
}

class packageItems {
  packageListId!: number;
  orderId!: number;
  invoiceNum!: string;
  quantity!: number;
  price!: number;
  discountedPrice!: number;
  isPacking!: number;
  displayName!: string;
  total!: string;
}



