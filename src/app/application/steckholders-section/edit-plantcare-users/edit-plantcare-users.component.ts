// import { Router, ActivatedRoute } from '@angular/router';
// import { Component, OnInit } from '@angular/core';
// import {
//   HttpClient,
//   HttpClientModule,
//   HttpHeaders,
// } from '@angular/common/http';
// import {
//   FormBuilder,
//   FormGroup,
//   FormsModule,
//   ReactiveFormsModule,
//   Validators,
// } from '@angular/forms';
// import Swal from 'sweetalert2';
// import { environment } from '../../../environment/environment';
// import { CommonModule } from '@angular/common';
// import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
// import { TokenService } from '../../../services/token/services/token.service';
// import { DropdownModule } from 'primeng/dropdown';

// interface PlantCareUser {
//   id: number;
//   firstName: string;
//   lastName: string;
//   phoneNumber: string;
//   NICnumber: string;
//   profileImage: string;
//   created_at: string;
//   district: string;
//   membership: string;
//   accNumber: any;
//   accHolderName: String;
//   bankName: String;
//   branchName: String;
// }

// interface Branch {
//   bankID: number;
//   ID: number;
//   name: string;
// }

// interface Bank {
//   ID: number;
//   name: string;
// }

// interface BranchesData {
//   [key: string]: Branch[];
// }

// @Component({
//   selector: 'app-edit-plantcare-users',
//   standalone: true,
//   imports: [
//     ReactiveFormsModule,
//     HttpClientModule,
//     CommonModule,
//     FormsModule,
//     LoadingSpinnerComponent,
//     DropdownModule,
//   ],
//   templateUrl: './edit-plantcare-users.component.html',
//   styleUrl: './edit-plantcare-users.component.css',
// })
// export class EditPlantcareUsersComponent implements OnInit {
//   plantCareUser: PlantCareUser[] = [];
//   selectedFile: File | null = null;
//   userForm: FormGroup;
//   isView: boolean = false;
//   isDisabled: boolean = true;
//   selectedFileName!: string;
//   imagePreview: string = '';
//   selectedImage: File | null = null;
//   isLoading = false;
//   selectedBankId: number | null = null;
//   itemId: number | null = null;
//   branches: Branch[] = [];
//   banks: Bank[] = [];
//   allBranches: BranchesData = {};
//   selectedBranchId: number | null = null;
//   invalidFields: Set<string> = new Set();
//   bankOptions: any[] = [];
//   branchOptions: any[] = [];
//   districtOptions: any[] = [];

//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private http: HttpClient,
//     private route: ActivatedRoute,
//     private tokenService: TokenService
//   ) {
//     this.userForm = this.fb.group({
//       firstName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)]],
//       lastName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)]],
//       phoneNumber: [
//         '',
//         [Validators.required, Validators.pattern(/^\+947\d{8}$/)],
//       ],
//       NICnumber: [
//         '',
//         [Validators.required, Validators.pattern(/^(\d{12}|\d{9}[V])$/)],
//       ],
//       district: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)]],
//       membership: [
//         '',
//         [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)],
//       ],
//       language: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)]],
//       profileImage: [''],
//       accHolderName: [''],
//       accNumber: ['', [Validators.pattern(/^[0-9]+$/)]],
//       bankName: ['', Validators.required],
//       branchName: ['', Validators.required],
//     });
//   }

//   district = [
//     { districtName: 'Colombo' },
//     { districtName: 'Kalutara' },
//     { districtName: 'Gampaha' },
//     { districtName: 'Kandy' },
//     { districtName: 'Matale' },
//     { districtName: 'Nuwara Eliya' },
//     { districtName: 'Galle' },
//     { districtName: 'Matara' },
//     { districtName: 'Hambantota' },
//     { districtName: 'Jaffna' },
//     { districtName: 'Mannar' },
//     { districtName: 'Vavuniya' },
//     { districtName: 'Kilinochchi' },
//     { districtName: 'Mullaitivu' },
//     { districtName: 'Batticaloa' },
//     { districtName: 'Ampara' },
//     { districtName: 'Trincomalee' },
//     { districtName: 'Badulla' },
//     { districtName: 'Moneragala' },
//     { districtName: 'Kurunegala' },
//     { districtName: 'Puttalam' },
//     { districtName: 'Anuradhapura' },
//     { districtName: 'Polonnaruwa' },
//     { districtName: 'Rathnapura' },
//     { districtName: 'Kegalle' },
//   ];

//   membership = [
//     { membershipName: 'Basic' },
//     { membershipName: 'Pro' },
//   ];

//   language = [
//     { languageName: 'Sinhala' },
//     { languageName: 'English' },
//     { languageName: 'Tamil' },
//   ];

//   onlyNumberKey(event: KeyboardEvent) {
//     const charCode = event.which ? event.which : event.keyCode;
//     if (charCode > 31 && (charCode < 48 || charCode > 57)) {
//       event.preventDefault();
//     }
//     return true;
//   }

