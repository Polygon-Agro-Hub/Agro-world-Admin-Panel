import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';

import { FormsModule } from '@angular/forms';
import { CollectionCenterService } from '../../../../services/collection-center/collection-center.service';

@Component({
  selector: 'app-view-company-head',
  standalone: true,
  imports: [HttpClientModule,
            CommonModule,
            LoadingSpinnerComponent,
            NgxPaginationModule,
            FormsModule
           ],
  templateUrl: './view-company-head.component.html',
  styleUrl: './view-company-head.component.css',
  providers: [DatePipe]
})
export class ViewCompanyHeadComponent implements OnInit{
  companyId: number | null = null;
  companyHead: CompanyHead[] = [];
  

  isLoading = false;

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  hasData: boolean = true;
  searchText: string = '';
  
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private companyService: CollectionCenterService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.companyId = params['id'] ? +params['id'] : null;
      console.log('Received item ID:', this.companyId);
      
      this.fetchAllCompanyHeads();
    });
  }

  fetchAllCompanyHeads(companyId: number = this.companyId!, page: number = 1, limit: number = this.itemsPerPage, search: string = this.searchText) {
    console.log('id', companyId); // Debug log
    
    this.isLoading = true;
    this.companyService.getAllCompanyHeads(companyId, page, limit, search).subscribe(
      (data) => {
        console.log(data);
        this.isLoading = false;
        this.companyHead = data.items;
        this.companyHead.forEach((head) => {
          head.createdAtFormatted = this.datePipe.transform(head.createdAt, 'yyyy/MM/dd \'at\' hh.mm a');
        });
        this.hasData = this.companyHead.length > 0;
        this.totalItems = data.total;
      },
      (error) => {
        console.error('Error fetch news:', error);
        if (error.status === 401) {
          this.isLoading = false;
        }
      }
    );
  }

  editCompanyHead(id: number) {
    
    this.navigatePath(`/collection-hub/edit-center-head/${id}`);
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllCompanyHeads(this.companyId!, this.page, this.itemsPerPage, this.searchText); // Include itemsPerPage
  }

  Back(): void {
    this.router.navigate(['/collection-hub/manage-company']);
  }

  // addNew(): void {
  //   this.router.navigate(['/collection-hub/create-center-head']);
  // }
  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  onSearch() {
    this.fetchAllCompanyHeads(this.companyId!, this.page, this.itemsPerPage, this.searchText);
  }

  offSearch() {
    this.searchText = '';
    this.fetchAllCompanyHeads(this.companyId!, this.page, this.itemsPerPage, this.searchText);
  }

  

  deleteCompanyHead(id: any) {
    console.log(id);
    console.log('clicked');
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this center head? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.companyService.deleteCompanyHead(id).subscribe(
          (data: any) => {
            if (data) {
              Swal.fire(
                'Deleted!',
                'The Center Head has been deleted.',
                'success'
              );
              this.fetchAllCompanyHeads();
            }
          },
          (error) => {
            console.error('Error deleting Center Head:', error);
            Swal.fire(
              'Error!',
              'There was an error deleting the Center Head.',
              'error'
            );
          }
        );
      }
    });
  }

  editCropCalender(id: number) {
    // this.router.navigate(['/plant-care/action/create-crop-calender'], {
    //   queryParams: { id },
    // });
  }

  ViewCroptask(id:number){
    // this.router.navigate([`plant-care/action/view-crop-task/${id}`])
  }

}

class CompanyHead {
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
