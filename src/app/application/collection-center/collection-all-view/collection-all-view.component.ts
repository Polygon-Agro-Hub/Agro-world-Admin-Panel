import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-collection-all-view',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    HttpClientModule,
    NgxPaginationModule,
    FormsModule
  ],
  templateUrl: './collection-all-view.component.html',
  styleUrls: ['./collection-all-view.component.css'] // Fixed typo from styleUrl to styleUrls
})
export class CollectionAllViewComponent implements OnInit {
  collectionObj!: CollectionCenter[];
  filteredCollection!: CollectionCenter[];
  districts: string[] = []; // Array to hold the districts
  selectedDistrict: string | null = null; // Store the selected district

  constructor(
    private router: Router,
    private collectionService: CollectionCenterService
  ) {}

  ngOnInit(): void {
    this.fetchAllCollectionCenter();
  }

  fetchAllCollectionCenter() {
    this.collectionService.getAllCollectionCenter().subscribe(
      (res) => {
        console.log(res);
        this.collectionObj = res;
        this.filteredCollection = res; // Initially show all items
        this.extractDistricts(); // Extract districts for the dropdown
      },
      (error) => {
        console.log("Error occurred in fetching collection center data:", error);
      }
    );
  }

  extractDistricts() {
    // Extract unique districts from the collectionObj
    const uniqueDistricts = new Set(this.collectionObj.map(item => item.district));
    this.districts = Array.from(uniqueDistricts);
  }

  applyFilters() {
    if (this.selectedDistrict) {
      this.filteredCollection = this.collectionObj.filter(item => item.district === this.selectedDistrict);
    } else {
      this.filteredCollection = this.collectionObj; // Reset if no district is selected
    }
  }

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
}

class CollectionCenter {
  id!: number;
  regCode!: string;
  centerName!: string;
  contact01!: string;
  contact02!: string;
  buildingNumber!: string;
  street!: string;
  district!: string;
  province!: string;
}
