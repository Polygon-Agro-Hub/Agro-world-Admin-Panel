import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-collection-center',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-collection-center.component.html',
  styleUrls: ['./add-collection-center.component.css']
})
export class AddCollectionCenterComponent {
  collectionCenterForm: FormGroup;
  centerData: CollectionCenter = new CollectionCenter();
  selectProvince: string = ''
  selectedDistrict: any = []

  constructor(private fb: FormBuilder, private collectionCenterService: CollectionCenterService, private router: Router) {
    this.collectionCenterForm = this.fb.group({
      regCode: ['', Validators.required],
      centerName: ['', [Validators.required, this.noNumbersValidator]],      contact01: ['', Validators.required, Validators.maxLength(10), Validators.minLength(10)],
      contact01Code: ['+94', Validators.required],
      contact02: ['', Validators.required, Validators.maxLength(10), Validators.minLength(10)],
      contact02Code: ['+94', Validators.required],
      buildingNumber: ['', Validators.required],
      street: ['', [Validators.required, this.noNumbersValidator]],      district: ['', Validators.required],
      province: ['', Validators.required]
    });
  }

  noNumbersValidator(control: any) {
    const regex = /^[A-Za-z\s]*$/; // Allows only letters and spaces
    if (control.value && !regex.test(control.value)) {
      return { containsNumbers: true }; // Validation fails
    }
    return null; // Validation passes
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
    },

  ]

  onSubmit() {
    if (this.collectionCenterForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all required fields.'
      });
      return;
    }

    this.centerData = { ...this.centerData, ...this.collectionCenterForm.value };

    this.collectionCenterService.createCollectionCenter(this.centerData).subscribe(
      (res) => {
        console.log(res);

        if (res.status) {
          Swal.fire('Success', 'Collection Center Created Successfully', 'success');
          this.router.navigate(['/collection-hub/view-collection-centers']);
        } else {
          if (res.message === "This RegCode allrady exist!") {
            Swal.fire({
              icon: 'error',
              title: 'Failed',
              text: 'This RegCode already exists!'
            });
          }
        }
      },
      (error) => {
        console.log("Error:", error);
      }
    );
  }

  onProvinceChange() {
    const sample = this.ProvinceData.filter(crop => crop.province === this.selectProvince);

    console.log("Filtered crops:", sample);

    if (sample.length > 0) {
      this.selectedDistrict = sample[0].district;
      console.log("Selected crop varieties:", this.selectedDistrict);
      // this.isVerityVisible = true;
    } else {
      console.log("No crop found with selectId:", this.ProvinceData);
    }
  }


  onCancel() {
    Swal.fire({
      icon: 'info',
      title: 'Cancelled',
      text: 'Form has been cleared!',
      timer: 2000,
      showConfirmButton: false,
    });
  
    this.collectionCenterForm.reset();
  
    this.selectedDistrict = [];
    this.selectProvince = '';
  }
  


}

class CollectionCenter {
  regCode!: string;
  centerName!: string;
  contact01!: string;
  contact01Code!: string;
  contact02!: string;
  contact02Code!: string;
  buildingNumber!: string;
  street!: string;
  district!: string;
  province!: string;
}

;

