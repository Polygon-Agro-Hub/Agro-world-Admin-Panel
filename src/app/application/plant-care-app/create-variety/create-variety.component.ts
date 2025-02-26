// create-variety.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgxColorsModule } from 'ngx-colors';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CropCalendarService } from '../../../services/plant-care/crop-calendar.service';
import Swal from 'sweetalert2';
import { environment } from '../../../environment/environment';
import { MatSelectModule } from '@angular/material/select';
import { response } from 'express';
import { TokenService } from '../../../services/token/services/token.service';

interface NewsItem {
  varietyNameEnglish: string;
  varietyNameSinhala: string;
  varietyNameTamil: string;
  descriptionEnglish: string;
  descriptionSinhala: string;
  descriptionTamil: string;
  bgColor: string;
  image: string;
}

@Component({
  selector: 'app-create-variety',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    NgxColorsModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './create-variety.component.html',
  styleUrl: './create-variety.component.css',
})
export class CreateVarietyComponent implements OnInit {
  cropVarity = {
    cropGroupId: '',
    varietyNameEnglish: '',
    varietyNameSinhala: '',
    varietyNameTamil: '',
    descriptionEnglish: '',
    descriptionSinhala: '',
    descriptionTamil: '',
    bgColor: '',
  };

  isLoading = false;
  selectedFileName: string | null = null;
  selectedImage: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  groupList: any[] = [];
  cropForm: FormGroup;
  imagePreview: string | ArrayBuffer | null = null;

