import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { environment } from '../../../environment/environment';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { TokenService } from '../../../services/token/services/token.service';

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
  accHolderName: String;
  bankName: String;
  branchName: String;
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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private route: ActivatedRoute,
    private tokenService: TokenService
  ) {
    // Initialize the form with FormBuilder
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)]],
      lastName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^\+94\d{9}$/)],
      ],
      NICnumber: [
        '',
        [Validators.required, Validators.pattern(/^(\d{12}|\d{9}[V])$/)],
      ],
      district: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)]],
      membership: [
        '',
        [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)],
      ],
      profileImage: [''],
      accHolderName: [''],
      accNumber: [''],
      bankName: [''],
      branchName: [''],
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
    { membershipName: 'Silver' },
    { membershipName: 'Gold' },
    { membershipName: 'Diamond' },
  ];

  ngOnInit() {
    this.loadBanks();
    this.loadBranches();
    this.route.queryParams.subscribe((params) => {
      this.itemId = params['id'] ? +params['id'] : null;
      this.isView = params['isView'] === 'true';
      console.log('Received item ID:', this.itemId);
      console.log('recieved view state: ', this.isView);
    });
    if (this.itemId) {
      this.loadUserData(this.itemId);
    }
  }

  loadUserData(id: number) {
    const token = this.tokenService.getToken();

    if (!token) {
      console.error('No token found');
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
        },
        (error) => {
          this.isLoading = false;
          console.error('Error fetching user data:', error);
        }
      );
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedImage = file;

      // Create an image preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.userForm.valid) {
      console.log('this is the form values.....', this.userForm.value);

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
        console.error('No token found');
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
          formData.append('firstName', this.userForm.get('firstName')?.value);
          formData.append('lastName', this.userForm.get('lastName')?.value);
          formData.append(
            'phoneNumber',
            this.userForm.get('phoneNumber')?.value
          );
          formData.append('NICnumber', this.userForm.get('NICnumber')?.value);
          formData.append('district', this.userForm.get('district')?.value);
          formData.append('membership', this.userForm.get('membership')?.value);

          if (this.selectedImage) {
            formData.append('image', this.selectedImage);
          }
          this.isLoading = true;
          this.http
            .put(
              `${environment.API_URL}auth/update-plant-care-user/${this.itemId}`,
              formData,
              { headers }
            )
            .subscribe(
              (data) => {
                this.isLoading = false;
                this.userForm.patchValue(data);
                Swal.fire(
                  'Updated!',
                  'plant care user has been updated.',
                  'success'
                ).then(() => {
                  this.router.navigate(['/steckholders/action/farmers']);
                });
                this.loadUserData(this.itemId!);
                this.userForm.reset();
                this.imagePreview = '';
                this.selectedImage = null;
                this.itemId = null;
              },
              (error) => {
                this.isLoading = false;
                console.error('Error fetching user data:', error);
                Swal.fire(
                  'Error!',
                  'There was an error updating the plant care user.',
                  'error'
                );
              }
            );
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.userForm.controls).forEach((key) => {
        const control = this.userForm.get(key);
        control!.markAsTouched();
      });
    }
  }

  onCancel() {
    this.router.navigate(['/steckholders/action/farmers']);
  }

  onSubmitCreate() {
    if (this.userForm.valid) {
      console.log('this is the form values.....', this.userForm.value);

      // Image validation
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
        console.error('No token found');
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

          // Create FormData with all required fields
          const formData = new FormData();
          formData.append(
            'firstName',
            this.userForm.get('firstName')?.value || ''
          );
          formData.append(
            'lastName',
            this.userForm.get('lastName')?.value || ''
          );
          formData.append(
            'phoneNumber',
            this.userForm.get('phoneNumber')?.value || ''
          );
          formData.append(
            'NICnumber',
            this.userForm.get('NICnumber')?.value || ''
          );
          formData.append(
            'district',
            this.userForm.get('district')?.value || ''
          );
          formData.append(
            'membership',
            this.userForm.get('membership')?.value || ''
          );

          // Always append bank details (empty strings if not provided)
          formData.append(
            'accNumber',
            this.userForm.get('accNumber')?.value || ''
          );
          formData.append(
            'accHolderName',
            this.userForm.get('accHolderName')?.value || ''
          );
          formData.append(
            'bankName',
            this.userForm.get('bankName')?.value || ''
          );
          formData.append(
            'branchName',
            this.userForm.get('branchName')?.value || ''
          );

          // Add image if selected
          if (this.selectedImage) {
            formData.append('image', this.selectedImage);
          }

          this.isLoading = true;
          this.http
            .post(
              `${environment.API_URL}auth/create-plant-care-user`,
              formData,
              { headers }
            )
            .subscribe(
              (response: any) => {
                this.isLoading = false;
                Swal.fire(
                  'Created!',
                  'A new plant care user has been created.',
                  'success'
                ).then(() => {
                  this.router.navigate(['/steckholders/action/farmers']);
                });

                // Reset form and clear selections
                this.userForm.reset();
                this.imagePreview = '';
                this.selectedImage = null;
                this.itemId = null;
              },
              (error) => {
                this.isLoading = false;
                console.error('Error creating plant care user:', error);

                let errorMessage =
                  'There was an error creating the plant care user.';
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
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.userForm.controls).forEach((key) => {
        const control = this.userForm.get(key);
        control!.markAsTouched();
      });
    }
  }

  triggerFileInput(event: Event): void {
    event.preventDefault();
    const fileInput = document.getElementById('imageUpload');
    fileInput?.click();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];

    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5000000) {
        Swal.fire('Error', 'File size should not exceed 5MB', 'error');
        return;
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/gif',
      ];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire(
          'Error',
          'Only JPEG, JPG, PNG, and GIF files are allowed',
          'error'
        );
        return;
      }

      this.selectedImage = file;
      this.selectedFileName = file.name;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);

      // Update form control
      this.userForm.patchValue({
        profileImage: file,
      });
    }
  }

  loadBanks() {
    this.http.get<Bank[]>('assets/json/banks.json').subscribe(
      (data) => {
        this.banks = data;
      },
      (error) => {
        console.error('Error loading banks:', error);
      }
    );
  }

  loadBranches() {
    this.http.get<BranchesData>('assets/json/branches.json').subscribe(
      (data) => {
        this.allBranches = data;
      },
      (error) => {
        console.error('Error loading branches:', error);
      }
    );
  }

  onBankChange() {
    if (this.selectedBankId) {
      this.branches = this.allBranches[this.selectedBankId.toString()] || [];

      const selectedBank = this.banks.find(
        (bank) => bank.ID === this.selectedBankId
      );

      console.log('hit 1', this.selectedBankId);

      // Add null/undefined check for plantCareUser and its first element
      if (selectedBank && this.plantCareUser && this.plantCareUser.length > 0) {
        this.plantCareUser[0].bankName = selectedBank.name;
        this.invalidFields.delete('bankName');
      }

      this.selectedBankId = null;

      // Add null/undefined check before accessing branchName
      if (this.plantCareUser && this.plantCareUser.length > 0) {
        this.plantCareUser[0].branchName = '';
      }
    } else {
      this.branches = [];
      // Add null/undefined check before accessing bankName
      if (this.plantCareUser && this.plantCareUser.length > 0) {
        this.plantCareUser[0].bankName = '';
      }
    }
  }

  onBranchChange() {
    if (this.selectedBranchId) {
      console.log(this.selectedBranchId);

      const selectedBranch = this.branches.find(
        (branch) => branch.ID === this.selectedBranchId
      );
      if (selectedBranch) {
        this.plantCareUser[0].branchName = selectedBranch.name;
        this.invalidFields.delete('branchName');
      }
    } else {
      this.plantCareUser[0].branchName = '';
    }
  }
}
