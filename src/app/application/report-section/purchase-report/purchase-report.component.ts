import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
import { HttpClientModule } from '@angular/common/http';
import { CollectionService } from '../../../services/collection.service';
import { Router } from '@angular/router';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import Swal from 'sweetalert2';
import { environment } from '../../../environment/environment';


interface PurchaseReport {
  id: number;
  grnNumber: string;
  regCode:string;
  centerName: string;
  amount: string;
  firstName: string;
  lastName: string;
  nic: string;
  userId: number;
  collQr: string;
  createdAt: string;
  createdAtFormatted: string | null;
  
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
  styleUrl: './purchase-report.component.css',
  providers: [DatePipe]
})
export class PurchaseReportComponent {
  isLoading = false;
  purchaseReport: PurchaseReport[] = [];
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  grandTotal: number = 0;
  isDownloading = false;

  centers!: Centers[];
  months: Months[]= [
    { id: 1, monthName: 'January' },
    { id: 2, monthName: 'February' },
    { id: 3, monthName: 'March' },
    { id: 4, monthName: 'April' },
    { id: 5, monthName: 'May' },
    { id: 6, monthName: 'June' },
    { id: 7, monthName: 'July' },
    { id: 8, monthName: 'August' },
    { id: 9, monthName: 'September' },
    { id: 10, monthName: 'October' },
    { id: 11, monthName: 'November' },
    { id: 12, monthName: 'December' },
  ];
  selectedCenter: Centers | null = null;
  selectedMonth: Months | null = null;
  createdDate: string = new Date().toISOString().split("T")[0];
  search: string = '';


  
  


    constructor(
      private collectionoOfficer: CollectionService,
      private router: Router,
      public tokenService: TokenService,
      public permissionService: PermissionService,
      private datePipe: DatePipe,
    ) {}


    ngOnInit() {
      this.fetchAllPurchaseReport(this.page, this.itemsPerPage);
      this.getAllCenters();
    }


    fetchAllPurchaseReport(page: number = 1, limit: number = this.itemsPerPage) {
      this.isLoading = true;

      const centerId = this.selectedCenter?.id || '';
      const monthNumber = this.selectedMonth?.id || '';

      if (this.createdDate === "" && this.selectedMonth == null){
        this.createdDate = new Date().toISOString().split("T")[0];
      }


      this.collectionoOfficer
        .fetchAllPurchaseReport(page, limit, centerId, monthNumber, this.createdDate, this.search)
        .subscribe(
          (response) => {
            this.purchaseReport = response.items;
            this.totalItems = response.total;
            this.grandTotal = response.grandTotal;
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

    


  onPageChange(event: number) {
    this.page = event;
    this.fetchAllPurchaseReport(this.page, this.itemsPerPage); // Include itemsPerPage
  }

  back(): void {
    this.router.navigate(['/reports']);
  }


  applyFiltersCrop() {
    
    this.fetchAllPurchaseReport();
  }

  applyFiltersMonth() {
    this.createdDate = '';
    this.fetchAllPurchaseReport();
  }

  applysearch() {
    this.selectedMonth = null;
    this.createdDate = '';
    this.fetchAllPurchaseReport();
  }

  clearSearch(): void {
    this.search = '';
    this.createdDate = new Date().toISOString().split("T")[0];
    this.fetchAllPurchaseReport();
  }

    onDateChange(): void {
      this.selectedMonth = null; // Reset selected month when date changes
      // console.log(this.createdDate);
      // if (this.createdDate === "") {
      //   Swal.fire({
      //     title: "Error!",
      //     text: "Please select a date",
      //     icon: "error",
      //     confirmButtonText: "OK",
      //   }).then(() => {
      //     // Set today's date to createdDate after the user presses OK
      //     this.createdDate = new Date().toISOString().split("T")[0];
      //     // Call fetchReport after setting the date
      //     this.fetchAllPurchaseReport();
      //   });
      // } else {
      //   this.fetchAllPurchaseReport();
      // }

        
      this.fetchAllPurchaseReport();
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





        downloadTemplate1() {
          this.selectedCenter = null;
          this.selectedMonth = null;
          this.search = '';
          if (this.createdDate === "") {
            Swal.fire({
              title: "Error!",
              text: "Please select a date",
              icon: "error",
            })
            return;
          } 
    
          this.isDownloading = true;
          const apiUrl = `${environment.API_URL}auth/download-purchase-report?createdDate=${this.createdDate}`;
      
          // Trigger the download
          fetch(apiUrl, {
            method: "GET",
          })
            .then((response) => {
              if (response.ok) {
                // Create a blob for the Excel file
                return response.blob();
              } else {
                throw new Error("Failed to download the file");
              }
            })
            .then((blob) => {
              // Create a URL for the blob
              const url = window.URL.createObjectURL(blob);
      
              // Create a temporary anchor element to trigger the download
              const a = document.createElement("a");
              a.href = url;
              a.download = `Daily Collection Report (${this.createdDate}).xlsx`;
              a.click();
      
              // Revoke the URL after the download is triggered
              window.URL.revokeObjectURL(url);
      
              // Show success message
              Swal.fire({
                icon: "success",
                title: "Downloaded",
                text: "Please check your downloads folder",
              });
              this.isDownloading = false;
            })
            .catch((error) => {
              // Handle errors
              Swal.fire({
                icon: "error",
                title: "Download Failed",
                text: error.message,
              });
              this.isDownloading = false;
            });
        }



        navigateToFamerListReport(id: number, userId: number, QRcode: string) {
          this.router.navigate(['/reports/farmer-list-report'], { queryParams: { id, userId, QRcode } });
        }
}


class Centers {
  id!: string; // Updated to match `cropGroupId`
  centerName!: string;
}

interface Months {
  id: number;
  monthName: string;
}