//   back(): void {
//     this.router.navigate(['/steckholders/action/farmers']);
//   }

//   ngOnInit() {
//     this.loadBanks();
//     this.loadBranches();
//     this.setupDistrictOptions(); // Add this line
//     this.route.queryParams.subscribe((params) => {
//       this.itemId = params['id'] ? +params['id'] : null;
//       this.isView = params['isView'] === 'true';
//     });
//     if (this.itemId) {
//       this.loadUserData(this.itemId);
//     }
//   }

//   setupDistrictOptions() {

//     this.district = this.district.sort((a, b) =>
//       a.districtName.localeCompare(b.districtName)
//     );

//     this.districtOptions = this.district.map(district => ({
//       label: district.districtName,
//       value: district.districtName
//     }));
//   }

//   loadUserData(id: number) {
//     const token = this.tokenService.getToken();

//     if (!token) {
//       return;
//     }

//     const headers = new HttpHeaders({
//       Authorization: `Bearer ${token}`,
//     });

//     this.isLoading = true;
//     this.http
//       .get<PlantCareUser>(`${environment.API_URL}auth/get-user-by-id/${id}`, {
//         headers,
//       })
//       .subscribe(
//         (data) => {
//           this.isLoading = false;
//           this.userForm.patchValue(data);
//           this.imagePreview = data.profileImage;

//           if (data.bankName) {
//             this.selectedBankId =
//               this.banks.find((b) => b.name === data.bankName)?.ID || null;
//             if (this.selectedBankId) {
//               this.branches =
//                 this.allBranches[this.selectedBankId.toString()] || [];
//             }
//             this.selectedBranchId =
//               this.branches.find((b) => b.name === data.branchName)?.ID || null;
//           }
//         },
//         (error) => {
//           this.isLoading = false;
//         }
//       );
//   }

//   onImageSelected(event: Event) {
//     const file = (event.target as HTMLInputElement).files?.[0];
//     if (file) {
//       this.selectedImage = file;
//       const reader = new FileReader();
//       reader.onload = () => {
//         this.imagePreview = reader.result as string;
//       };
//       reader.readAsDataURL(file);
//     }
//   }

//   handleSpaceRestrictions(event: KeyboardEvent): boolean {
//     const charCode = event.which ? event.which : event.keyCode;
//     const currentValue = (event.target as HTMLInputElement).value;

//     // If space key is pressed (charCode 32)
//     if (charCode === 32) {
//       // Block space at the beginning
//       if (currentValue.length === 0) {
//         event.preventDefault();
//         return false;
//       }

//       // Block space if no letters exist yet (only spaces)
//       if (!/[a-zA-Z]/.test(currentValue)) {
//         event.preventDefault();
//         return false;
//       }

//       // Block consecutive spaces
//       if (currentValue.charAt(currentValue.length - 1) === ' ') {
//         event.preventDefault();
//         return false;
//       }
//     }

//     return true;
//   }

//   onNameInput(event: any, fieldName: string): void {
//     let value = event.target.value;
//     value = value.replace(/^\s+/, '');
//     value = value.replace(/\s{2,}/g, ' ');

//     if (value.length > 0) {
//       value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
//       this.userForm.get(fieldName)?.setValue(value, { emitEvent: false });
//       event.target.value = value;
//     }
//   }

//   onNameKeyPress(event: KeyboardEvent): void {
//     const charCode = event.which ? event.which : event.keyCode;

//     if (!this.handleSpaceRestrictions(event)) {
//       return;
//     }

//     if (
//       (charCode < 65 || charCode > 90) && // A-Z
//       (charCode < 97 || charCode > 122) && // a-z
//       charCode !== 8 &&  // backspace
//       charCode !== 9 &&  // tab
//       charCode !== 46 && // delete
//       charCode !== 37 && // left arrow
//       charCode !== 39 && // right arrow
//       charCode !== 32    // space (now handled by handleSpaceRestrictions)
//     ) {
//       event.preventDefault();
//     }
//   }


//   onAccountHolderNameKeyPress(event: KeyboardEvent): void {
//     const charCode = event.which ? event.which : event.keyCode;

//     if (!this.handleSpaceRestrictions(event)) {
//       return;
//     }

//     if (
//       (charCode < 65 || charCode > 90) && 
//       (charCode < 97 || charCode > 122) && 
//       charCode !== 32 && 
//       charCode !== 8 &&  
//       charCode !== 9 && 
//       charCode !== 46 && 
//       charCode !== 37 && 
//       charCode !== 39 
//     ) {
//       event.preventDefault();
//     }
//   }


//   onAccountHolderNameInput(event: any): void {
//     let value = event.target.value;
//     value = value.replace(/[^a-zA-Z\s]/g, '');

//     value = value.replace(/^\s+/, '');


//     value = value.replace(/\s{2,}/g, ' ');

