import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
import { HttpClientModule } from '@angular/common/http';
import { CollectionService } from '../../../services/collection.service';
import { Router } from '@angular/router';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';


interface PurchaseReport {
  id: number;
  grnNumber: string;
  regCode:string;
  centerName: string;
  amount: string;
  firstName: string;
  lastName: string;
  nic: string;
}


@Component({
  selector: 'app-purchase-report',
  standalone: true,
  imports: [ CommonModule,
      HttpClientModule,
      NgxPaginationModule,
      DropdownModule,
      FormsModule,
      LoadingSpinnerComponent],
  templateUrl: './purchase-report.component.html',
  styleUrl: './purchase-report.component.css'
})
export class PurchaseReportComponent {
  isLoading = false;
  purchaseReport: PurchaseReport[] = [];
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;


    constructor(
      private collectionoOfficer: CollectionService,
      private router: Router,
      public tokenService: TokenService,
          public permissionService: PermissionService
    ) {}


    ngOnInit() {
      this.fetchAllPurchaseReport(this.page, this.itemsPerPage);
    }


    fetchAllPurchaseReport(page: number = 1, limit: number = this.itemsPerPage) {
      this.isLoading = true;
      this.collectionoOfficer
        .fetchAllPurchaseReport(page, limit)
        .subscribe(
          (response) => {
            this.purchaseReport = response.items;
            this.totalItems = response.total;
            console.log(this.purchaseReport)
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

    


  onPageChange(event: number) {
    // this.page = event;
    // this.fetchAllNews(this.page, this.itemsPerPage); // Include itemsPerPage
  }

  back(): void {
    this.router.navigate(['/reports']);
  }
}
