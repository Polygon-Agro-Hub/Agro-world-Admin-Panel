import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NgxPaginationModule } from 'ngx-pagination';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { TokenService } from '../../../services/token/services/token.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-collection-center-view-complain',
  standalone: true,
  imports: [CommonModule, DropdownModule, NgxPaginationModule, FormsModule],
  providers: [DatePipe],
  templateUrl: './collection-center-view-complain.component.html',
  styleUrl: './collection-center-view-complain.component.css',
})
export class CollectionCenterViewComplainComponent implements OnInit {

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;

  filterStatus: any = "";
  filterCategory: any = {};
  status!: Status[];
  category!: Category[];
  complainsData!: Complain[];
  searchText: string = "";
  isLoading = false;
    @ViewChild("dropdown") dropdown!: Dropdown;




   constructor(
      private complainSrv: CollectionCenterService,
      private datePipe: DatePipe,
      private router: Router,
      // private tokenService: TokenService,
      private http: HttpClient,
      public tokenService: TokenService,
    ) {}
  


    
  ngOnInit(): void {
   

    this.status = [
      { id: 1, type: "Assigned" },
      { id: 2, type: "Pending" },
      { id: 3, type: "Closed" },
    ];

    this.category = [
      { id: 1, type: "Agriculture" },
      { id: 2, type: "Finance" },
      { id: 3, type: "Call Center" },
      { id: 4, type: "Procuiment" },
    ];

    if (this.tokenService.getUserDetails().role === "2") {
      this.filterCategory.type = "Agriculture";
    } else if (this.tokenService.getUserDetails().role === "3") {
      this.filterCategory.type = "Finance";
    } else if (this.tokenService.getUserDetails().role === "4") {
      this.filterCategory.type = "Call Center";
    } else if (this.tokenService.getUserDetails().role === "5") {
      this.filterCategory.type = "Procuiment";
    }

    console.log(this.filterCategory);
    this.fetchAllComplain(this.page, this.itemsPerPage);
  }

  fetchAllComplain(page: number = 1, limit: number = this.itemsPerPage) {
    this.isLoading = true;
    this.complainSrv
      .getAllCenterComplain(
        page,
        limit,
        this.filterStatus?.type,
        this.filterCategory?.type,
        this.searchText,
      )
      .subscribe(
        (res) => {
          console.log(res.results);

          // Map response data to ensure createdAt is in a readable date format
          this.complainsData = res.results.map((item: any) => ({
            ...item,
            createdAt: this.datePipe.transform(item.createdAt, "yyyy-MM-dd"), // Convert date format
          }));
          this.totalItems = res.total;
          this.isLoading = false;
        },
        (error) => {
          console.log("Error: ", error);
          this.isLoading = false;
        },
      );
  }



  onPageChange(event: number) {
    this.page = event;
    this.fetchAllComplain(this.page, this.itemsPerPage);
  }

  applyFilters() {
    this.fetchAllComplain(this.page, this.itemsPerPage);
    if (this.dropdown) {
      this.dropdown.hide(); // Close the dropdown after selection
    }
  }

  searchComplain() {
    this.page = 1;
    this.fetchAllComplain(this.page, this.itemsPerPage);
  }

  clearSearch(): void {
    this.searchText = "";
    this.fetchAllComplain(this.page, this.itemsPerPage);
  }
}


class Complain {
  id!: string;
  refNo!: string;
  status!: string;
  empId!: string;
  companyName!: string;
  role!: string;
  complain!: string;
  complainCategory!: string;
  createdAt!: string;
  reply!: string;
  regCode!: string;
  CollectionContact!: string;
  officerName!: string;
  officerPhone!: string;
  farmerName!: string;
}

class Status {
  id!: number;
  type!: string;
}

class Category {
  id!: number;
  type!: string;
}

class ComplainIn {
  id!: string;
  refNo!: string;
  status!: string;
  empId!: string;
  compannyName!: string;
  role!: string;
  complain!: string;
  complainCategory!: string;
  createdAt!: string;
  reply!: string;
  centerName!: string;
  CollectionContact!: string;
  officerName!: string;
  officerPhone!: string;
  farmerName!: string;
}