//     value = value.replace(/\b\w/g, (char: string) => char.toUpperCase());

//     this.userForm.get('accHolderName')?.setValue(value, { emitEvent: false });
//     event.target.value = value;
//   }


//   onAccountNumberKeyPress(event: KeyboardEvent): void {
//     const charCode = event.which ? event.which : event.keyCode;
//     if (
//       (charCode < 48 || charCode > 57) && // 0-9
//       charCode !== 8 && // backspace
//       charCode !== 9 && // tab
//       charCode !== 46 && // delete
//       charCode !== 37 && // left arrow
//       charCode !== 39 // right arrow
//     ) {
//       event.preventDefault();
//     }
//   }

//   onAccountNumberInput(event: any): void {
//     let value = event.target.value;

//     value = value.replace(/[^0-9]/g, '');
//     this.userForm.get('accNumber')?.setValue(value, { emitEvent: false });
//     event.target.value = value;
//   }

//   onSubmit() {
//     if (this.userForm.valid) {
//       if (this.selectedImage) {
//         const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
//         if (!validImageTypes.includes(this.selectedImage.type)) {
//           Swal.fire({
//             title: 'Invalid File!',
//             text: 'Please upload a valid image file (jpg, png, gif).',
//             icon: 'error',
//             confirmButtonText: 'OK',
//           });
//           return;
//         }
//       }

//       const token = this.tokenService.getToken();
//       if (!token) {
//         return;
//       }

//       Swal.fire({
//         title: 'Are you sure?',
//         text: 'Do you really want to update this plant care user?',
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonColor: '#3085d6',
//         cancelButtonColor: '#d33',
//         confirmButtonText: 'Yes, update it!',
//         cancelButtonText: 'Cancel',
//       }).then((result) => {
//         if (result.isConfirmed) {
//           const headers = new HttpHeaders({
//             Authorization: `Bearer ${token}`,
//           });

//           const formData = new FormData();
//           formData.append(
//             'firstName',
//             this.userForm.get('firstName')?.value || ''
//           );
//           formData.append(
//             'lastName',
//             this.userForm.get('lastName')?.value || ''
//           );
//           formData.append(
//             'phoneNumber',
//             this.userForm.get('phoneNumber')?.value || ''
//           );
//           formData.append(
//             'NICnumber',
//             this.userForm.get('NICnumber')?.value || ''
//           );
//           formData.append(
//             'district',
//             this.userForm.get('district')?.value || ''
//           );
//           formData.append(
//             'membership',
//             this.userForm.get('membership')?.value || ''
//           );
//           formData.append(
//             'language',
//             this.userForm.get('language')?.value || ''
//           );

//           formData.append(
//             'accHolderName',
//             this.userForm.get('accHolderName')?.value || ''
//           );
//           formData.append(
//             'accNumber',
//             this.userForm.get('accNumber')?.value || ''
//           );
//           formData.append(
//             'bankName',
//             this.userForm.get('bankName')?.value || ''
//           );
//           formData.append(
//             'branchName',
//             this.userForm.get('branchName')?.value || ''
//           );

//           if (this.selectedImage) {
//             formData.append('image', this.selectedImage);
//           }

//           this.isLoading = true;
//           this.http
//             .put(
//               `${environment.API_URL}auth/update-plant-care-user/${this.itemId}`,
//               formData,
//               { headers }
//             )
//             .subscribe(
//               (data: any) => {
//                 this.isLoading = false;
//                 this.userForm.patchValue(data);
//                 Swal.fire(
//                   'Updated!',
//                   'Plant care user has been updated.',
//                   'success'
//                 ).then(() => {
//                   this.router.navigate(['/steckholders/action/farmers']);
//                 });
//                 this.loadUserData(this.itemId!);
//               },
//               (error) => {
//                 this.isLoading = false;
//                 let errorMessage =
//                   'There was an error updating the plant care user.';
//                 if (error.error?.error) {
//                   errorMessage = error.error.error;
//                 } else if (error.error?.message) {
//                   errorMessage = error.error.message;
//                 } else if (error.status === 400) {
//                   errorMessage =
//                     'Invalid data sent to server. Please check your inputs.';
//                 }
//                 Swal.fire('Error!', errorMessage, 'error');
//               }
//             );
//         }
//       });
//     } else {
//       Object.keys(this.userForm.controls).forEach((key) => {
//         const control = this.userForm.get(key);
//         control!.markAsTouched();
//       });
//     }
//   }

//   onCancel() {
//     this.router.navigate(['/steckholders/action/farmers']);
//   }

//   onSubmitCreate() {
//     if (this.userForm.valid) {
//       if (this.selectedImage) {
//         const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
//         if (!validImageTypes.includes(this.selectedImage.type)) {
//           Swal.fire({
//             title: 'Invalid File!',
//             text: 'Please upload a valid image file (jpg, png, gif).',
//             icon: 'error',
//             confirmButtonText: 'OK',
//           });
//           return;
//         }
//       }

