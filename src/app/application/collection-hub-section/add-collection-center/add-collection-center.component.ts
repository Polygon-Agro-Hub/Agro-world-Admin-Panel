import { Component, OnInit } from '@angular/core';
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
export class AddCollectionCenterComponent implements OnInit {
  collectionCenterForm: FormGroup;
  centerData: CollectionCenter = new CollectionCenter();
  selectProvince: string = '';
  selectedDistrict: any = [];
  CompanyData: Company[] = [];
  dropdownOpen: boolean = false;
  selectedCompaniesIds: number[] = [];
  selectedCompaniesNames: string[] = [];
  selectDistrict: string = '';
  city: string = '';
 

  constructor(
    private fb: FormBuilder,
    private collectionCenterService: CollectionCenterService,
    private router: Router
  ) {
    this.collectionCenterForm = this.fb.group({
      regCode: ['', [Validators.required, Validators.pattern(/^[^\d]*$/)]],
      centerName: ['', [Validators.required, this.noNumbersValidator]],
      contact01: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
      contact01Code: ['+94', Validators.required],
      contact02: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
      contact02Code: ['+94', Validators.required],
      buildingNumber: ['', Validators.required],
      street: ['', [Validators.required, this.noNumbersValidator]],
      district: ['', Validators.required],
      province: ['', Validators.required],
      country: ['Sri Lanka', Validators.required],
      city: ['', Validators.required]  // Add city form control
    });
  }

  ngOnInit() {
    this.getAllCompanies();

    // Listen to value changes on the form fields
    this.collectionCenterForm.get('province')?.valueChanges.subscribe(() => {
      this.onProvinceChange();
    });

    this.collectionCenterForm.get('district')?.valueChanges.subscribe(() => {
      this.onDistrictChange();
    });

    this.collectionCenterForm.get('city')?.valueChanges.subscribe(() => {
      this.onCityChange();
    });
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleSelection(company: any) {
    const index = this.selectedCompaniesIds.indexOf(company.id);
    if (index === -1) {
      this.selectedCompaniesIds.push(company.id);
      this.selectedCompaniesNames.push(company.companyNameEnglish);
    } else {
      this.selectedCompaniesIds.splice(index, 1);
      this.selectedCompaniesNames.splice(index, 1);
    }
    console.log('Selected IDs:', this.selectedCompaniesIds);
    console.log('Selected Names:', this.selectedCompaniesNames);
  }


  

  // onProvinceChange() {
  //   const selectedProvince = this.collectionCenterForm.get('province')?.value;
  //   this.selectProvince = selectedProvince;

  //   // Trigger regCode update
  //   this.updateRegCode();

  //   const sample = this.ProvinceData.filter(province => province.province === selectedProvince);
  //   if (sample.length > 0) {
  //     this.selectedDistrict = sample[0].district;
  //     console.log("Selected districts:", this.selectedDistrict);
  //   } else {
  //     console.log("No districts found for the selected province.");
  //   }
  // }


  onProvinceChange() {
    const selectedProvince = this.collectionCenterForm.get('province')?.value;
    const selectedDistrict = this.collectionCenterForm.get('district')?.value;
    const selectedCity = this.collectionCenterForm.get('city')?.value;

    this.selectProvince = selectedProvince;

    // Trigger regCode update based on the selected province
    this.updateRegCode();

    // Find the corresponding district list for the selected province
    const selectedProvinceData = this.ProvinceData.find(province => province.province === selectedProvince);

    if (selectedProvinceData) {
      this.selectedDistrict = selectedProvinceData.district;
      console.log("Selected districts:", this.selectedDistrict);
    } else {
      console.log("No districts found for the selected province.");
    }

    // Fetch the next regCode from the backend when province or district changes
    if (selectedProvince && selectedDistrict && selectedCity) {
      this.collectionCenterService.generateRegCode(selectedProvince, selectedDistrict, selectedCity)
        .subscribe(response => {
          this.collectionCenterForm.patchValue({ regCode: response.regCode });
         
        });
    }
  }

  

  onDistrictChange() {
    const selectedProvince = this.collectionCenterForm.get('province')?.value;
    const selectedDistrict = this.collectionCenterForm.get('district')?.value;
    const selectedCity = this.collectionCenterForm.get('city')?.value;

    if (selectedProvince && selectedDistrict && selectedCity) {
      this.collectionCenterService.generateRegCode(selectedProvince, selectedDistrict, selectedCity)
        .subscribe(response => {
          this.collectionCenterForm.patchValue({ regCode: response.regCode });
          console.log("New RegCode:", response.regCode);
        }, error => {
          console.error("Error fetching regCode:", error);
        });
    }
  }

  onCityChange() {
    this.city = this.collectionCenterForm.get('city')?.value;
    // Trigger regCode update
    this.updateRegCode();
  }

  updateRegCode() {
    const province = this.collectionCenterForm.get('province')?.value;
    const district = this.collectionCenterForm.get('district')?.value;
    const city = this.collectionCenterForm.get('city')?.value;

    if (province && district && city) {
      const regCode = `${province.slice(0, 2).toUpperCase()}${district.slice(0, 1).toUpperCase()}${city.slice(0, 1).toUpperCase()}`;
      this.collectionCenterForm.patchValue({ regCode });
    }
  }

  onSubmit() {
    // if (this.collectionCenterForm.invalid) {
    //   Swal.fire({
    //     icon: 'error',
    //     title: 'Validation Error',
    //     text: 'Please fill in all required fields.'
    //   });
    //   return;
    // }

    this.centerData = { ...this.centerData, ...this.collectionCenterForm.value };

    this.collectionCenterService.createCollectionCenter(this.centerData, this.selectedCompaniesIds).subscribe(
      (res) => {
        console.log(res);

        if (res.status) {
          Swal.fire('Success', 'Collection Center Created Successfully', 'success');
          this.router.navigate(['/admin/collection-hub/view-collection-centers']);
        } else {
          if (res.message === "This RegCode already exists!") {
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

  getAllCompanies() {
    this.collectionCenterService.getAllCompanyList().subscribe(
      (res) => {
        this.CompanyData = res;
        console.log(this.CompanyData);
      }
    );
  }

  noNumbersValidator(control: any) {
    const regex = /^[A-Za-z\s]*$/;
    if (control.value && !regex.test(control.value)) {
      return { containsNumbers: true };
    }
    return null;
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
        { districtName: "Rathnapura" },
        { districtName: "Kegalle" }
      ]
    },

  ]
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
  country!: string;
  city!: string;  // Add city to CollectionCenter class
}

class Company {
  id!: number;
  companyNameEnglish!: string;
}
