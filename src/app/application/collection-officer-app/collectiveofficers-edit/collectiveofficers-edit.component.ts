import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { CollectionOfficerService } from '../../../services/collection-officer/collection-officer.service';

@Component({
  selector: 'app-collectiveofficers-edit',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, CommonModule, FormsModule],
  templateUrl: './collectiveofficers-edit.component.html',
  styleUrl: './collectiveofficers-edit.component.css'
})
export class CollectiveofficersEditComponent {
  itemId!: number;
  selectedPage: 'pageOne' | 'pageTwo' = 'pageOne';
  selectedFile: File | null = null;
  selectedFileName!: string
  selectedImage: string | ArrayBuffer | null = null;
  isLoading = false;
  selectedLanguages: string[] = [];
  selectJobRole!: string
  personalData: Personal = new Personal();
  CompanyData: Company[] = []
  collectionCenterData: CollectionCenter[] = []
  collectionManagerData: CollectionManager[] = []
  lastID!: string
  empType!: string;
  cenId!: number
  comId!: number;
  initiateJobRole!: string;
  initiateId!: string;
  errorMessage: string = '';
  img!: string;

  

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


   constructor(
      private fb: FormBuilder,
      private http: HttpClient,
      private route: ActivatedRoute,
      private router: Router,
      private collectionCenterSrv: CollectionCenterService,
      private collectionOfficerService: CollectionOfficerService,
    ) {}



  ngOnInit() {
    this.itemId = this.route.snapshot.params['id'];
    console.log('Item ID: ', this.itemId);

    
  
    if (this.itemId) {
      this.isLoading = true;
  
      this.collectionCenterSrv.getOfficerReportById(this.itemId).subscribe({
        next: (response: any) => {
          console.log('Response: ', response);
  
          // Map the response data to the Personal class
          const officerData = response.officerData[0];
          console.log('hi hi: ', response.officerData[0].empId);
          
          this.personalData.empId = officerData.empId ;
          this.personalData.jobRole = officerData.jobRole || '';
          this.personalData.firstNameEnglish = officerData.firstNameEnglish || '';
          this.personalData.firstNameSinhala = officerData.firstNameSinhala || '';
          this.personalData.firstNameTamil = officerData.firstNameTamil || '';
          this.personalData.lastNameEnglish = officerData.lastNameEnglish || '';
          this.personalData.lastNameSinhala = officerData.lastNameSinhala || '';
          this.personalData.lastNameTamil = officerData.lastNameTamil || '';
          this.personalData.phoneCode01 = officerData.phoneCode01 || '+94';
          this.personalData.phoneNumber01 = officerData.phoneNumber01 || '';
          this.personalData.phoneCode02 = officerData.phoneCode02 || '+94';
          this.personalData.phoneNumber02 = officerData.phoneNumber02 || '';
          this.personalData.nic = officerData.nic || '';
          this.personalData.email = officerData.email || '';
          this.personalData.houseNumber = officerData.houseNumber || '';
          this.personalData.streetName = officerData.streetName || '';
          this.personalData.city = officerData.city || '';
          this.personalData.district = officerData.district || '';
          this.personalData.province = officerData.province || '';
          this.personalData.languages = officerData.languages || '';
          this.personalData.companyId = officerData.companyId || '';
          this.personalData.centerId = officerData.centerId || '';
          this.personalData.bankName = officerData.bankName || '';
          this.personalData.branchName = officerData.branchName || '';
          this.personalData.accHolderName = officerData.accHolderName || '';
          this.personalData.accNumber = officerData.accNumber || '';
          this.personalData.empType = officerData.empType || '';
          this.personalData.irmId = officerData.irmId || '';
          this.personalData.image = officerData.image || '';
  
          // Additional fields
          this.selectedLanguages = this.personalData.languages.split(',');
          this.empType = this.personalData.empType;
          this.lastID = this.personalData.empId.slice(-5);
          this.cenId = this.personalData.centerId;
          this.comId = this.personalData.companyId;
          this.initiateJobRole = officerData.jobRole || '';
          this.initiateId = officerData.empId.slice(-5);

          console.log('This is the initiate Id',this.initiateJobRole)
          console.log('This is the initiate JobRole',this.initiateId)
  
          console.log('Mapped Personal Data: ', this.personalData);
          console.log('laguages', this.selectedLanguages);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching officer details:', error);
          this.isLoading = false;
        },
      });
    }

    this.getAllCollectionCetnter()
    this.getAllCompanies()
    this.EpmloyeIdCreate()
    this.getAllCollectionManagers();
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



    triggerFileInput(event: Event): void {
      event.preventDefault();
      const fileInput = document.getElementById('imageUpload');
      fileInput?.click();
    }


    updateEmployeeType(selectedType: string): void {
      this.empType = selectedType;
      this.personalData.empType = selectedType; // Update personalData.empType dynamically
      console.log('Selected Employee Type:', this.empType);
    }



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







    EpmloyeIdCreate() {


      

      // this.getAllCollectionManagers();
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


      if(this.personalData.jobRole === this.initiateJobRole){
        console.log('is');
        this.lastID =  this.initiateId;
      }else{
        console.log('no');
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
    
     
    }



    getAllCollectionManagers() {
      console.log('Company ID:', this.comId);
      this.collectionCenterSrv.getAllManagerList(this.comId , this.cenId).subscribe(
        (res) => {
          this.collectionManagerData = res
        }
      )
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




      nextFormCreate(page: 'pageOne' | 'pageTwo'){
        this.selectedPage = page;
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
            this.personalData.province = selected.province;
          }
        }
      }


       nextForm(page: 'pageOne' | 'pageTwo') {
         
      
          this.selectedPage = page;
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




        onCheckboxChange(language: string, event: Event): void {
          const isChecked = (event.target as HTMLInputElement).checked;
      
          if (isChecked) {
            // Add the language to the selectedLanguages array
            if (!this.selectedLanguages.includes(language)) {
              this.selectedLanguages.push(language);
            }
          } else {
            // Remove the language from the selectedLanguages array
            this.selectedLanguages = this.selectedLanguages.filter(
              (lang) => lang !== language
            );
          }
          console.log('Selected Languages:', this.selectedLanguages);
        }



        


         onSubmit() {
            console.log(this.personalData); // Logs the personal data with updated languages
            console.log('hii', this.personalData.empType);
          
            // Show a confirmation dialog before proceeding
            Swal.fire({
              title: 'Are you sure?',
              text: 'Do you want to create the collection officer?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Yes, create it!',
              cancelButtonText: 'No, cancel',
              reverseButtons: true
            }).then((result) => {
              if (result.isConfirmed) {
                // Proceed with submission if user clicks 'Yes'
                this.collectionOfficerService.editCollectiveOfficer(this.personalData, this.itemId, this.selectedImage).subscribe(
                  (res: any) => {
                    
          
                    Swal.fire('Success', 'Collection Officer Created Successfully', 'success');
                    this.router.navigate(['/steckholders/collective-officer']);
                  },
                  (error: any) => {
                    this.errorMessage = error.error.error || 'An unexpected error occurred'; // Update the error message
                    Swal.fire('Error', this.errorMessage, 'error');
                  }
                );
              } else {
                // If user clicks 'No', do nothing or show a cancellation message
                Swal.fire('Cancelled', 'Your action has been cancelled', 'info');
              }
            });
          }
        




}


class Personal {
  jobRole!: string;
  empId!: any;
  centerId!: number;
  irmId!: number;
  empType!: string ;
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
  companyId! : number;
  image!: string;
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