//       const token = this.tokenService.getToken();
//       if (!token) {
//         return;
//       }

//       Swal.fire({
//         title: 'Are you sure?',
//         text: 'Do you really want to create a new plant care user?',
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonColor: '#3085d6',
//         cancelButtonColor: '#d33',
//         confirmButtonText: 'Yes, create it!',
//         cancelButtonText: 'Cancel',
//       }).then((result) => {
//         if (result.isConfirmed) {
//           const headers = new HttpHeaders({
//             Authorization: `Bearer ${token}`,
//           });

//           const formData = new FormData();
//           formData.append(
//             'firstName',
//             this.userForm.get('firstName')?.value || ''
//           );
//           formData.append(
//             'lastName',
//             this.userForm.get('lastName')?.value || ''
//           );
//           formData.append(
//             'phoneNumber',
//             this.userForm.get('phoneNumber')?.value || ''
//           );
//           formData.append(
//             'NICnumber',
//             this.userForm.get('NICnumber')?.value || ''
//           );
//           formData.append(
//             'district',
//             this.userForm.get('district')?.value || ''
//           );
//           formData.append(
//             'membership',
//             this.userForm.get('membership')?.value || ''
//           );
//           formData.append(
//             'language',
//             this.userForm.get('language')?.value || ''
//           );

//           formData.append(
//             'accNumber',
//             this.userForm.get('accNumber')?.value || ''
//           );
//           formData.append(
//             'accHolderName',
//             this.userForm.get('accHolderName')?.value || ''
//           );
//           formData.append(
//             'bankName',
//             this.userForm.get('bankName')?.value || ''
//           );
//           formData.append(
//             'branchName',
//             this.userForm.get('branchName')?.value || ''
//           );

//           if (this.selectedImage) {
//             formData.append('image', this.selectedImage);
//           }

//           this.isLoading = true;
//           this.http
//             .post(
//               `${environment.API_URL}auth/create-plant-care-user`,
//               formData,
//               { headers }
//             )
//             .subscribe(
//               (response: any) => {
//                 this.isLoading = false;
//                 Swal.fire(
//                   'Created!',
//                   'A new plant care user has been created.',
//                   'success'
//                 ).then(() => {
//                   this.router.navigate(['/steckholders/action/farmers']);
//                 });

//                 this.userForm.reset();
//                 this.imagePreview = '';
//                 this.selectedImage = null;
//                 this.itemId = null;
//               },
//               (error) => {
//                 this.isLoading = false;
//                 let errorMessage =
//                   'There was an error creating the plant care user.';
//                 if (error.error?.error) {
//                   errorMessage = error.error.error;
//                 } else if (error.status === 400) {
//                   errorMessage = 'Validation error. Please check your inputs.';
//                 }

//                 Swal.fire('Error!', errorMessage, 'error');
//               }
//             );
//         }
//       });
//     } else {
//       Object.keys(this.userForm.controls).forEach((key) => {
//         const control = this.userForm.get(key);
//         control!.markAsTouched();
//       });
//     }
//   }

//   triggerFileInput(event: Event): void {
//     event.preventDefault();
//     const fileInput = document.getElementById('imageUpload');
//     fileInput?.click();
//   }

//   onFileSelected(event: any): void {
//     const file: File = event.target.files[0];

//     if (file) {
//       if (file.size > 5000000) {
//         Swal.fire('Error', 'File size should not exceed 5MB', 'error');
//         return;
//       }

//       const allowedTypes = [
//         'image/jpeg',
//         'image/png',
//         'image/jpg',
//         'image/gif',
//       ];
//       if (!allowedTypes.includes(file.type)) {
//         Swal.fire(
//           'Error',
//           'Only JPEG, JPG, PNG, and GIF files are allowed',
//           'error'
//         );
//         return;
//       }

//       this.selectedImage = file;
//       this.selectedFileName = file.name;

//       const reader = new FileReader();
//       reader.onload = (e: any) => {
//         this.imagePreview = e.target.result;
//       };
//       reader.readAsDataURL(file);

//       this.userForm.patchValue({
//         profileImage: file,
//       });
//     }
//   }

//   onPhoneNumberInput(event: any): void {
//     let value = event.target.value;


//     value = value.replace(/[^\+\d]/g, '');

//     // Ensure it starts with +947
//     if (!value.startsWith('+947')) {
//       if (value.startsWith('+94')) {
//         value = '+947';
//       } else if (value.startsWith('+9')) {
//         value = '+947';
//       } else if (value.startsWith('+')) {
//         value = '+947';
//       } else {
//         value = '+947';
//       }
//     }


//     if (value.length > 12) {
//       value = value.substring(0, 12);
//     }

//     this.userForm.get('phoneNumber')?.setValue(value, { emitEvent: false });
//     event.target.value = value;
//   }

