import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-complain',
  standalone: true,
  imports: [CommonModule, DropdownModule, NgxPaginationModule, FormsModule],
  providers: [DatePipe], // Provide DatePipe for date formatting
  templateUrl: './view-complain.component.html',
  styleUrls: ['./view-complain.component.css']
})
export class ViewComplainComponent implements OnInit {
  statusFilter: any;
  hasData: boolean = true;
  complainsData!: Complain[];

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;

  filterStatus: any = '';
  status!: Status[];

  searchText: string = '';

  constructor(
    private complainSrv: CollectionCenterService,
    private datePipe: DatePipe,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.fetchAllComplain(this.page, this.itemsPerPage);
    this.status = [
      { id: 1, type: "Answered" },
      { id: 2, type: "Closed" },
      { id: 3, type: "Not Answered" },
    ];
  }

  fetchAllComplain(page: number = 1, limit: number = this.itemsPerPage) {
    this.complainSrv.getAllComplain(page, limit, this.filterStatus?.type, this.searchText).subscribe(
      (res) => {
        // Map response data to ensure createdAt is in a readable date format
        this.complainsData = res.results.map((item: any) => ({
          ...item,
          createdAt: this.datePipe.transform(item.createdAt, 'yyyy-MM-dd') // Convert date format
        }));
        this.totalItems = res.total;
      },
      (error) => {
        console.log("Error: ", error);
      }
    );
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllComplain(this.page, this.itemsPerPage);
  }

  applyFilters() {
    this.fetchAllComplain(this.page, this.itemsPerPage);
  }

  searchComplain(){
    this.page=1;
    this.fetchAllComplain(this.page, this.itemsPerPage);
  }

  clearSearch(): void {
    this.searchText = '';
    this.fetchAllComplain(this.page, this.itemsPerPage);
  }

  navigateSelectComplain(id:string){
    this.router.navigate([`/collection-hub/view-selected-complain/${id}`])
  }


}

// Define interfaces for response data
class Complain {
  id!: string;
  refNo!: string;
  status!: string;
  officerName!: string;
  farmerName!: string;
  officerPhone!: string;
  farmerPhone!: string;
  complain!: string;
  language!: string;
  createdAt!: string;
}

class Status {
  id!: number;
  type!: string;
}
