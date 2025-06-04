import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DistributionHubService } from '../../../services/distribution-hub/distribution-hub.service';

@Component({
  selector: 'app-distribution-view-company',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
    FormsModule,
  ],
  templateUrl: './distribution-view-company.component.html',
  styleUrl: './distribution-view-company.component.css',
  providers: [DatePipe],
})
export class DistributionViewCompanyComponent implements OnInit {
  companyId: number | null = null;
  companyName: string | null = null;
  distributionCompanyHeads: DistributionCompanyHead[] = [];

  isLoading = false;

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  hasData: boolean = true;
  searchText: string = '';
  isPopupVisible = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    private distributionHubService: DistributionHubService
  ) {}

  add(): void {
    this.router.navigate(['/distribution-hub/action/add-distribution-officer']);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.companyId = params['id'] ? +params['id'] : null;
      this.companyName = params['companyName'] ? params['companyName'] : null;
    });
    this.fetchAllCompanyHeads();
  }

  fetchAllCompanyHeads(
    companyId: number = this.companyId!,
    page: number = 1,
    limit: number = this.itemsPerPage,
    search: string = this.searchText
  ) {
    this.isLoading = true;
    this.distributionHubService
      .getAllDistributionCompanyHeads(companyId, page, limit, search)
      .subscribe(
        (data) => {
          this.isLoading = false;
          this.distributionCompanyHeads = data.item;
          this.distributionCompanyHeads.forEach((head) => {
            head.createdAtFormatted = this.datePipe.transform(
              head.createdAt,
              "yyyy/MM/dd 'at' hh.mm a"
            );
          });
          this.hasData = this.distributionCompanyHeads.length > 0;
          this.totalItems = data.totalItems;
        },
        (error) => {
          if (error.status === 401) {
            this.isLoading = false;
          }
        }
      );
  }

  onSearch() {
    this.fetchAllCompanyHeads(
      this.companyId!,
      this.page,
      this.itemsPerPage,
      this.searchText
    );
  }

  offSearch() {
    this.searchText = '';
    this.fetchAllCompanyHeads(
      this.companyId!,
      this.page,
      this.itemsPerPage,
      this.searchText
    );
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllCompanyHeads(
      this.companyId!,
      this.page,
      this.itemsPerPage,
      this.searchText
    );
  }
}

class DistributionCompanyHead {
  id!: number;
  empId!: string;
  firstNameEnglish!: string;
  lastNameEnglish!: string;
  email!: string;
  phoneCode01!: string;
  phoneNumber01!: string;
  phoneCode02!: string;
  phoneNumber02!: string;
  createdAt!: Date;
  status!: string;
  createdAtFormatted!: string | null;
}