//   onPhoneNumberKeyPress(event: KeyboardEvent): void {
//     const charCode = event.which ? event.which : event.keyCode;
//     const currentValue = (event.target as HTMLInputElement).value;


//     if ([8, 9, 27, 13, 46].indexOf(charCode) !== -1) {
//       return;
//     }

//     if (charCode === 43 && currentValue.length === 0) {
//       return;
//     }


//     if (currentValue.length >= 12) {
//       event.preventDefault();
//       return;
//     }

//     if (charCode < 48 || charCode > 57) {
//       event.preventDefault();
//     }
//   }

//   loadBanks() {
//     this.http.get<Bank[]>('assets/json/banks.json').subscribe(
//       (data) => {
//         // Sort banks alphabetically by name
//         this.banks = data.sort((a, b) => a.name.localeCompare(b.name));

//         // Convert to dropdown options format
//         this.bankOptions = this.banks.map(bank => ({
//           label: bank.name,
//           value: bank.name
//         }));
//       },
//       (error) => { }
//     );
//   }

//   loadBranches() {
//     this.http.get<BranchesData>('assets/json/branches.json').subscribe(
//       (data) => {
//         this.allBranches = data;
//       },
//       (error) => {}
//     );
//   }


// onBankChange() {
//   const selectedBankName = this.userForm.get('bankName')?.value;
//   if (selectedBankName) {
//     const selectedBank = this.banks.find((bank) => bank.name === selectedBankName);
//     if (selectedBank) {
//       this.selectedBankId = selectedBank.ID;
//       this.branches = (this.allBranches[this.selectedBankId.toString()] || []).sort((a, b) => a.name.localeCompare(b.name));
//       this.branchOptions = this.branches.map(branch => ({
//         label: branch.name,
//         value: branch.name
//       }));
//       this.userForm.get('branchName')?.setValue('');
//     } else {
//       this.branches = [];
//       this.branchOptions = [];
//       this.selectedBankId = null;
//     }
//   } else {
//     this.branches = [];
//     this.branchOptions = [];
//     this.selectedBankId = null;
//   }
// }

//   onBranchChange() {
//     const selectedBranchName = this.userForm.get('branchName')?.value;
//     if (selectedBranchName) {
//     }
//   }
// }


import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { environment } from '../../../environment/environment';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { TokenService } from '../../../services/token/services/token.service';
import { DropdownModule } from 'primeng/dropdown';
import { forkJoin } from 'rxjs';

interface PlantCareUser {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  NICnumber: string;
  profileImage: string;
  created_at: string;
  district: string;
  membership: string;
  accNumber: any;
  accHolderName: string;
  bankName: string;
  branchName: string;
}

interface Branch {
  bankID: number;
  ID: number;
  name: string;
}

interface Bank {
  ID: number;
  name: string;
}

interface BranchesData {
  [key: string]: Branch[];
}

