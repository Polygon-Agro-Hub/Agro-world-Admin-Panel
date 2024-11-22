import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { CollectionOfficerService } from '../../../services/collection-officer/collection-officer.service';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { ActivatedRoute } from '@angular/router';







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
  collectionCenterData:CollectionCenter[]=[]
  itemId: number | null = null;
  isLoading = false;
  officer: { collectionOfficer: { centerId:any, firstNameEnglish: string,firstNameSinhala: string, firstNameTamil : string, lastNameEnglish: string, lastNameSinhala: string, lastNameTamil: string, phoneNumber01: string, phoneNumber02: string, image: string, QRcode: string, nic: string, email: string, address:{houseNumber: string, streetName : string, city: string, district: string, province: string, country: string}, languages:string }, companyDetails: {companyNameEnglish: string, companyNameSinhala: string, companyNameTamil: string, jobRole: string, IRMname: string, companyEmail: string, assignedDistrict: string , employeeType: string}, bankDetails: {accHolderName: string, accNumber: string, bankName: string, branchName: string}} = {
    collectionOfficer: {
      centerId: '',
      firstNameEnglish: '',
      firstNameSinhala: '',
      firstNameTamil: '',
      lastNameEnglish:'',
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
      companyNameEnglish:'',
      companyNameSinhala: '',
      companyNameTamil: '',
      jobRole: '',
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
    private route: ActivatedRoute
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

      // Send the officer data using the service
      this.collectionOfficerService.createCollectiveOfficer(this.personalData, this.bankData, this.companyData).subscribe(
        (res: any) => {
          this.officerId = res.officerId;
          Swal.fire('Success', 'Collective Officer Created Successfully', 'success');
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

    if(this.itemId){
       
      this.isLoading = true;
      this.collectionCenterSrv.getOfficerReportById(this.itemId).subscribe({
        next: (response: any) => {
          this.officer = response.officerData;
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching crop group details:', error);
          this.isLoading = false;
        },
      });
    }
  }

  getAllCollectionCetnter(){
    this.collectionCenterSrv.getAllCollectionCenter().subscribe(
      (res)=>{        
        this.collectionCenterData = res
      }
    )
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
  IRMname!: string;
  companyEmail!: string;
  assignedDistrict!: string;
  employeeType!: string;
}

class CollectionCenter {
  id!:number
  centerName!:string

}
