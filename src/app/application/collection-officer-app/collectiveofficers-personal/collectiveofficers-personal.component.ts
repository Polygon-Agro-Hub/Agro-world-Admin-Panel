import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { CollectionOfficerService } from '../../../services/collection-officer/collection-officer.service';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environment/environment';







@Component({
  selector: 'app-collectiveofficers-personal',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, CommonModule, FormsModule],
  templateUrl: './collectiveofficers-personal.component.html',
  styleUrls: ['./collectiveofficers-personal.component.css'],
})
export class CollectiveofficersPersonalComponent implements OnInit {
  officerForm: FormGroup;
  officerId: number | null = null;
  selectedFile: File | null = null;
  languages: string[] = ['Sinhala', 'English', 'Tamil'];
  selectedPage: 'pageOne' | 'pageTwo' = 'pageOne';
  personalData: Personal = new Personal();
  bankData: Bank = new Bank();
  companyData: Company = new Company();
  collectionCenterData: CollectionCenter[] = []
  itemId: number | null = null;
  isLoading = false;
  selectedFileName!: string
  selectedImage: string | ArrayBuffer | null = null;
  lastID!: string
  UpdatelastID!: string
  selectJobRole!: string
  upateEmpID!: string

  officer: { collectionOfficer: { centerId: any, firstNameEnglish: string, firstNameSinhala: string, firstNameTamil: string, lastNameEnglish: string, lastNameSinhala: string, lastNameTamil: string, phoneNumber01: string, phoneNumber02: string, image: string, QRcode: string, nic: string, email: string, address: { houseNumber: string, streetName: string, city: string, district: string, province: string, country: string }, languages: string }, companyDetails: { companyNameEnglish: string, companyNameSinhala: string, companyNameTamil: string, jobRole: string, empId: string, IRMname: string, companyEmail: string, assignedDistrict: string, employeeType: string }, bankDetails: { accHolderName: string, accNumber: string, bankName: string, branchName: string } } = {
    collectionOfficer: {
      centerId: '',
      firstNameEnglish: '',
      firstNameSinhala: '',
      firstNameTamil: '',
      lastNameEnglish: '',
      lastNameSinhala: '',
      lastNameTamil: '',
      phoneNumber01: '',
      phoneNumber02: '',
      image: '',
      QRcode: '',
      nic: '',
      email: '',
      address: {
        houseNumber: '',
        streetName: '',
        city: '',
        district: '',
        province: '',
        country: ''
      },
      languages: ''
    },
    companyDetails: {
      companyNameEnglish: '',
      companyNameSinhala: '',
      companyNameTamil: '',
      jobRole: '',
      empId: '',
      IRMname: '',
      companyEmail: '',
      assignedDistrict: '',
      employeeType: ''
    },
    bankDetails: {
      accHolderName: '',
      accNumber: '',
      bankName: '',
      branchName: '',
    }
  };

  constructor(
    private collectionOfficerService: CollectionOfficerService,
    private fb: FormBuilder,
    private collectionCenterSrv: CollectionCenterService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
  ) {
    this.officerForm = this.fb.group({
      firstNameEnglish: ['', Validators.required],
      firstNameSinhala: ['', Validators.required],
      firstNameTamil: ['', Validators.required],
      centerId: ['', Validators.required],
      lastNameEnglish: ['', Validators.required],
      lastNameSinhala: ['', Validators.required],
      lastNameTamil: ['', Validators.required],
      phoneNumber01Code: ['', Validators.required],
      phoneNumber01: ['', Validators.required],
      phoneNumber02Code: ['', Validators.required],
      phoneNumber02: ['', Validators.required],
      nic: ['', Validators.required],
      email: ['', Validators.required],
      houseNumber: ['', Validators.required],
      streetName: ['', Validators.required],
      city: ['', Validators.required],
      district: ['', Validators.required],
      province: ['', Validators.required],
      country: ['', Validators.required],
      accHolderName: ['', Validators.required],
      accNumber: ['', Validators.required],
      bankName: ['', Validators.required],
      branchName: ['', Validators.required],
      companyNameEnglish: ['', Validators.required],
      companyNameSinhala: ['', Validators.required],
      companyNameTamil: ['', Validators.required],
      jobRole: ['', Validators.required],
      IRMname: ['', Validators.required],
      companyEmail: ['', Validators.required],
      assignedDistrict: ['', Validators.required],
      employeeType: ['', Validators.required],
      languages: this.fb.array([]),
      image: [null, [Validators.required]],

    });
  }

