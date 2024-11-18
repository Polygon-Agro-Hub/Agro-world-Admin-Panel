import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";
import { NgxColorsModule } from 'ngx-colors';
import { CropCalendarService } from '../../../services/plant-care/crop-calendar.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-crop-group',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, NgxColorsModule],
  templateUrl: './create-crop-group.component.html',
  styleUrl: './create-crop-group.component.css'
})
export class CreateCropGroupComponent {
  cropGroup = {
    cropNameEnglish: '',
    cropNameSinahala:'',
    cropNameTamil:'',
    parentCategory: '',
    bgColor: ''
  };
  categories = ['Fruit', 'Grain', 'Mushrooms', 'Vegetables'];
  imagePreview: string | ArrayBuffer | null = null;
    isLoading = false;
    selectedFileName: string | null = null;
    selectedImage: string | ArrayBuffer | null = null;
    selectedFile: File | null = null;

    itemId: number | null = null;
  

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private cropCalendarService: CropCalendarService
  ) {}


  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.itemId = params['id'] ? +params['id'] : null;
      console.log('Received item ID:', this.itemId);
  
      if (this.itemId) {
        // Fetch crop group details for editing
        this.isLoading = true;
        this.cropCalendarService.getCropGroupById(this.itemId).subscribe({
          next: (response: any) => {
            this.cropGroup = {
              cropNameEnglish: response.groups[0].cropNameEnglish,
              cropNameSinahala: response.groups[0].cropNameSinhala,
              cropNameTamil: response.groups[0].cropNameTamil,
              parentCategory: response.groups[0].category,
              bgColor: response.groups[0].bgColor,
            };
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
    });
  }


 

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
      

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage = e.target?.result as string | ArrayBuffer;
      };
      reader.readAsDataURL(file);
    }
  }


  // onSubmit() {
  //   if (!this.selectedFile) {
  //     alert('Please select an image file.');
  //     return;
  //   }

  //   this.isLoading = true;

  //   // Create FormData object
  //   const formData = new FormData();
  //   formData.append('cropNameEnglish', this.cropGroup.cropNameEnglish);
  //   formData.append('cropNameSinhala', this.cropGroup.cropNameSinahala);  // Adjust as needed
  //   formData.append('cropNameTamil', this.cropGroup.cropNameTamil);    // Adjust as needed
  //   formData.append('category', this.cropGroup.parentCategory);
  //   formData.append('bgColor', this.cropGroup.bgColor);
  //   formData.append('image', this.selectedFile);  // The key should match backend's expected field name

  //   // Send POST request to backend
  //   this.cropCalendarService.createCropGroup(formData).subscribe({
  //     next: (response: any) => {
  //       console.log(formData);
  //       console.log('Crop group created successfully:', response);
  //       this.isLoading = false;
  //       Swal.fire(
  //         'Success',
  //         response.message,
  //         'success'
  //       );
  //       this.router.navigate(['/plant-care/view-crop-group']);
  //     },
  //     error: (error) => {
  //       console.error('Error creating crop group:', error);
  //       this.isLoading = false;
  //       Swal.fire(
  //         'Error',
  //         error,
  //         'error'
  //       );
  //     }
  //   });
  // }



  onSubmit() {
    this.isLoading = true;
  
    // Create FormData object
    const formData = new FormData();
    if (this.cropGroup.cropNameEnglish) formData.append('cropNameEnglish', this.cropGroup.cropNameEnglish);
    if (this.cropGroup.cropNameSinahala) formData.append('cropNameSinhala', this.cropGroup.cropNameSinahala);
    if (this.cropGroup.cropNameTamil) formData.append('cropNameTamil', this.cropGroup.cropNameTamil);
    if (this.cropGroup.parentCategory) formData.append('category', this.cropGroup.parentCategory);
    if (this.cropGroup.bgColor) formData.append('bgColor', this.cropGroup.bgColor);
    if (this.selectedFile) formData.append('image', this.selectedFile); // Only include if a new file is selected
  
    if (this.itemId) {
      // Update existing crop group
      console.log('hii',formData)
      this.cropCalendarService.updateCropGroup(this.itemId, formData).subscribe({
        next: (response: any) => {
          console.log('Crop group updated successfully:', response);
          this.isLoading = false;
          Swal.fire('Success', response.message, 'success');
          this.router.navigate(['/plant-care/view-crop-group']);
        },
        error: (error) => {
          console.error('Error updating crop group:', error);
          this.isLoading = false;
          Swal.fire('Error', error, 'error');
        },
      });
    } else {
      // Create new crop group
      this.cropCalendarService.createCropGroup(formData).subscribe({
        next: (response: any) => {
          console.log('Crop group created successfully:', response);
          this.isLoading = false;
          Swal.fire('Success', response.message, 'success');
          this.router.navigate(['/plant-care/view-crop-group']);
        },
        error: (error) => {
          console.error('Error creating crop group:', error);
          this.isLoading = false;
          Swal.fire('Error', error, 'error');
        },
      });
    }
  }
  

  onCancel() {
    // Reset form or navigate away
    console.log('Cancelled');
    this.router.navigate(['/plant-care']);
  }

  triggerFileInput(event: Event): void {
    event.preventDefault();
    const fileInput = document.getElementById('imageUpload') as HTMLElement;
    fileInput.click();
  }

  onColorChange(event: any): void {
    this.cropGroup.bgColor = event.color.hex;
  }




  updateCropGroup() {
    if (!this.selectedFile && !this.selectedImage) {
      alert('Please select an image file.');
      return;
    }
  
    this.isLoading = true;
  
    // Create FormData object
    const formData = new FormData();
    formData.append('cropNameEnglish', this.cropGroup.cropNameEnglish);
    formData.append('cropNameSinhala', this.cropGroup.cropNameSinahala); // Adjust as needed
    formData.append('cropNameTamil', this.cropGroup.cropNameTamil);     // Adjust as needed
    formData.append('category', this.cropGroup.parentCategory);
    formData.append('bgColor', this.cropGroup.bgColor);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile); // Include only if a new file is selected
    }
  console.log('hiiii',formData);
    // Send PUT request to backend
    if (this.itemId !== null) {
    this.cropCalendarService.updateCropGroup(this.itemId, formData).subscribe({
      next: (response: any) => {
        console.log('Crop group updated successfully:', response);
        this.isLoading = false;
        Swal.fire('Success', response.message, 'success');
        this.router.navigate(['/plant-care/view-crop-group']);
      },
      error: (error) => {
        console.error('Error updating crop group:', error);
        this.isLoading = false;
        Swal.fire('Error', error, 'error');
      },
    });
  }
  }
  

}
