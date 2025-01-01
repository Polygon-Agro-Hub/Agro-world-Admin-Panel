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
  
 
  collectionCenterData: CollectionCenter[] = []
  CompanyData: Company[] = []
  collectionManagerData: CollectionManager[] = []
  itemId: number | null = null;
  isLoading = false;
  selectedFileName!: string
  selectedImage: string | ArrayBuffer | null = null;
  lastID!: string
  UpdatelastID!: string
  selectJobRole!: string
  upateEmpID!: string

  districts = [
    { name: 'Ampara', province: 'Eastern' },
    { name: 'Anuradhapura', province: 'North Central' },
    { name: 'Badulla', province: 'Uva' },
    { name: 'Batticaloa', province: 'Eastern' },
    { name: 'Colombo', province: 'Western' },
    { name: 'Galle', province: 'Southern' },
    { name: 'Gampaha', province: 'Western' },
    { name: 'Hambantota', province: 'Southern' },
    { name: 'Jaffna', province: 'Northern' },
    { name: 'Kalutara', province: 'Western' },
    { name: 'Kandy', province: 'Central' },
    { name: 'Kegalle', province: 'Sabaragamuwa' },
    { name: 'Kilinochchi', province: 'Northern' },
    { name: 'Kurunegala', province: 'North Western' },
    { name: 'Mannar', province: 'Northern' },
    { name: 'Matale', province: 'Central' },
    { name: 'Matara', province: 'Southern' },
    { name: 'Monaragala', province: 'Uva' },
    { name: 'Mullaitivu', province: 'Northern' },
    { name: 'Nuwara Eliya', province: 'Central' },
    { name: 'Polonnaruwa', province: 'North Central' },
    { name: 'Puttalam', province: 'North Western' },
    { name: 'Rathnapura', province: 'Sabaragamuwa' },
    { name: 'Trincomalee', province: 'Eastern' },
    { name: 'Vavuniya', province: 'Northern' },
  ];
  
  

  officer: { collectionOfficer: { centerId: any, firstNameEnglish: string, firstNameSinhala: string, firstNameTamil: string, lastNameEnglish: string, lastNameSinhala: string, lastNameTamil: string, phoneNumber01: string, phoneNumber02: string, image: string, QRcode: string, nic: string, email: string, address: { houseNumber: string, streetName: string, city: string, district: string, province: string, country: string }, languages: string }, companyDetails: { companyNameEnglish: string, companyNameSinhala: string, companyNameTamil: string, jobRole: string, empId: string, IRMname: string, companyEmail: string, assignedDistrict: string, employeeType: string, employeeId: string }, bankDetails: { accHolderName: string, accNumber: string, bankName: string, branchName: string } } = {
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
      employeeType: '',
      employeeId: ''
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
      centerName: ['', Validators.required],
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

  selectedLanguages: string[] = [];

  onCheckboxChange1(lang: string, event: any) {
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
    console.log('hii',this.personalData.enpType);
    
   
    

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

      this.collectionOfficerService.createCollectiveOfficer(this.personalData).subscribe(
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

  onCancel() {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after canceling!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'No, Keep Editing',
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/steckholders/collective-officer'])
      }
    });
  }
  

  nextForm(page: 'pageOne' | 'pageTwo') {
    if (page === 'pageTwo') {
      
      const missingFields: string[] = [];

      if (!this.officer.collectionOfficer.firstNameEnglish) missingFields.push('First Name (English)');
      if (!this.officer.collectionOfficer.firstNameSinhala) missingFields.push('First Name (Sinhala)');
      if (!this.officer.collectionOfficer.firstNameTamil) missingFields.push('First Name (Tamil)');
      if (!this.officer.collectionOfficer.lastNameEnglish) missingFields.push('Last Name (English)');
      if (!this.officer.collectionOfficer.lastNameSinhala) missingFields.push('Last Name (Sinhala)');
      if (!this.officer.collectionOfficer.lastNameTamil) missingFields.push('Last Name (Tamil)');
      // if (!this.personalData.phoneNumber01Code) missingFields.push('Phone Number 01 Code');
      // if (!this.personalData.phoneNumber01) missingFields.push('Phone Number 01');
      // if (!this.personalData.phoneNumber02Code) missingFields.push('Phone Number 02 Code');
      // if (!this.personalData.phoneNumber02) missingFields.push('Phone Number 02');
      if (!this.officer.collectionOfficer.nic) missingFields.push('NIC');
      if (!this.officer.collectionOfficer.email) missingFields.push('Email');
      if (!this.officer.collectionOfficer.address.houseNumber) missingFields.push('House Number');
      if (!this.officer.collectionOfficer.address.streetName) missingFields.push('Street Name');
      if (!this.officer.collectionOfficer.address.city) missingFields.push('City');
      if (!this.officer.collectionOfficer.address.district) missingFields.push('District');
      if (!this.officer.collectionOfficer.address.province) missingFields.push('Province');
      if (!this.officer.collectionOfficer.address.country) missingFields.push('Country');
      
  
      if (missingFields.length > 0) {
        Swal.fire({
          icon: 'error',
          title: 'Please fill all fields',
          html: `The following fields are missing:<br><ul>${missingFields
            .map(field => `<li>${field}</li>`)
            .join('')}</ul>`
        });
        return;
      }
    }

    this.selectedPage = page;
  }



  nextFormCreate(page: 'pageOne' | 'pageTwo'){
    this.selectedPage = page;
  }


  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.itemId = params['id'] ? +params['id'] : null;
      console.log('Received item ID:', this.itemId);
    });
    this.getAllCollectionCetnter()
    this.getAllCompanies()
    this.EpmloyeIdCreate()

    if (this.itemId) {

      this.isLoading = true;
      this.collectionCenterSrv.getOfficerReportById(this.itemId).subscribe({
        next: (response: any) => {
          this.officer = response.officerData;
          this.selectedLanguages = response.officerData.collectionOfficer.languages.split(',');
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

    
  }



  onCheckboxChange(language: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
  
    if (isChecked) {
      // Add the language to the selected list
      if (!this.selectedLanguages.includes(language)) {
        this.selectedLanguages.push(language);
      }
    } else {
      // Remove the language from the selected list
      this.selectedLanguages = this.selectedLanguages.filter(
        (lang) => lang !== language
      );
    }
  
    // Update the officer's languages as a comma-separated string
    this.officer.collectionOfficer.languages = this.selectedLanguages.join(',');
    console.log(this.officer.collectionOfficer.languages); // Debugging: Log the updated string
  }

  getAllCollectionCetnter() {
    this.collectionCenterSrv.getAllCollectionCenter().subscribe(
      (res) => {
        this.collectionCenterData = res
      }
    )
  }

  getAllCompanies() {
    this.collectionCenterSrv.getAllCompanyList().subscribe(
      (res) => {
        this.CompanyData = res
      }
    )
  }

  getAllCollectionManagers() {
    this.collectionCenterSrv.getAllManagerList(this.personalData.companyId, this.personalData.centerId).subscribe(
      (res) => {
        this.collectionManagerData = res
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
      languages: this.officer.collectionOfficer.languages,
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

    this.getAllCollectionManagers();
    let rolePrefix: string | undefined;
  
    // Map job roles to their respective prefixes
    const rolePrefixes: { [key: string]: string } = {
      'Collection Center Head': 'CCH',
      'Collection Center Manager': 'CCM',
      'Customer Officer': 'CUO',
      'Collection Officer': 'COO',
    };
  
    // Get the prefix based on the job role
    rolePrefix = rolePrefixes[this.personalData.jobRole];
  
    if (!rolePrefix) {
      console.error(`Invalid job role: ${this.personalData.jobRole}`);
      return; // Exit if the job role is invalid
    }
  
    // Fetch the last ID and assign a new Employee ID
    this.getLastID(rolePrefix)
      .then((lastID) => {
        this.personalData.empId = rolePrefix + lastID;
      })
      .catch((error) => {
        console.error('Error fetching last ID:', error);
      });
  }
  


  UpdateEpmloyeIdCreate() {
    let rolePrefix: string | undefined;
  
    // Map job roles to their respective prefixes
    const rolePrefixes: { [key: string]: string } = {
      'Collection Center Head': 'CCH',
      'Collection Center Manager': 'CCM',
      'Customer Officer': 'CUO',
      'Collection Officer': 'COO',
    };
  
    // Get the prefix based on the job role
    rolePrefix = rolePrefixes[this.officer.companyDetails.jobRole];
  
    if (!rolePrefix) {
      console.error(`Invalid job role: ${this.officer.companyDetails.jobRole}`);
      return; // Exit if the job role is invalid
    }
  
    // Fetch the updated last ID and assign the new Employee ID
    this.getUpdateLastID(rolePrefix)
      .then((lastId) => {
        this.upateEmpID = rolePrefix + lastId;
        console.log("Updated EMP ID:", this.upateEmpID);
      })
      .catch((error) => {
        console.error('Error fetching updated last ID:', error);
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



  updateProvince(event: Event): void {
    const target = event.target as HTMLSelectElement; // Cast to HTMLSelectElement
    const selectedDistrict = target.value;
  
    const selected = this.districts.find(district => district.name === selectedDistrict);

    if(this.itemId === null){

      if (selected) {
        this.personalData.province = selected.province;
      } else {
        this.personalData.province = ''; // Clear if no matching district is found
      }

    }else{


      if (selected) {
        this.officer.collectionOfficer.address.province = selected.province;
      }


    }

   
  }
  
  

}

class Personal {
  jobRole: string = 'Collection Center Manager';
  empId!: string;
  centerId!: number;
  irmId!: number;
  enpType!: string ;
  firstNameEnglish!: string;
  firstNameSinhala!: string;
  firstNameTamil!: string;
  lastNameEnglish!: string;
  lastNameSinhala!: string;
  lastNameTamil!: string;
  phoneCode01: string = '+94';
  phoneNumber01!: string;
  phoneCode02: string = '+94';
  phoneNumber02!: string;
  nic!: string;
  email!: string;
  new!: string;
  password!: string;
  passwordUpdated!: string;
  houseNumber!: string;
  streetName!: string;
  city!: string;
  district!: string;
  province!: string;
  country: string = 'Sri Lanka';
  languages: string = '';
  companyId! : string;
  image!: any;
  accHolderName!: any;
  accNumber!: any;
  bankName!: string;
  branchName!: string;
  
}





class CollectionCenter {
  id!: number
  centerName!: string

}


class CollectionManager {
  id!: number
  firstNameEnglish!: string
}

class Company {
  id!: number
  companyNameEnglish!: string

}