  onCheckboxChange(lang: string, event: any) {
    // If the checkbox is checked, add the language to the string; if unchecked, remove it
    if (event.target.checked) {
      if (this.personalData.languages) {
        // Add the language if it's not already in the string
        if (!this.personalData.languages.includes(lang)) {
          this.personalData.languages += this.personalData.languages ? `,${lang}` : lang;
        }
      } else {
        this.personalData.languages = lang;
      }
    } else {
      // Remove the language from the string if the checkbox is unchecked
      const languagesArray = this.personalData.languages.split(',');
      const index = languagesArray.indexOf(lang);
      if (index !== -1) {
        languagesArray.splice(index, 1);
      }
      this.personalData.languages = languagesArray.join(',');
    }
  }

  onSubmit() {
    console.log(this.personalData); // Logs the personal data with updated languages
    console.log(this.bankData);
    console.log(this.companyData);

    const formValue = this.officerForm.value;

    const formData = new FormData();
    if (this.officerForm.value) {
      const officerData = this.officerForm.value;
      for (const key in officerData) {
        if (officerData.hasOwnProperty(key)) {
          formData.append(key, officerData[key]);
        }
      }

      // this.personalData.image = this.selectedFile

      this.collectionOfficerService.createCollectiveOfficer(this.personalData, this.bankData, this.companyData).subscribe(
        (res: any) => {
          this.officerId = res.officerId;
          Swal.fire('Success', 'Collective Officer Created Successfully', 'success');
          this.router.navigate(['/steckholders/collective-officer'])
        },
        (error: any) => {
          Swal.fire('Error', 'There was an error creating the collective officer', 'error');
        }
      );
    }
  }

