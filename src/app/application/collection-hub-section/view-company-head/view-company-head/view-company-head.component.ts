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
import { CollectionService } from '../../../../services/collection.service';

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
  companyName: string | null = null;
  companyHead: CompanyHead[] = [];
  

  isLoading = false;

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  hasData: boolean = true;
  searchText: string = '';
  isPopupVisible = false;
  
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private companyService: CollectionCenterService,
    private datePipe: DatePipe,
    private collectionService: CollectionService,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.companyId = params['id'] ? +params['id'] : null;
      this.companyName = params['companyName'] ? params['companyName'] : null; // Keep companyName as a string
      console.log('Received item ID:', this.companyId);      
    });
    this.fetchAllCompanyHeads();
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

    openPopup(item: any) {
      this.isPopupVisible = true;
  
      // HTML structure for the popup
      const tableHtml = `
        <div class="container mx-auto">
          <h1 class="text-center text-2xl font-bold mb-4">Officer Name : ${item.firstNameEnglish}</h1>
          <div >
            <p class="text-center">Are you sure you want to approve or reject this collection?</p>
          </div>
          <div class="flex justify-center mt-4">
            <button id="rejectButton" class="bg-red-500 text-white px-6 py-2 rounded-lg mr-2">Reject</button>
            <button id="approveButton" class="bg-green-500 text-white px-4 py-2 rounded-lg">Approve</button>
          </div>
        </div>
      `;
  
      Swal.fire({
        html: tableHtml,
        showConfirmButton: false, // Hide default confirm button
        width: 'auto',
        didOpen: () => {
          // Handle the "Approve" button click
          document
            .getElementById('approveButton')
            ?.addEventListener('click', () => {
              this.isPopupVisible = false;
              this.isLoading = true;
              this.collectionService.ChangeStatus(item.id, 'Approved').subscribe(
                (res) => {
                  this.isLoading = false;
                  if (res.status) {
                    Swal.fire({
                      icon: 'success',
                      title: 'Success!',
                      text: 'The collection was approved successfully.',
                      showConfirmButton: false,
                      timer: 3000,
                    });
                    this.fetchAllCompanyHeads();
                  } else {
                    Swal.fire({
                      icon: 'error',
                      title: 'Error!',
                      text: 'Something went wrong. Please try again.',
                      showConfirmButton: false,
                      timer: 3000,
                    });
                  }
                },
                (err) => {
                  this.isLoading = false;
                  Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'An error occurred while approving. Please try again.',
                    showConfirmButton: false,
                    timer: 3000,
                  });
                }
              );
            });
  
          // Handle the "Reject" button click
          document
            .getElementById('rejectButton')
            ?.addEventListener('click', () => {
              this.isPopupVisible = false;
              this.isLoading = true;
              this.collectionService.ChangeStatus(item.id, 'Rejected').subscribe(
                (res) => {
                  this.isLoading = false;
                  if (res.status) {
                    Swal.fire({
                      icon: 'success',
                      title: 'Success!',
                      text: 'The collection was rejected successfully.',
                      showConfirmButton: false,
                      timer: 3000,
                    });
                    this.fetchAllCompanyHeads();
                  } else {
                    Swal.fire({
                      icon: 'error',
                      title: 'Error!',
                      text: 'Something went wrong. Please try again.',
                      showConfirmButton: false,
                      timer: 3000,
                    });
                  }
                },
                (err) => {
                  this.isLoading = false;
                  Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'An error occurred while rejecting. Please try again.',
                    showConfirmButton: false,
                    timer: 3000,
                  });
                }
              );
            });
        },
      });
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
