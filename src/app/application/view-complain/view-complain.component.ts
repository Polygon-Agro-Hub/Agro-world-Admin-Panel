import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { CollectionCenterService } from '../../services/collection-center/collection-center.service';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-view-complain',
  standalone: true,
  imports: [CommonModule, DropdownModule, NgxPaginationModule],
  templateUrl: './view-complain.component.html',
  styleUrl: './view-complain.component.css'
})
export class ViewComplainComponent implements OnInit{
  status: any[] | undefined;
  statusFilter: any;
  hasData: boolean = true;
  complainsData!:Complain[]

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;


  constructor(
    private complainSrv: CollectionCenterService
  ){}



  ngOnInit(): void {
    this.fetchAllComplain(this.page, this.itemsPerPage)
  }

  fetchAllComplain(page: number = 1, limit: number = this.itemsPerPage){
    this.complainSrv.getAllComplain(page, limit).subscribe(
      (res)=>{
        this.complainsData = res.results
        this.totalItems = res.total
        console.log(res);
        
      },
      (error)=>{
        console.log("Error: ",error)
      }
    )
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllComplain(this.page, this.itemsPerPage); // Include itemsPerPage
  }

}

class Complain {
  id!:String 
  refNo!:String 
  status!:String 
  officerName!:String 
  farmerName!:String 
  officerPhone!:String 
  farmerPhone!:String 
  complain!:String 
  language!:String 
  createdAt!:String
}