  nextForm(page: 'pageOne' | 'pageTwo') {
    this.selectedPage = page;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.itemId = params['id'] ? +params['id'] : null;
      console.log('Received item ID:', this.itemId);
    });
    this.getAllCollectionCetnter()

    if (this.itemId) {

      this.isLoading = true;
      this.collectionCenterSrv.getOfficerReportById(this.itemId).subscribe({
        next: (response: any) => {
          this.officer = response.officerData;
          this.selectJobRole = response.officerData.companyDetails.jobRole;
          this.getUpdateLastID(response.officerData.companyDetails.jobRole)


          console.log(response);


          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching crop group details:', error);
          this.isLoading = false;
        },
      });
    }

    this.getLastID('COO');
  }

  getAllCollectionCetnter() {
    this.collectionCenterSrv.getAllCollectionCenter().subscribe(
      (res) => {
        this.collectionCenterData = res
      }
    )
  }



  updateOfficerDetails() {
    const token = localStorage.getItem('Login Token : ');
    if (!token) {
      console.error('No token found');
      return;
    }

    if (!this.officer) {
      console.error('Officer details are empty');
      return;
    }

    // Create request body directly from the officer object
    const requestBody = {
      centerId: this.officer.collectionOfficer.centerId,
      firstNameEnglish: this.officer.collectionOfficer.firstNameEnglish,
      lastNameEnglish: this.officer.collectionOfficer.lastNameEnglish,
      firstNameSinhala: this.officer.collectionOfficer.firstNameSinhala,
      lastNameSinhala: this.officer.collectionOfficer.lastNameSinhala,
      firstNameTamil: this.officer.collectionOfficer.firstNameTamil,
      lastNameTamil: this.officer.collectionOfficer.lastNameTamil,
      nic: this.officer.collectionOfficer.nic,
      email: this.officer.collectionOfficer.email,
      houseNumber: this.officer.collectionOfficer.address.houseNumber,
      streetName: this.officer.collectionOfficer.address.streetName,
      city: this.officer.collectionOfficer.address.city,
      district: this.officer.collectionOfficer.address.district,
      province: this.officer.collectionOfficer.address.province,
      country: this.officer.collectionOfficer.address.country,
      companyNameEnglish: this.officer.companyDetails.companyNameEnglish,
      companyNameSinhala: this.officer.companyDetails.companyNameSinhala,
      companyNameTamil: this.officer.companyDetails.companyNameTamil,
      IRMname: this.officer.companyDetails.IRMname,
      jobRole: this.officer.companyDetails.jobRole,
      empId: this.upateEmpID,
      companyEmail: this.officer.companyDetails.companyEmail,
      assignedDistrict: this.officer.companyDetails.assignedDistrict,
      employeeType: this.officer.companyDetails.employeeType,
      accHolderName: this.officer.bankDetails.accHolderName,
      accNumber: this.officer.bankDetails.accNumber,
      bankName: this.officer.bankDetails.bankName,
      branchName: this.officer.bankDetails.branchName
    };

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'  // Add this header
    });

    this.isLoading = true;
    this.http
      .put(
        `${environment.API_BASE_URL}update-officer-details/${this.itemId}`,
        requestBody,  // Send JSON directly instead of FormData
        { headers }
      )
      .subscribe(
        (res: any) => {
          console.log('Collection Officer details updated successfully', res);
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Collection Officer details updated successfully!'
          });
          this.router.navigate(['/steckholders/collective-officer']); // Update this to your correct route
        },
        (error) => {
          console.error('Error updating collection officer details', error);
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Unsuccessful',
            text: 'Error updating collection officer details'
          });
        }
      );
  }

  triggerFileInput(event: Event): void {
    event.preventDefault();
    const fileInput = document.getElementById('imageUpload');
    fileInput?.click();
  }


  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        Swal.fire('Error', 'File size should not exceed 5MB', 'error');
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire('Error', 'Only JPEG, JPG and PNG files are allowed', 'error');
        return;
      }

      this.selectedFile = file;
      this.selectedFileName = file.name;
      // this.officerForm.patchValue({ image: file });

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage = e.target.result; // Set selectedImage to the base64 string or URL
      };
      reader.readAsDataURL(file); // Read the file as a data URL
    }
  }

  EpmloyeIdCreate() {
    let rolePrefix: string;

    if (this.companyData.jobRole === 'Collection Center Head') {
      rolePrefix = 'CCH';
    } else if (this.companyData.jobRole === 'Collection Center Manager') {
      rolePrefix = 'CCM';
    } else if (this.companyData.jobRole === 'Customer Officer') {
      rolePrefix = 'CUO';
    } else {
      rolePrefix = 'COO';
    }



    this.getLastID(rolePrefix).then((lastID) => {
      this.companyData.empId = rolePrefix + lastID;
    });
  }


  UpdateEpmloyeIdCreate() {
    let rolePrefix: string;

    if (this.officer.companyDetails.jobRole === 'Collection Center Head') {
      rolePrefix = 'CCH';
    } else if (this.officer.companyDetails.jobRole === 'Collection Center Manager') {
      rolePrefix = 'CCM';
    } else if (this.officer.companyDetails.jobRole === 'Customer Officer') {
      rolePrefix = 'CUO';
    } else {
      rolePrefix = 'COO';
    }



    this.getUpdateLastID(rolePrefix).then((lastId) => {
      console.log(rolePrefix);
      
      this.upateEmpID = rolePrefix + lastId;
      console.log("update EMPID", this.upateEmpID);
    });
  }

  getLastID(role: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.collectionCenterSrv.getForCreateId(role).subscribe(
        (res) => {
          this.lastID = res.result.empId;
          const lastId = res.result.empId;
          resolve(lastId); // Resolve the Promise with the empId
        },
        (error) => {
          console.error('Error fetching last ID:', error);
          reject(error);
        }
      );
    });
  }

  getUpdateLastID(role: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.collectionCenterSrv.getForCreateId(role).subscribe(
        (res) => {
          let lastId;
          if (this.selectJobRole === this.officer.companyDetails.jobRole) {
            lastId = this.officer.companyDetails.empId;
            this.UpdatelastID = lastId;
            console.log(lastId);
            
          } else {
            this.UpdatelastID = res.result.empId;
            lastId = res.result.empId
            console.log(lastId);

          }
          ;
          resolve(lastId); // Resolve the Promise with the empId
        },
        (error) => {
          console.error('Error fetching last ID:', error);
          reject(error);
        }
      );
    });
  }


}

class Personal {
  firstNameEnglish!: string;
  firstNameSinhala!: string;
  firstNameTamil!: string;
  lastNameEnglish!: string;
  lastNameSinhala!: string;
  lastNameTamil!: string;
  phoneNumber01Code!: string;
  phoneNumber01!: string;
  phoneNumber02Code!: string;
  phoneNumber02!: string;
  nic!: string;
  email!: string;
  password!: string;
  passwordUpdated!: string;
  houseNumber!: string;
  streetName!: string;
  city!: string;
  district!: string;
  province!: string;
  country!: string;
  languages: string = '';
  centerId!: string
  image!: any
}

class Bank {
  accHolderName!: string;
  accNumber!: string;
  bankName!: string;
  branchName!: string;
}

class Company {
  companyNameEnglish!: string;
  companyNameSinhala!: string;
  companyNameTamil!: string;
  jobRole: string = 'Collection Officer'
  empId!: string
  IRMname!: string;
  companyEmail!: string;
  assignedDistrict!: string;
  employeeType!: string;
}

class CollectionCenter {
  id!: number
  centerName!: string

}
