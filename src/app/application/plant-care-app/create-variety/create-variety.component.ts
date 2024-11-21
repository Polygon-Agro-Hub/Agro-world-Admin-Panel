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
    cropGroupId:'',
    varietyNameEnglish: '',
    varietyNameSinhala: '',
    varietyNameTamil: '',
    descriptionEnglish: '',
    descriptionSinhala: '',
    descriptionTamil: '',
    bgColor: '',
  }

  isLoading = false;
  selectedFileName: string | null = null;
  selectedImage: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  groupList: any[] = [];
  cropForm: FormGroup;
  imagePreview: string | ArrayBuffer | null = null

  itemId: number | null = null;
  newsItems: NewsItem[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private cropCalendarService: CropCalendarService
  ) {
    this.cropForm = this.fb.group({
      groupId: ['', [Validators.required]],
      varietyNameEnglish: ['', [Validators.required, Validators.minLength(2)]],
      varietyNameSinhala: ['', [Validators.required, Validators.minLength(2)]],
      varietyNameTamil: ['', [Validators.required, Validators.minLength(2)]],
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
    this.route.queryParams.subscribe((params)=>{
      this.itemId = params['id'] ? +params['id'] : null;
      console.log('Recived item ID:', this.itemId);
      
      if(this.itemId){
        // this.cropCalendarService.getCropVarietyById(this.itemId).subscribe({
        //   next: (response:any)=>{
        //     this.cropVarity = {
        //       cropGroupId: response.groups[0].cropGroupId,
        //       varietyNameEnglish: response.groups[0].varietyEnglish,
        //       varietyNameSinhala: response.groups[0].varietySinhala,
        //       varietyNameTamil: response.groups[0].varietyTamil,
        //       descriptionEnglish: response.groups[0].descriptionEnglish,
        //       descriptionSinhala: response.groups[0].descriptionSinhala,
        //       descriptionTamil: response.groups[0].descriptionTamil,
        //       bgColor: response.groups[0].bgColor,
        //     };
        //     if(response.groups[0].image){
        //       this.selectedImage = response.group[0].image;
        //       this.selectedFileName = "Existing Image";
        //     }
        //   },
        //   error:(error)=>{
        //     console.error('Error fetching crop group details:', error);
            
        //   }
        // })

        this.isLoading = true;
        this.cropCalendarService.getCropVarietyById(this.itemId).subscribe({
          next: (response: any) => {
            this.newsItems = response.groups;
            if (response.groups[0].image) {
              this.selectedImage = response.groups[0].image; // Base64 image
              this.selectedFileName = "Existing Image";
            }
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error fetching crop group details:', error);
            this.isLoading = false;
          },
        });
      }

    })
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
    if (!this.selectedFile) {
      Swal.fire('Error', 'Please select an image file.', 'error');
      return;
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
        this.isLoading = false;
        Swal.fire({
          title: 'Success',
          text: response.message || 'Crop variety created successfully!',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          this.router.navigate(['/plant-care/view-crop-group']);
        });
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

  onCancel() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will lose all entered data!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, leave page',
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/plant-care']);
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
    const token = localStorage.getItem('Login Token : ');
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
    const token = localStorage.getItem('Login Token : ');
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
          this.router.navigate(['/plant-care/view-crop-group']);
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
}
