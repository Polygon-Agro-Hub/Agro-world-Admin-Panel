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
  packageName:string;
  packagePrice: string;
  additionalPrice: string;
  scheduleDate: string;
  fullSubTotal: string;
  totalPrice: string;
  packageStatus: string;


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
  selectedStatus : any = '';
  date: string = '';
  itemsPerPage: number = 10;
  premadePackages: PremadePackages[] = [];
  selectdPackage: SelectdPackage[] = [];
  totalItems: number = 0;
  page: number = 1;
  isPremade = true;


  totalItemssl: number = 0;
  pagesl: number = 1;
  statussl = ['Pending', 'Completed', 'Opened'];
  selectedStatussl : any = '';
  datesl: string = '';
  itemsPerPagesl: number = 10;
  searchsl: string = '';
  


constructor(
  private dispatchService: DispatchService,
  private router: Router,
  public tokenService: TokenService,
  public permissionService: PermissionService,
) {}


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

}
