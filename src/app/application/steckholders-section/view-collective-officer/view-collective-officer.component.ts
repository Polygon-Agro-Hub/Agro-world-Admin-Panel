import { Component } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { DropdownModule } from 'primeng/dropdown';
import {
  HttpClientModule,
  HttpClient,
  HttpHeaders,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CollectionService } from '../../../services/collection.service';
import { environment } from '../../../environment/environment';

interface CollectionOfficers {
  id: number;
  image: string;
  firstName: string;
  lastName: string;
  phoneNumber01: string;
  companyName: string;
  nic: string;
  status: string;
  created_at: string;
}

@Component({
  selector: 'app-view-collective-officer',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    HttpClientModule,
    NgxPaginationModule,
    FormsModule,
  ],
  templateUrl: './view-collective-officer.component.html',
  styleUrls: ['./view-collective-officer.component.css'],
})
export class ViewCollectiveOfficerComponent {
  collectionOfficers: CollectionOfficers[] = [];
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  searchNIC: string = '';
  isPopupVisible = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private collectionService: CollectionService
  ) {}

  fetchAllCollectionOfficer(
    page: number = 1,
    limit: number = this.itemsPerPage
  ) {
    this.collectionService
      .fetchAllCollectionOfficer(page, limit, this.searchNIC)
      .subscribe(
        (response) => {
          this.collectionOfficers = response.items;
          this.totalItems = response.total;
          console.log(this.collectionOfficers);
        },
        (error) => {
          console.error('Error fetching ongoing cultivations:', error);
          if (error.status === 401) {
            // Handle unauthorized access (e.g., redirect to login)
          }
        }
      );
  }

  ngOnInit() {
    this.fetchAllCollectionOfficer(this.page, this.itemsPerPage);
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllCollectionOfficer(this.page, this.itemsPerPage);
  }

  applyFilters() {
    throw new Error('Method not implemented.');
  }
  status: any;
  statusFilter: any = "'";

  deleteCollectionOfficer(id: any) {
    const token = localStorage.getItem('Login Token : ');
    if (!token) {
      console.error('No token found');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this Collection Officer? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });

        this.http
          .delete(
            `${environment.API_BASE_URL}delete-collection-officer/${id}`,
            {
              headers,
            }
          )
          .subscribe(
            (data: any) => {
              console.log('Collection Officer deleted successfully');
              Swal.fire(
                'Deleted!',
                'The Collection Officer has been deleted.',
                'success'
              );
              this.fetchAllCollectionOfficer();
            },
            (error) => {
              console.error('Error deleting news:', error);
              Swal.fire(
                'Error!',
                'There was an error deleting the news item.',
                'error'
              );
            }
          );
      }
    });
  }

  editCollectionOfficer(id: number) {
    this.router.navigate(['/collection-officers/create-collection-officers'], {
      queryParams: { id },
    });
  }

  openPopup(item: any) {
    this.isPopupVisible = true;

    // Generate the table HTML dynamically
    let tableHtml = `
      <div class="container mx-auto">
        <h1 class="text-center text-2xl font-bold mb-4">${item.firstName}</h1>
        <div class="border border-gray-300 p-4 rounded-lg">
          
        </div>
        <div class="flex justify-center mt-4">
          <button id="rejectButton" class="bg-red-500 text-white px-6 py-2 rounded-lg mr-2">Reject</button>
          <button id="approveButton" class="bg-green-500 text-white px-4 py-2 rounded-lg">Approve</button>
        </div>
      </div>
    `;

    Swal.fire({
      html: tableHtml,
      showConfirmButton: false, // Hide the default confirm button
      width: 'auto',
      didOpen: () => {
        document
          .getElementById('approveButton')
          ?.addEventListener('click', () =>
            this.updateStatus(item, 'Approved')
          );
        document
          .getElementById('rejectButton')
          ?.addEventListener('click', () =>
            this.updateStatus(item, 'Rejected')
          );
      },
    });
  }

  updateStatus(item: CollectionOfficers, newStatus: string) {
    item.status = newStatus;
    Swal.fire(
      'Updated!',
      `The Collection Officer status has been updated to ${newStatus}.`,
      'success'
    );
    this.isPopupVisible = false;
  }
}
