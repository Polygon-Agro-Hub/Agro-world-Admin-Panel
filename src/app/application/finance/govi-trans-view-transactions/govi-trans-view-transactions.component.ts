import { CommonModule, Location } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { StakeholderService } from '../../../services/stakeholder/stakeholder.service';
import { CalendarModule } from 'primeng/calendar';
import { FinanceService } from '../../../services/finance/finance.service';

interface Transactions {
  id: number;
  transactionId: string;
  driverId: string;
  name: string;
  phoneNumber: string;
  status: string;
  amount: number;
  document: string;
  submittedAt: Date;
  updatedBy: string;
  updatedAt: Date;
}

@Component({
  selector: 'app-govi-trans-view-transactions',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    HttpClientModule,
    NgxPaginationModule,
    FormsModule,
    LoadingSpinnerComponent,
    CalendarModule
  ],
  templateUrl: './govi-trans-view-transactions.component.html',
  styleUrl: './govi-trans-view-transactions.component.css'
})
export class GoviTransViewTransactionsComponent implements OnInit {

  transactions: Transactions[] = [];

  searchItem: string = '';
  page: number = 1;
  itemsPerPage: number = 10;
  isLoading = true;
  totalItems: number = 5;
  hasData: boolean = true;
  centerId!: number;

  selectedStatus: string = '';
  date: Date = new Date();

  id!: number;
  name!: string;

  text: string = '';
  mobileNumber: string = '';

  showDeleteModal = false;
  textAreaTouched: boolean = false;

  StatusOptions = [
    { label: 'To Review', value: 'To Review' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Approved', value: 'Approved' },
  ];

  constructor(
    private router: Router,
    private collectionService: CollectionCenterService,
    public tokenService: TokenService,
    public permissionService: PermissionService,
    private location: Location,
    private route: ActivatedRoute,
    private financeSrv: FinanceService,
  ) {}

  ngOnInit(): void {
   this.getAllTransactions();
  }

  getAllTransactions(
    page: number = this.page,
    limit: number = this.itemsPerPage,
    status: string = this.selectedStatus,
    date: Date = this.date,
    searchItem: string = this.searchItem,
  ) {
    this.isLoading = true;
    this.financeSrv
      .fetchAllTransactions(page, limit, status, this.formatDate(date), searchItem)
      .subscribe(
        (response) => {
          this.isLoading = false;
          this.transactions = response.results;
          this.hasData = this.transactions.length > 0;
          this.totalItems = response.total;
        },
        (error) => {
          if (error.status === 401) {
          }
        },
      );
  }

  onTextareaClick() {
    this.textAreaTouched = true;
  }


  openImageInNewTab(imageUrl: string): void {
    if (imageUrl.startsWith('data:')) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
              <html>
                <head><title>Image Preview</title></head>
                <body style="margin:0">
                  <img src="${imageUrl}" style="width:100%; height:100%" />
                </body>
              </html>
            `);
        newWindow.document.close();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Popup Blocked',
          text: 'Please allow popups for this site to view the image.',
        });
      }
    } else if (imageUrl.startsWith('http')) {
      window.open(imageUrl, '_blank');
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Image URL',
        text: 'Image URL is not valid. Cannot open in new tab.',
      });
    }
  }


  onPageChange(event: number) {
    this.page = event;
    this.getAllTransactions();
  }

  searchPlantCareUsers() {
    this.searchItem = this.searchItem?.trim() || '';
    this.page = 1;
    this.getAllTransactions();
  }

  clearSearch(): void {
    this.searchItem = '';
    this.getAllTransactions();
  }


  back(): void {
    this.location.back();
  }

  StatusFilter() {
    this.getAllTransactions();
  }

  bussinessTypeFilter() {
    this.getAllTransactions();
  }

    navigateEdit(id: number) {
    this.router.navigate([`/govi-shop/action/update-govi-shop/${id}`]);

      this.router.navigate([
        `/steckholders/action/govi-shop-suppliers/update-govi-shop/${id}`,
      ]);

  }

  previewGoViShop(id: number) {
    
      this.router.navigate([
        `/steckholders/action/govi-shop-suppliers/preview-govi-shop/${id}`,
      ]);
  }

  dateFilter() {
    this.getAllTransactions();
  }

  navigateToAmount(id: number) {
    const urlTree = this.router.createUrlTree([
      `/finance/action/govi-trans-finance/view-transactions/amount/${id}`
    ]);

    const relativeUrl = this.router.serializeUrl(urlTree);
    const fullUrl = this.location.prepareExternalUrl(relativeUrl);
    window.open(fullUrl, '_blank');
  }

  navigateToDocument(id: number) {
    this.router.navigate([
    `/finance/action/govi-trans-finance/view-transactions/document/${id}`,
    ]);
  }

  onDateClear() {
    this.date = new Date();
    this.getAllTransactions();
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

class CenterName {
  id!: number;
  centerName!: string;
  officerCount!: number;
}
