import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
// import { DatePipe } from '@angular/common';

import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

import { FormsModule } from '@angular/forms';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { SalesAgentsService } from '../../../services/dash/sales-agents.service';

@Component({
  selector: 'app-view-sales-agents',
  standalone: true,
  imports: [
            HttpClientModule,
            CommonModule,
            LoadingSpinnerComponent,
            NgxPaginationModule,
            FormsModule,
            DropdownModule
  ],
  templateUrl: './view-sales-agents.component.html',
  styleUrl: './view-sales-agents.component.css'
})
export class ViewSalesAgentsComponent implements OnInit {

  salesAgentsArr: SalesAgent[] = [];
  

  isLoading = false;
  isPopupVisible = false;

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  hasData: boolean = true;
  searchText: string = '';

  statusArr = [
    { status: 'Approved', value: 'Approved' },
    { status: 'Rejected', value: 'Rejected' },
    
  ];

  statusFilter: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    
    private salesAgentsService: SalesAgentsService,
  ) {}

  ngOnInit() {
    
    this.fetchAllSalesAgents();
  }

  fetchAllSalesAgents(page: number = 1, limit: number = this.itemsPerPage, search: string = this.searchText, status: string = this.statusFilter) {
    
    
    this.isLoading = true;
    this.salesAgentsService.getAllSalesAgents( page, limit, search, status).subscribe(
      (data) => {
        console.log(data);
        this.isLoading = false;
        this.salesAgentsArr = data.items;
        
        this.hasData = this.salesAgentsArr.length > 0;
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
    this.fetchAllSalesAgents(this.page, this.itemsPerPage, this.searchText, this.statusFilter); // Include itemsPerPage
  }

  onSearch() {
    this.fetchAllSalesAgents(this.page, this.itemsPerPage, this.searchText, this.statusFilter);
  }

  offSearch() {
    this.searchText = '';
    this.fetchAllSalesAgents(this.page, this.itemsPerPage, this.searchText, this.statusFilter);
  }

  applyFilters() {
    this.fetchAllSalesAgents(this.page, this.itemsPerPage, this.searchText, this.statusFilter);
  }

  Back(): void {
    this.router.navigate(['/steckholders/action']);
  }

  editCompanyHead(id: number) {
    
    this.navigatePath(`/steckholders/action/sales-agents/edit-sales-agents/${id}`);
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  deleteSalesAgent(id: any) {
    console.log(id);
    console.log('clicked');
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this sales agent? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.salesAgentsService.deleteSalesAgent(id).subscribe(
          (data: any) => {
            if (data) {
              Swal.fire(
                'Deleted!',
                'The sales agent has been deleted.',
                'success'
              );
              this.isLoading = true;
              this.fetchAllSalesAgents();
            }
          },
          (error) => {
            console.error('Error deleting Sales Agent:', error);
            Swal.fire(
              'Error!',
              'There was an error deleting the Sales Agent.',
              'error'
            );
          }
        );
      }
    });
  }

  openPopup(item: any) {
    this.isPopupVisible = true;

    // HTML structure for the popup
    const tableHtml = `
      <div class="container mx-auto">
        <h1 class="text-center text-2xl font-bold mb-4">Officer Name : ${item.firstName}</h1>
        <div >
          <p class="text-center">Are you sure you want to approve or reject this officer?</p>
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
            this.salesAgentsService.ChangeStatus(item.id, 'Approved').subscribe(
              (res) => {
                this.isLoading = false;
                if (res.status) {
                  Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'The Agent was approved successfully.',
                    showConfirmButton: false,
                    timer: 3000,
                  });
                  this.isLoading = false;
                  this.fetchAllSalesAgents();
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
            this.salesAgentsService.ChangeStatus(item.id, 'Rejected').subscribe(
              (res) => {
                this.isLoading = false;
                if (res.status) {
                  Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'The Agent was rejected successfully.',
                    showConfirmButton: false,
                    timer: 3000,
                  });
                  this.isLoading = false;
                  this.fetchAllSalesAgents();
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

class SalesAgent {
  id!: number;
  empId!: string;
  firstName!: string;
  lastName!: string;
  status!: string;
  phoneCode1!: string;
  phoneNumber1!: string;
  nic!: string;
 
  
}



