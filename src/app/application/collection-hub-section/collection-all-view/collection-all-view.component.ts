import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

interface CollectionCenter {
  id: number;
  regCode: string;
  centerName: string;
  contact01: string;
  contact02: string;
  buildingNumber: string;
  street: string;
  district: string;
  province: string;
}

@Component({
  selector: 'app-collection-all-view',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    HttpClientModule,
    NgxPaginationModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './collection-all-view.component.html',
  styleUrls: ['./collection-all-view.component.css'], // Fixed typo from styleUrl to styleUrls
})
export class CollectionAllViewComponent implements OnInit {
  collectionObj!: CollectionCenter[];
  filteredCollection!: CollectionCenter[];
  districts: string[] = []; // Array to hold the districts
  selectedDistrict: string | null = null; // Store the selected district
  searchItem: string = '';
  page: number = 1;
  itemsPerPage: number = 10;
  isLoading = false;
  totalItems: number = 0;
  hasData: boolean = true;

  constructor(
    private router: Router,
    private collectionService: CollectionCenterService
  ) {}

  ngOnInit(): void {
    this.fetchAllCollectionCenter(this.page, this.itemsPerPage);
  }

  // fetchAllCollectionCenterww(page: number = 1, limit: number = this.itemsPerPage) {
  //   this.collectionService.getAllCollectionCenterPage(page, limit, this.searchItem).subscribe(
  //     (response) => {
  //       console.log(response);
  //       this.isLoading = false;
  //       this.collectionObj = response.items;
  //       this.hasData = this.collectionObj.length > 0;
  //       this.totalItems = response.total;

  //     },
  //     (error) => {
  //       console.log("Error occurred in fetching collection center data:", error);
  //     }
  //   );
  // }

  fetchAllCollectionCenter(
    page: number = this.page,
    limit: number = this.itemsPerPage,
    searchItem?: string
  ) {
    this.isLoading = true;
    this.collectionService
      .getAllCollectionCenterPage(page, limit, searchItem)
      .subscribe(
        (response) => {
          this.isLoading = false;
          this.collectionObj = response.items;
          console.log(this.collectionObj);
          this.hasData = this.collectionObj.length > 0;
          this.totalItems = response.total;
        },
        (error) => {
          console.error('Error fetching market prices:', error);
          if (error.status === 401) {
            // Handle unauthorized access (e.g., redirect to login)
          }
        }
      );
  }

  // extractDistricts() {
  //   // Extract unique districts from the collectionObj
  //   const uniqueDistricts = new Set(this.collectionObj.map(item => item.district));
  //   this.districts = Array.from(uniqueDistricts);
  // }

  // applyFilters() {
  //   if (this.selectedDistrict) {
  //     this.filteredCollection = this.collectionObj.filter(item => item.district === this.selectedDistrict);
  //   } else {
  //     this.filteredCollection = this.collectionObj; // Reset if no district is selected
  //   }
  // }

  deleteCollectionCenter(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this Collection Center? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.collectionService.deleteCollectionCenter(id).subscribe(
          (res) => {
            if (res) {
              Swal.fire(
                'Deleted!',
                'The Collection Center has been deleted.',
                'success'
              );
              this.fetchAllCollectionCenter();
            }
          },
          (error) => {
            console.error('Error deleting collection center:', error);
            Swal.fire(
              'Error!',
              'There was an error deleting the Collection Centers',
              'error'
            );
          }
        );
      }
    });
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllCollectionCenter(this.page, this.itemsPerPage); // Include itemsPerPage
  }

  searchPlantCareUsers() {
    this.page = 1;
    this.fetchAllCollectionCenter(
      this.page,
      this.itemsPerPage,
      this.searchItem
    );
  }

  clearSearch(): void {
    this.searchItem = '';
    this.fetchAllCollectionCenter(this.page, this.itemsPerPage);
  }

  navigateEdit(id: number) {
    this.router.navigate([`/collection-hub/update-collection-center/${id}`]);
  }
}

// class CollectionCenter {
//   id!: number;
//   regCode!: string;
//   centerName!: string;
//   contact01!: string;
//   contact02!: string;
//   buildingNumber!: string;
//   street!: string;
//   district!: string;
//   province!: string;
// }
