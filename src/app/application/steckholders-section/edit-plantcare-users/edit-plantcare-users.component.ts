import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { environment } from '../../../environment/environment';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";

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
}

@Component({
  selector: 'app-edit-plantcare-users',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, CommonModule, LoadingSpinnerComponent],
  templateUrl: './edit-plantcare-users.component.html',
  styleUrl: './edit-plantcare-users.component.css',
})
export class EditPlantcareUsersComponent implements OnInit {
  plantCareUser: PlantCareUser[] = [];

  userForm: FormGroup;
  
  imagePreview: string = '';
  selectedImage: File | null = null;
  isLoading = false;

  itemId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {
    // Initialize the form with FormBuilder
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)]],
      lastName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+94\d{9}$/)]],
      NICnumber: ['', [Validators.required, Validators.pattern(/^(\d{12}|\d{9}[V])$/)]],
      district: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)]],
      membership: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)]],
      profileImage: [''],
    });
  }



  district = [
        { districtName: "Colombo" },
        { districtName: "Kalutara" },
        { districtName: "Gampaha" },
        { districtName: "Kandy" },
        { districtName: "Matale" },
        { districtName: "Nuwara Eliya" },
        { districtName: "Galle" },
        { districtName: "Matara" },
        { districtName: "Hambantota" },
        { districtName: "Jaffna" },
        { districtName: "Mannar" },
        { districtName: "Vavuniya" },
        { districtName: "Kilinochchi" },
        { districtName: "Mulaitivu" },
        { districtName: "Batticaloa" },
        { districtName: "Ampara" },
        { districtName: "Trincomalee" },
        { districtName: "Badulla" },
        { districtName: "Moneragala" },
        { districtName: "Kurunegala" },
        { districtName: "Puttalam" },
        { districtName: "Anuradhapura" },
        { districtName: "Polonnaruwa" },
  ]


  membership = [
    { membershipName: "Silver" },
    { membershipName: "Gold" },
    { membershipName: "Diamond" },
]

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.itemId = params['id'] ? +params['id'] : null;
      console.log('Received item ID:', this.itemId);
    });
    this.loadUserData(this.itemId!);
  }

  loadUserData(id: number) {
    const token = localStorage.getItem('Login Token : ');
    if (!token) {
      console.error('No token found');
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.isLoading = true;
    this.http
      .get<PlantCareUser>(
        `${environment.API_BASE_URL}get-user-by-id/${id}`,
        { headers }
      )
      .subscribe(
        (data) => {
          this.isLoading = false;
          this.userForm.patchValue(data);
          this.imagePreview = data.profileImage;
        },
        (error) => {
          this.isLoading = false
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

      if(this.selectedImage){
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if(!validImageTypes.includes(this.selectedImage.type)){
          Swal.fire({
            title: 'Invalid File!',
            text: 'Please upload a valid image file (jpg, png, gif).',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          return;
        }
      }
    // Handle authentication token
    const token = localStorage.getItem('Login Token : ');
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
        formData.append('phoneNumber', this.userForm.get('phoneNumber')?.value);
        formData.append('NICnumber', this.userForm.get('NICnumber')?.value);
        formData.append('district', this.userForm.get('district')?.value);
        formData.append('membership', this.userForm.get('membership')?.value);

        if (this.selectedImage) {
          formData.append('image', this.selectedImage);
        }
        this.isLoading = true;
        this.http
          .put(
            `${environment.API_BASE_URL}update-plant-care-user/${this.itemId}`, formData,{ headers })
          .subscribe(
            (data) => {
              this.isLoading = false;
              this.userForm.patchValue(data);
              Swal.fire(
                'Updated!',
                'plant care user has been updated.',
                'success'
              ).then(()=>{
                this.router.navigate(['/steckholders/farmers'])
              });
              this.loadUserData(this.itemId!);
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
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        control!.markAsTouched();
      });
    }
    
  }

  onCancel() {
    location.reload();
  }

  onSubmitCreate() {
    if (this.userForm.valid) {
      console.log('this is the form values.....', this.userForm.value);

      if(this.selectedImage){
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if(!validImageTypes.includes(this.selectedImage.type)){
          Swal.fire({
            title: 'Invalid File!',
            text: 'Please upload a valid image file (jpg, png, gif).',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          return;
        }
      }
    // Handle authentication token
    const token = localStorage.getItem('Login Token : ');
    if (!token) {
      console.error('No token found');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to add this plant care user?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, add it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });

        const formData = new FormData();
        formData.append('firstName', this.userForm.get('firstName')?.value);
        formData.append('lastName', this.userForm.get('lastName')?.value);
        formData.append('phoneNumber', this.userForm.get('phoneNumber')?.value);
        formData.append('NICnumber', this.userForm.get('NICnumber')?.value);
        formData.append('district', this.userForm.get('district')?.value);
        formData.append('membership', this.userForm.get('membership')?.value);


        if (this.selectedImage) {
          formData.append('image', this.selectedImage);
        }
        this.isLoading = true;
this.http
  .post(
    `${environment.API_BASE_URL}create-plantcare-user`,
    formData,
    { headers }
  )
  .subscribe(
    (data: any) => {
      this.isLoading = false;
      this.userForm.patchValue(data);
      Swal.fire(
        'User Created!',
        'Plant care user has been successfully created.',
        'success'
      ).then(()=>{
        this.router.navigate(['/steckholders/farmers'])
      });
      this.loadUserData(this.itemId!);
    },
    (error) => {
      this.isLoading = false;
      console.error('Error creating user:', error);

      // Check for duplicate error
      if (error.status === 409) {
        Swal.fire(
          'Error!',
          'Profile image is required. Only image files are allowed (jpg, png, gif).',
          'error'
        );
      } else if (error.status === 400) {
        Swal.fire(
          'Error!',
          'Phone number or NIC number already exists.',
          'error'
        );
        
      } else {
        Swal.fire(
          'Error!',
          'An unexpected error occurred while creating the plant care user.',
          'error'
        );
      }
    }
  );

      }
    });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        control!.markAsTouched();
      });
    }
  }
}
