import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CollectionService } from '../../../services/collection.service';
import { Router } from '@angular/router';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import Swal from 'sweetalert2';

interface PurchaseReport {
  id: number;
  regCode:string;
  centerName: string;
  cropGroupName: string;
  varietyName: string;
  gradeAquan: number;
  gradeBquan: number;
  gradeCquan: number;
  amount: number;
  createdAt: string;
  createdAtFormatted: string | null;
  
}

@Component({
  selector: 'app-collection-report',
  standalone: true,
  imports: [CommonModule,
        HttpClientModule,
        NgxPaginationModule,
        DropdownModule,
        FormsModule,
        LoadingSpinnerComponent],
  templateUrl: './collection-report.component.html',
  styleUrl: './collection-report.component.css',
  providers: [DatePipe]
})
export class CollectionReportComponent {

  isLoading = false;
  fromDate: string = '';
  toDate: string = '';
  maxDate: string = '';
  itemsPerPage: number = 10;
  centers!: Centers[];
  selectedCenter: Centers | null = null;
  purchaseReport: PurchaseReport[] = [];
  totalItems: number = 0;
  search: string = '';
  page: number = 1;

     constructor(
        private collectionoOfficer: CollectionService,
        private router: Router,
        public tokenService: TokenService,
        public permissionService: PermissionService,
        private datePipe: DatePipe,
      ) {}

      ngOnInit() {
        // this.fetchAllPurchaseReport(this.page, this.itemsPerPage);
        this.getAllCenters();
        const today = new Date();
        this.maxDate = today.toISOString().split('T')[0];
      }



      fetchAllCollectionReport(page: number = 1, limit: number = this.itemsPerPage) {
        this.isLoading = true;
  
        const centerId = this.selectedCenter?.id || '';
       
  
       
  
        this.collectionoOfficer
          .fetchAllCollectionReport(page, limit, centerId, this.fromDate, this.toDate, this.search)
          .subscribe(
            (response) => {
              this.purchaseReport = response.items;
              this.totalItems = response.total;
              // this.grandTotal = response.grandTotal;
              console.log(this.purchaseReport)
              this.purchaseReport.forEach((head) => {
                head.createdAtFormatted = this.datePipe.transform(head.createdAt, 'yyyy/MM/dd \'at\' hh.mm a');
              });
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
  



    getAllCenters() {
      this.collectionoOfficer.getAllCenters().subscribe(
        (res) => {
          this.centers = res;
          console.log('Crops:', res);
        },
        (error) => {
          console.error('Error fetching crops:', error);
          Swal.fire(
            'Error!',
            'There was an error fetching crops.',
            'error'
          );
        }
      );
    }
    
    applyFiltersCrop() {
    
      this.fetchAllCollectionReport();
    }

  back(): void {
    this.router.navigate(['/reports']);
  }

  applysearch() {

    this.fetchAllCollectionReport();
  }

  clearSearch(): void {
    this.search = '';

    this.fetchAllCollectionReport();
  }
}




class Centers {
  id!: string; // Updated to match `cropGroupId`
  centerName!: string;
  regCode!: string;
}