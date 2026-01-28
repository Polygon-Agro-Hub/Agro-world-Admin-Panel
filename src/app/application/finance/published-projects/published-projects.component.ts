import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { SalesDashService } from '../../../services/sales-dash/sales-dash.service';
import { finalize } from 'rxjs';
import { FinalinvoiceService } from '../../../services/invoice/finalinvoice.service';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { FinanceService } from '../../../services/finance/finance.service';

@Component({
  selector: 'app-published-projects',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
    FormsModule,
    DropdownModule,
    CalendarModule,
  ],
  templateUrl: './published-projects.component.html',
  styleUrl: './published-projects.component.css'
})
export class PublishedProjectsComponent implements OnInit {
  publishedProjectsArr: PublishedProjects[] = [];
  itemDetailsToViewObj: Partial<PublishedProjects> = {};
  isLoading = false;
  isPopupVisible = false;
  totalItems: number = 0;
  hasData: boolean = true;
  searchText: string = '';
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private finalInvoiceService: FinalinvoiceService,
    private financeSrv: FinanceService,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) {}

  ngOnInit() {
    this.fetchAllPublishedProjects();
  }

  fetchAllPublishedProjects(
    search: string = this.searchText
  ) {
    this.isLoading = true;
    this.financeSrv
      .getAllPublishedProjects(
        search
      )
      .subscribe(
        (res) => {
          console.log(res);
          this.isLoading = false;
          this.publishedProjectsArr = res.items;

          this.hasData = this.publishedProjectsArr.length > 0;
          this.totalItems = this.publishedProjectsArr.length | 0;
          console.log(this.publishedProjectsArr);
          console.log('tot items', this.totalItems);
        },
        (error) => {
          console.error('Error fetch news:', error);
          if (error.status === 401) {
            this.isLoading = false;
          }
        }
      );
  }

  onSearch() {
    this.searchText = this.searchText?.trim() || ''
    this.fetchAllPublishedProjects(
      this.searchText
    );
  }

  offSearch() {
    this.searchText = '';
    this.fetchAllPublishedProjects(
      this.searchText
    );
  }

  Back(): void {
    window.history.back();
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  viewNicFront(url: string) {
    // Open the image in a new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  viewNicBack(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  viewDetails(item: PublishedProjects) {
    this.isPopupVisible = true;
    this.itemDetailsToViewObj = item
    console.log('itemDetailsToViewArr', this.itemDetailsToViewObj)
  }

  closePopUp() {
    this.isPopupVisible = false;
  }

  // Calculate total extent in Acres
  calculateExtentInAcres(extentAc: number = 0, extentHa: number = 0, extentP: number = 0): string {
    const hectaresToAcres = extentHa * 2.471;
    const perchesToAcres = extentP * 0.00625;
    const totalAcres = extentAc + hectaresToAcres + perchesToAcres;
    
    return totalAcres.toFixed(2);
  }

  // Calculate progress percentage based on shares sold vs defined shares
  calculateProgress(sharesSold: number = 0, defineShares: number = 0): number {
    if (defineShares === 0) {
      return 0; 
    }
    const progress = (sharesSold / defineShares) * 100;
    return Math.round(progress); 
  }

  
}

class PublishedProjects {
  id!: number;
  firstName!: string;
  lastName!: string;
  phoneNumber!: string;
  varietyNameEnglish!: number;
  cropNameEnglish!: number;
  farmerNic!: string;
  assignDate!: Date;
  assignedBy!: number;
  jobId!: string;
  publishStatus!: string;
  reqStatus!: string;
  nicFront!: string;
  nicBack!: string;
  extentha!: number;  
  extentac!: number;  
  extentp!: number;   
  expectedYield!: number;
  startDate!: Date;
  investment!: number;
  srtName!: string;
  publishDate!: Date;
  publishedBy!: string;
  defineShares!: number;  
  shares!: number;        
}