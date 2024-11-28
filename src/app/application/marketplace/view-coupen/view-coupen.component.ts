import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-coupen',
  standalone: true,
  imports: [
    CommonModule,
    NgxPaginationModule,
    DropdownModule,
    FormsModule,
    CalendarModule,
    LoadingSpinnerComponent
  ],
  providers: [DatePipe],
  templateUrl: './view-coupen.component.html',
  styleUrl: './view-coupen.component.css'
})
export class ViewCoupenComponent implements OnInit {
  isLoading = true;
  coupenObj!: Coupen[];
  hasData: boolean = true;
  checkDelete: boolean = false;

  selectedStatus: any | null = null;
  selectedType: any | null = null;
  searchText: string | null = null;

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;

  Status = [
    {name:"Enabled"},
    {name:"Finished"},
    {name:"Disabled"}
  ]

  Types = [
    {name:"Percentage"},
    {name:"Fixed Amount"},
    {name:"Free Delivery"}
  ]


  constructor(private marketSrv: MarketPlaceService) {

  }

  ngOnInit(): void {
    this.fetchAllCoupon()
  }

  fetchAllCoupon(page: number = 1, limit: number = this.itemsPerPage) {
    const status = this.selectedStatus?.name || ''
    const types = this.selectedType?.name || ''
    const search = this.searchText || ''
    this.marketSrv.getAllCoupen(page, limit, status, types, search).subscribe(
      (res) => {
        // console.log(res);
        
        if (res.items.length > 0) {
          this.hasData = false
        }
        this.coupenObj = res.items;
        this.totalItems = res.total;
        this.isLoading = false;
      }
    )


  }

  searchCode() {
    this.fetchAllCoupon(this.page, this.itemsPerPage);
  }

  clearSearch() {
    this.searchText = '';
    this.fetchAllCoupon(this.page, this.itemsPerPage);

  }


  onPageChange(event: number) {
    this.page = event;
    this.fetchAllCoupon(this.page, this.itemsPerPage);
  }

  applyFilterStatus(){
    this.fetchAllCoupon(this.page, this.itemsPerPage);
  }

  applyFilterType(){
    this.fetchAllCoupon(this.page, this.itemsPerPage);
  }


  deleteCoupon(id:number){
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this Coupon? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("deeteID:",id);
        
        this.marketSrv.deleteCoupenById(id)
          .subscribe(
            (data: boolean) => {
              if(data){
                Swal.fire(
                  'Deleted!',
                  'The Coupen has been deleted.',
                  'success'
                  
                );
                this.fetchAllCoupon(this.page, this.itemsPerPage);
              }else{
                Swal.fire(
                  'Failed!',
                  'The coupon could not be deleted. Please try again later.',
                  'error'
                );
                
              }
             
            },
            (error:any) => {
              console.error('Error deleting crop calendar:', error);
              Swal.fire(
                'Error!',
                'There was an error deleting the crop calendar.',
                'error'
              );
            }
          );
      }
    });
  }



  deleteAllCoupon(){
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this all coupen? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.marketSrv.deleteAllCoupen()
          .subscribe(
            (data: boolean) => {
              if(data){
                Swal.fire(
                  'Deleted!',
                  'The Coupenes has been deleted.',
                  'success'
                  
                );
                this.fetchAllCoupon(this.page, this.itemsPerPage);
              }else{
                Swal.fire(
                  'Failed!',
                  'The Coupenes could not be deleted. Please try again later.',
                  'error'
                );
                
              }
             
            },
            (error:any) => {
              console.error('Error deleting crop calendar:', error);
              Swal.fire(
                'Error!',
                'There was an error deleting the crop calendar.',
                'error'
              );
            }
          );
      }
    });
  }

}

class Coupen {
  id!: number
  code!: string
  type!: string
  percentage!: number
  status!: string
  checkLimit!: string
  startDate!: string
  endDate!: string
  createdAt!: string
}