  itemId: number | null = null;
  newsItems: NewsItem[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private cropCalendarService: CropCalendarService,
    private tokenService: TokenService
  ) {
    this.cropForm = this.fb.group({
      groupId: ['', [Validators.required]],
      varietyNameEnglish: ['', [Validators.required, Validators.minLength(2),  Validators.pattern(/^(?!\d+$)[a-zA-Z0-9 ]*$/)]],
      varietyNameSinhala: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^(?![0-9]+$)[\u0D80-\u0DFF0-9\s]*$/)]],
      varietyNameTamil: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^(?![0-9]+$)[\u0B80-\u0BFF0-9\s]*$/)]],
      descriptionEnglish: ['', [Validators.required, Validators.minLength(10)]],
      descriptionSinhala: ['', [Validators.required, Validators.minLength(10)]],
      descriptionTamil: ['', [Validators.required, Validators.minLength(10)]], 
      bgColor: new FormControl('', Validators.required),
      image: [null, [Validators.required]],
    });
  }

  // private initializeForm(): void {
  //   this.cropForm = this.fb.group({
  //     groupId: ['', [Validators.required]],
  //     varietyNameEnglish: ['', [Validators.required, Validators.minLength(2)]],
  //     varietyNameSinhala: ['', [Validators.required, Validators.minLength(2)]],
  //     varietyNameTamil: ['', [Validators.required, Validators.minLength(2)]],
  //     descriptionEnglish: ['', [Validators.required, Validators.minLength(10)]],
  //     descriptionSinhala: ['', [Validators.required, Validators.minLength(10)]],
  //     descriptionTamil: ['', [Validators.required, Validators.minLength(10)]],
  //     bgColor: ['', [Validators.required]],
  //     image: [null, [Validators.required]]
  //   });
  // }

  ngOnInit() {
    this.getAllCropGroups();
    this.route.queryParams.subscribe((params) => {
      this.itemId = params['id'] ? +params['id'] : null;
      console.log('Recived item ID:', this.itemId);

      if (this.itemId) {
        this.isLoading = true;
        this.cropCalendarService.getCropVarietyById(this.itemId).subscribe({
          next: (response: any) => {
            this.newsItems = response.groups;
            if (response.groups[0].image) {
              this.selectedImage = response.groups[0].image; // Base64 image
              this.selectedFileName = 'Existing Image';
            }
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error fetching crop group details:', error);
            this.isLoading = false;
          },
        });
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.cropForm.get(controlName);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Minimum length is ${minLength} characters`;
    }
    return '';
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        // 5MB limit
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
      this.cropForm.patchValue({ image: file });

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage = e.target?.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    const cropValues = this.cropForm.value;
    if (
      !cropValues.groupId ||
      !cropValues.varietyNameEnglish ||
      !cropValues.varietyNameSinhala ||
      !cropValues.varietyNameTamil ||
      !cropValues.descriptionEnglish ||
      !cropValues.descriptionSinhala ||
      !cropValues.descriptionTamil ||
      !cropValues.bgColor
    ) {
      Swal.fire('warning', 'Please fill all input feilds', 'warning');
      return;
    }

    if (!this.selectedFile) {
      Swal.fire('Error', 'Please select an image file.', 'error');
      return;
    }

    if (this.cropForm.invalid) {
      let errorMessages = [];
  
      if (this.cropForm.controls['groupId'].hasError('required')) {
        errorMessages.push('Group ID is required.');
      }
      if (this.cropForm.controls['varietyNameEnglish'].hasError('required')) {
        errorMessages.push('Variety name is required.');

      } else if (this.cropForm.controls['varietyNameEnglish'].hasError('pattern')) {
        errorMessages.push('Variety name cannot be only numbers and special characters are not allowed');
      }
  
      if (this.cropForm.controls['varietyNameSinhala'].hasError('required')) {
        errorMessages.push('Sinhala variety name is required.');
      
      } else if (this.cropForm.controls['varietyNameSinhala'].hasError('pattern')) {
        errorMessages.push('Variety name cannot be only numbers and only Sinhala characters and numbers are allowed');
      }
  
      if (this.cropForm.controls['varietyNameTamil'].hasError('required')) {
        errorMessages.push('Tamil variety name is required.');
      
      } else if (this.cropForm.controls['varietyNameTamil'].hasError('pattern')) {
        errorMessages.push('Variety name cannot be only numbers and only tamil characters and numbers are allowed');
      }
  
      if (this.cropForm.controls['bgColor'].hasError('required')) {
        errorMessages.push('Background color is required.');
      }
  
      if (!this.selectedFile) {
        errorMessages.push('Please select an image file.');
      }
  
      if (errorMessages.length > 0) {
        Swal.fire({
          title: 'Validation Errors',
          html: `<ul style="text-align: center; padding: 0; list-style: none;">
                    ${errorMessages.map((msg) => `<li style="margin-bottom: 5px;">${msg}</li>`).join('')}
                 </ul>`,
          icon: 'warning',
          confirmButtonText: 'OK',
        });
        return;
      }
    }

    this.isLoading = true;
    const formData = new FormData();

    // Append all form values to FormData
    Object.keys(this.cropForm.value).forEach((key) => {
      if (key !== 'image') {
        formData.append(key, this.cropForm.get(key)?.value);
      }
    });
    formData.append('image', this.selectedFile);

    this.cropCalendarService.createCropVariety(formData).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.isLoading = false;
          Swal.fire({
            title: 'Success',
            text: response.message || 'Crop variety created successfully!',
            icon: 'success',
            confirmButtonText: 'OK',
          }).then(() => {
            this.router.navigate(['/plant-care/action/view-crop-group']);
          });
        } else {
          this.isLoading = false;
          Swal.fire('Unsuccess', response.message, 'error');
        }
      },
      error: (error) => {
        this.isLoading = false;
        Swal.fire(
          'Error',
          error.error?.message ||
            'An error occurred while creating the crop variety.',
          'error'
        );
      },
    });
  }

  // onCancel() {
  //   Swal.fire({
  //     title: 'Are you sure?',
  //     text: 'You will lose all entered data!',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#3085d6',
  //     cancelButtonColor: '#d33',
  //     confirmButtonText: 'Yes, leave page',
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       this.router.navigate(['/plant-care']);
  //     }
  //   });
  // }

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
        this.selectedFile = null;
        this.selectedImage = null;
        this.router.navigate(['plant-care/action']);
      }
    });
  }

  triggerFileInput(event: Event): void {
    event.preventDefault();
    const fileInput = document.getElementById('imageUpload');
    fileInput?.click();
  }

  onColorChange(event: any): void {
    this.cropForm.patchValue({ bgColor: event.color.hex });
  }

  getAllCropGroups() {
    const token = this.tokenService.getToken();

    if (!token) {
      Swal.fire(
        'Error',
        'No authentication token found. Please login again.',
        'error'
      ).then(() => {
        this.router.navigate(['/login']);
      });
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get<any>(`${environment.API_URL}crop-calendar/crop-groups`, { headers })
      .subscribe({
        next: (response) => {
          this.groupList = response.groups;
        },
        error: (error) => {
          console.error('Error fetching crop groups:', error);
          Swal.fire(
            'Error',
            'Failed to load crop groups. Please try again later.',
            'error'
          );
        },
      });
  }

  updateNews() {
    const token = this.tokenService.getToken();

    if (!token) {
      console.error('No token found');
      return;
    }

    if (!this.newsItems || this.newsItems.length === 0) {
      console.error('News items are empty');
      return;
    }

    const newsItem = this.newsItems[0]; // Assuming you want to update the first item

    const formData = new FormData();
    formData.append('varietyNameEnglish', newsItem.varietyNameEnglish || '');
    formData.append('varietyNameSinhala', newsItem.varietyNameSinhala || '');
    formData.append('varietyNameTamil', newsItem.varietyNameTamil || '');
    formData.append('descriptionEnglish', newsItem.descriptionEnglish || '');
    formData.append('descriptionSinhala', newsItem.descriptionSinhala || '');
    formData.append('descriptionTamil', newsItem.descriptionTamil || '');
    formData.append('bgColor', newsItem.bgColor || '');

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.isLoading = true;
    this.http
      .put(
        `${environment.API_URL}crop-calendar/update-crop-variety/${this.itemId}`,
        formData,
        { headers }
      )
      .subscribe(
        (res: any) => {
          console.log('Market Price updated successfully', res);
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Market Price updated successfully!',
          });
          this.router.navigate(['/plant-care/action/view-crop-group']);
        },
        (error) => {
          console.error('Error updating news', error);
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Unsuccessful',
            text: 'Error updating news',
          });
        }
      );
  }


  back(): void {
    this.router.navigate(['/plant-care/action']);
  }


  backEdit(): void {
    this.router.navigate(['/plant-care/action/view-crop-group']);
  }




}
