import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-collection-center',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './edit-collection-center.component.html',
  styleUrl: './edit-collection-center.component.css'
})
export class EditCollectionCenterComponent implements OnInit {
  collectionCenterID!: number;
  centerData: CollectionCenter = new CollectionCenter();
  centerFetchData: CollectionCenter = new CollectionCenter();
  selectProvince: string = '';
  selectedDistrict: any = [];
  existRegCode!: string

  constructor(
    private collectionCenterService: CollectionCenterService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.collectionCenterID = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.fetchCollectionCenter();
  }

  ProvinceData = [
    {
      province: "Western",
      district: [
        { districtName: "Colombo" },
        { districtName: "Kalutara" },
        { districtName: "Gampaha" }
      ]
    },
    {
      province: "Central",
      district: [
        { districtName: "Kandy" },
        { districtName: "Matale" },
        { districtName: "Nuwara Eliya" }
      ]
    },
    {
      province: "Southern",
      district: [
        { districtName: "Galle" },
        { districtName: "Matara" },
        { districtName: "Hambantota" }
      ]
    },
    {
      province: "Northern",
      district: [
        { districtName: "Jaffna" },
        { districtName: "Mannar" },
        { districtName: "Vavuniya" },
        { districtName: "Kilinochchi" },
        { districtName: "Mulaitivu" }
      ]
    },
    {
      province: "Eastern",
      district: [
        { districtName: "Batticaloa" },
        { districtName: "Ampara" },
        { districtName: "Trincomalee" }
      ]
    },
    {
      province: "Uva",
      district: [
        { districtName: "Badulla" },
        { districtName: "Moneragala" }
      ]
    },
    {
      province: "North Western",
      district: [
        { districtName: "Kurunegala" },
        { districtName: "Puttalam" }
      ]
    },
    {
      province: "North Central",
      district: [
        { districtName: "Anuradhapura" },
        { districtName: "Polonnaruwa" }
      ]
    },
    {
      province: "Sabaragamuwa",
      district: [
        { districtName: "Ratnapura" },
        { districtName: "Kegalle" }
      ]
    }
  ];

  onSubmit() {
    this.collectionCenterService.updateColectionCenter(this.centerFetchData, this.collectionCenterID , this.existRegCode).subscribe(
      (res) => {
        if (res?.status) {
          Swal.fire('Success', 'Collection Center updated Successfully', 'success');
          this.router.navigate(['/collection-hub/view-collection-centers']);
        } else if (res?.message === "This RegCode already exists!") {
          Swal.fire({
            icon: 'error',
            title: 'Failed',
            text: 'This RegCode already exists!'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An unexpected error occurred.'
          });
        }
      },
      (error) => {
        console.error("Error:", error);
        Swal.fire({
          icon: 'error',
          title: 'Server Error',
          text: 'Failed to update the collection center. Please try again later.'
        });
      }
    );
  }

  onProvinceChange() {
    const filteredProvince = this.ProvinceData.filter(item => item.province === this.selectProvince);
    this.centerFetchData.province = this.selectProvince

    if (filteredProvince.length > 0) {
      this.selectedDistrict = filteredProvince[0].district;
    } else {
      this.selectedDistrict = [];
    }
  }

  fetchCollectionCenter() {
    this.collectionCenterService.getCenterById(this.collectionCenterID).subscribe(
      (res) => {
        if (res?.status) {
          console.log(res.results);

          this.centerFetchData = res.results;
          this.selectProvince = this.centerFetchData.province;
          this.existRegCode = this.centerFetchData.regCode
          this.onProvinceChange(); // Update districts based on fetched province
        } else {
          Swal.fire('Sorry', 'Center Data not available', 'warning');
          this.router.navigate(['/collection-hub/view-collection-centers']);
        }
      },
      (error) => console.error("Error fetching collection center:", error)
    );
  }
}

class CollectionCenter {
  regCode!: string;
  centerName!: string;
  contact01!: number;
  contact01Code!: string;
  contact02!: number;
  contact02Code!: string;
  buildingNumber!: string;
  street!: string;
  district!: string;
  province!: string;
}
