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
  

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private cropCalendarService: CropCalendarService
  ) {}

  // onFileSelected(event: Event) {
  //   const file = (event.target as HTMLInputElement).files?.[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       this.imagePreview = reader.result;
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }

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


  onSubmit() {
    if (!this.selectedFile) {
      alert('Please select an image file.');
      return;
    }

    this.isLoading = true;

    // Create FormData object
    const formData = new FormData();
    formData.append('cropNameEnglish', this.cropGroup.cropNameEnglish);
    formData.append('cropNameSinhala', this.cropGroup.cropNameSinahala);  // Adjust as needed
    formData.append('cropNameTamil', this.cropGroup.cropNameTamil);    // Adjust as needed
    formData.append('category', this.cropGroup.parentCategory);
    formData.append('bgColor', this.cropGroup.bgColor);
    formData.append('image', this.selectedFile);  // The key should match backend's expected field name

    // Send POST request to backend
    this.cropCalendarService.createCropGroup(formData).subscribe({
      next: (response: any) => {
        console.log(formData);
        console.log('Crop group created successfully:', response);
        this.isLoading = false;
        Swal.fire(
          'Success',
          response.message,
          'success'
        );
        // this.router.navigate(['/success-route']); 
      },
      error: (error) => {
        console.error('Error creating crop group:', error);
        this.isLoading = false;
        Swal.fire(
          'Error',
          error,
          'error'
        );
      }
    });
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
  

}