@Component({
  selector: 'app-edit-plantcare-users',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    DropdownModule,
  ],
  templateUrl: './edit-plantcare-users.component.html',
  styleUrl: './edit-plantcare-users.component.css',
})
export class EditPlantcareUsersComponent implements OnInit {
  plantCareUser: PlantCareUser[] = [];
  selectedFile: File | null = null;
  userForm: FormGroup;
  isView: boolean = false;
  isDisabled: boolean = true;
  selectedFileName!: string;
  imagePreview: string = '';
  selectedImage: File | null = null;
  isLoading = false;
  selectedBankId: number | null = null;
  itemId: number | null = null;
  branches: Branch[] = [];
  banks: Bank[] = [];
  allBranches: BranchesData = {};
  selectedBranchId: number | null = null;
  invalidFields: Set<string> = new Set();
  bankOptions: any[] = [];
  branchOptions: any[] = [];
  districtOptions: any[] = [];
  membershipOptions: any[] = [];
  languageOptions: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private route: ActivatedRoute,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef
  ) {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)]],
      lastName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+947\d{8}$/)]],
      NICnumber: ['', [Validators.required, Validators.pattern(/^(\d{12}|\d{9}[Vv])$/)]],
      district: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)]],
      membership: ['', Validators.required],
      language: ['', Validators.required],
      profileImage: [''],
      accHolderName: ['', Validators.required],
      accNumber: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      bankName: ['', Validators.required],
      branchName: ['', Validators.required],
    });
  }

  district = [
    { districtName: 'Colombo' },
    { districtName: 'Kalutara' },
    { districtName: 'Gampaha' },
    { districtName: 'Kandy' },
    { districtName: 'Matale' },
    { districtName: 'Nuwara Eliya' },
    { districtName: 'Galle' },
    { districtName: 'Matara' },
    { districtName: 'Hambantota' },
    { districtName: 'Jaffna' },
    { districtName: 'Mannar' },
    { districtName: 'Vavuniya' },
    { districtName: 'Kilinochchi' },
    { districtName: 'Mullaitivu' },
    { districtName: 'Batticaloa' },
    { districtName: 'Ampara' },
    { districtName: 'Trincomalee' },
    { districtName: 'Badulla' },
    { districtName: 'Moneragala' },
    { districtName: 'Kurunegala' },
    { districtName: 'Puttalam' },
    { districtName: 'Anuradhapura' },
    { districtName: 'Polonnaruwa' },
    { districtName: 'Rathnapura' },
    { districtName: 'Kegalle' },
  ];

  membership = [
    { membershipName: 'Basic' },
    { membershipName: 'Pro' },
  ];

  language = [
    { languageName: 'Sinhala' },
    { languageName: 'English' },
    { languageName: 'Tamil' },
  ];

  ngOnInit() {
    this.setupDropdownOptions();
    this.route.queryParams.subscribe((params) => {
      this.itemId = params['id'] ? +params['id'] : null;
      this.isView = params['isView'] === 'true';
      if (this.isView) {
        this.userForm.disable();
      }
    });

    this.isLoading = true;
    forkJoin({
      banks: this.http.get<Bank[]>('assets/json/banks.json'),
      branches: this.http.get<BranchesData>('assets/json/branches.json')
    }).subscribe(
      ({ banks, branches }) => {
        this.banks = banks.sort((a, b) => a.name.localeCompare(b.name));
        this.bankOptions = this.banks.map(bank => ({
          label: bank.name,
          value: bank.name
        }));
        this.allBranches = branches;
        console.log('Banks loaded:', this.banks);
        console.log('Branches loaded:', this.allBranches);

        if (this.itemId) {
          this.loadUserData(this.itemId);
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error loading banks or branches:', error);
        this.isLoading = false;
        Swal.fire('Error', 'Failed to load bank or branch data', 'error');
        this.cdr.detectChanges();
      }
    );
  }

  setupDropdownOptions() {
    this.district = this.district.sort((a, b) =>
      a.districtName.localeCompare(b.districtName)
    );
    this.districtOptions = this.district.map(district => ({
      label: district.districtName,
      value: district.districtName
    }));
    this.membershipOptions = this.membership.map(m => ({
      label: m.membershipName,
      value: m.membershipName
    }));
    this.languageOptions = this.language.map(l => ({
      label: l.languageName,
      value: l.languageName
    }));
  }

  loadUserData(id: number) {
    const token = this.tokenService.getToken();
    if (!token) {
      Swal.fire('Error', 'Authentication token not found', 'error');
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.isLoading = true;
    this.http
      .get<PlantCareUser>(`${environment.API_URL}auth/get-user-by-id/${id}`, {
        headers,
      })
      .subscribe(
        (data) => {
          this.isLoading = false;
          this.userForm.patchValue(data);
          this.imagePreview = data.profileImage;

          if (data.bankName) {
            const bank = this.banks.find((b) => b.name === data.bankName);
            if (bank) {
              this.selectedBankId = bank.ID;
              this.userForm.get('bankName')?.setValue(data.bankName);
              this.branches = (this.allBranches[this.selectedBankId.toString()] || []).slice().sort(
                (a, b) => a.name.localeCompare(b.name)
              );
              this.branchOptions = this.branches.map(branch => ({
                label: branch.name,
                value: branch.name
              }));
              if (data.branchName) {
                this.userForm.get('branchName')?.setValue(data.branchName);
                this.selectedBranchId = this.branches.find((b) => b.name === data.branchName)?.ID || null;
              }
              console.log('Branch options after load:', this.branchOptions);
            }
          }
          console.log('Loaded user data:', data);
          this.cdr.detectChanges();
        },
        (error) => {
          this.isLoading = false;
          console.error('Error loading user data:', error);
          Swal.fire('Error', 'Failed to load user data', 'error');
          this.cdr.detectChanges();
        }
      );
  }

  onBankChange() {
    const selectedBankName = this.userForm.get('bankName')?.value;
    if (selectedBankName) {
      const selectedBank = this.banks.find((bank) => bank.name === selectedBankName);
      if (selectedBank) {
        this.selectedBankId = selectedBank.ID;
        this.branches = (this.allBranches[this.selectedBankId.toString()] || []).slice().sort(
          (a, b) => a.name.localeCompare(b.name)
        );
        this.branchOptions = this.branches.map(branch => ({
          label: branch.name,
          value: branch.name
        }));
        console.log('Branches for bank', selectedBankName, ':', this.branches);
        this.userForm.get('branchName')?.setValue('');
      } else {
        this.branches = [];
        this.branchOptions = [];
        this.selectedBankId = null;
        this.userForm.get('branchName')?.setValue('');
      }
    } else {
      this.branches = [];
      this.branchOptions = [];
      this.selectedBankId = null;
      this.userForm.get('branchName')?.setValue('');
    }
    this.cdr.detectChanges();
  }

  onBranchChange() {
    const selectedBranchName = this.userForm.get('branchName')?.value;
    if (selectedBranchName) {
      const selectedBranch = this.branches.find((branch) => branch.name === selectedBranchName);
      if (selectedBranch) {
        this.selectedBranchId = selectedBranch.ID;
      }
    }
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  handleSpaceRestrictions(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    const currentValue = (event.target as HTMLInputElement).value;

    if (charCode === 32) {
      if (currentValue.length === 0 || !/[a-zA-Z]/.test(currentValue) || currentValue.charAt(currentValue.length - 1) === ' ') {
        event.preventDefault();
        return false;
      }
    }
    return true;
  }

  onNameInput(event: any, fieldName: string): void {
    let value = event.target.value;
    value = value.replace(/^\s+/, '').replace(/\s{2,}/g, ' ');
    if (value.length > 0) {
      value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      this.userForm.get(fieldName)?.setValue(value, { emitEvent: false });
      event.target.value = value;
    }
  }

  onNameKeyPress(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (!this.handleSpaceRestrictions(event)) return;
    if (
      (charCode < 65 || charCode > 90) &&
      (charCode < 97 || charCode > 122) &&
      charCode !== 8 &&
      charCode !== 9 &&
      charCode !== 46 &&
      charCode !== 37 &&
      charCode !== 39 &&
      charCode !== 32
    ) {
      event.preventDefault();
    }
  }

  onAccountHolderNameKeyPress(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (!this.handleSpaceRestrictions(event)) return;
    if (
      (charCode < 65 || charCode > 90) &&
      (charCode < 97 || charCode > 122) &&
      charCode !== 32 &&
      charCode !== 8 &&
      charCode !== 9 &&
      charCode !== 46 &&
      charCode !== 37 &&
      charCode !== 39
    ) {
      event.preventDefault();
    }
  }

  onAccountHolderNameInput(event: any): void {
    let value = event.target.value;
    value = value.replace(/[^a-zA-Z\s]/g, '').replace(/^\s+/, '').replace(/\s{2,}/g, ' ');
    value = value.replace(/\b\w/g, (char: string) => char.toUpperCase());
    this.userForm.get('accHolderName')?.setValue(value, { emitEvent: false });
    event.target.value = value;
  }

  onAccountNumberKeyPress(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (
      (charCode < 48 || charCode > 57) &&
      charCode !== 8 &&
      charCode !== 9 &&
      charCode !== 46 &&
      charCode !== 37 &&
      charCode !== 39
    ) {
      event.preventDefault();
    }
  }

  onAccountNumberInput(event: any): void {
    let value = event.target.value;
    value = value.replace(/[^0-9]/g, '');
    this.userForm.get('accNumber')?.setValue(value, { emitEvent: false });
    event.target.value = value;
  }

  onPhoneNumberInput(event: any): void {
    let value = event.target.value;
    value = value.replace(/[^\+\d]/g, '');
    if (!value.startsWith('+947')) {
      if (value.startsWith('+94')) value = '+947';
      else if (value.startsWith('+9')) value = '+947';
      else if (value.startsWith('+')) value = '+947';
      else value = '+947';
    }
    if (value.length > 12) {
      value = value.substring(0, 12);
    }
    this.userForm.get('phoneNumber')?.setValue(value, { emitEvent: false });
    event.target.value = value;
  }

  onPhoneNumberKeyPress(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    const currentValue = (event.target as HTMLInputElement).value;
    if ([8, 9, 27, 13, 46].indexOf(charCode) !== -1) return;
    if (charCode === 43 && currentValue.length === 0) return;
    if (currentValue.length >= 12) {
      event.preventDefault();
      return;
    }
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  onlyNumberKey(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
    return true;
  }

back(): void {
  Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: 'You may lose the added data after going back!',
    showCancelButton: true,
    confirmButtonText: 'Yes, Go Back',
    cancelButtonText: 'No, Stay Here',
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
    },
    buttonsStyling: true,
  }).then((result) => {
    if (result.isConfirmed) {
      this.router.navigate(['/steckholders/action/farmers']);
    }
  });
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
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire('Error', 'Only JPEG, JPG, PNG, and GIF files are allowed', 'error');
        return;
      }
      this.selectedImage = file;
      this.selectedFileName = file.name;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
      this.userForm.patchValue({ profileImage: file });
    }
  }

  onSubmit() {
    if (this.userForm.valid) {
      if (this.selectedImage) {
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validImageTypes.includes(this.selectedImage.type)) {
          Swal.fire({
            title: 'Invalid File!',
            text: 'Please upload a valid image file (jpg, png, gif).',
            icon: 'error',
            confirmButtonText: 'OK',
          });
          return;
        }
      }

      const token = this.tokenService.getToken();
      if (!token) {
        Swal.fire('Error', 'Authentication token not found', 'error');
        return;
      }

      Swal.fire({
        title: 'Are you sure?',
        text: 'Do you really want to update this plant care user?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, update it!',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`,
          });

          const formData = new FormData();
          formData.append('firstName', this.userForm.get('firstName')?.value || '');
          formData.append('lastName', this.userForm.get('lastName')?.value || '');
          formData.append('phoneNumber', this.userForm.get('phoneNumber')?.value || '');
          formData.append('NICnumber', this.userForm.get('NICnumber')?.value || '');
          formData.append('district', this.userForm.get('district')?.value || '');
          formData.append('membership', this.userForm.get('membership')?.value || '');
          formData.append('language', this.userForm.get('language')?.value || '');
          formData.append('accHolderName', this.userForm.get('accHolderName')?.value || '');
          formData.append('accNumber', this.userForm.get('accNumber')?.value || '');
          formData.append('bankName', this.userForm.get('bankName')?.value || '');
          formData.append('branchName', this.userForm.get('branchName')?.value || '');

          if (this.selectedImage) {
            formData.append('image', this.selectedImage);
          }

          this.isLoading = true;
          this.http
            .put(`${environment.API_URL}auth/update-plant-care-user/${this.itemId}`, formData, { headers })
            .subscribe(
              (data: any) => {
                this.isLoading = false;
                this.userForm.patchValue(data);
                Swal.fire('Updated!', 'Plant care user has been updated.', 'success').then(() => {
                  this.router.navigate(['/steckholders/action/farmers']);
                });
                this.loadUserData(this.itemId!);
              },
              (error) => {
                this.isLoading = false;
                let errorMessage = 'There was an error updating the plant care user.';
                if (error.error?.error) {
                  errorMessage = error.error.error;
                } else if (error.error?.message) {
                  errorMessage = error.error.message;
                } else if (error.status === 400) {
                  errorMessage = 'Invalid data sent to server. Please check your inputs.';
                }
                Swal.fire('Error!', errorMessage, 'error');
              }
            );
        }
      });
    } else {
      Object.keys(this.userForm.controls).forEach((key) => {
        const control = this.userForm.get(key);
        control!.markAsTouched();
      });
      Swal.fire('Error', 'Please fill all required fields correctly.', 'error');
    }
  }

  onSubmitCreate() {
    if (this.userForm.valid) {
      if (this.selectedImage) {
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validImageTypes.includes(this.selectedImage.type)) {
          Swal.fire({
            title: 'Invalid File!',
            text: 'Please upload a valid image file (jpg, png, gif).',
            icon: 'error',
            confirmButtonText: 'OK',
          });
          return;
        }
      }

      const token = this.tokenService.getToken();
      if (!token) {
        Swal.fire('Error', 'Authentication token not found', 'error');
        return;
      }

      Swal.fire({
        title: 'Are you sure?',
        text: 'Do you really want to create a new plant care user?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, create it!',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`,
          });

          const formData = new FormData();
          formData.append('firstName', this.userForm.get('firstName')?.value || '');
          formData.append('lastName', this.userForm.get('lastName')?.value || '');
          formData.append('phoneNumber', this.userForm.get('phoneNumber')?.value || '');
          formData.append('NICnumber', this.userForm.get('NICnumber')?.value || '');
          formData.append('district', this.userForm.get('district')?.value || '');
          formData.append('membership', this.userForm.get('membership')?.value || '');
          formData.append('language', this.userForm.get('language')?.value || '');
          formData.append('accNumber', this.userForm.get('accNumber')?.value || '');
          formData.append('accHolderName', this.userForm.get('accHolderName')?.value || '');
          formData.append('bankName', this.userForm.get('bankName')?.value || '');
          formData.append('branchName', this.userForm.get('branchName')?.value || '');

          if (this.selectedImage) {
            formData.append('image', this.selectedImage);
          }

          this.isLoading = true;
          this.http
            .post(`${environment.API_URL}auth/create-plant-care-user`, formData, { headers })
            .subscribe(
              (response: any) => {
                this.isLoading = false;
                Swal.fire('Created!', 'A new plant care user has been created.', 'success').then(() => {
                  this.router.navigate(['/steckholders/action/farmers']);
                });
                this.userForm.reset();
                this.imagePreview = '';
                this.selectedImage = null;
                this.itemId = null;
              },
              (error) => {
                this.isLoading = false;
                let errorMessage = 'There was an error creating the plant care user.';
                if (error.error?.error) {
                  errorMessage = error.error.error;
                } else if (error.status === 400) {
                  errorMessage = 'Validation error. Please check your inputs.';
                }
                Swal.fire('Error!', errorMessage, 'error');
              }
            );
        }
      });
    } else {
      Object.keys(this.userForm.controls).forEach((key) => {
        const control = this.userForm.get(key);
        control!.markAsTouched();
      });
      Swal.fire('Error', 'Please fill all required fields correctly.', 'error');
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
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
    },
    buttonsStyling: true,
  }).then((result) => {
    if (result.isConfirmed) {
      this.router.navigate(['/steckholders/action/farmers']);
    }
  });
}


}