import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";
import { NgxColorsModule } from 'ngx-colors';
import { CropCalendarService } from '../../../services/plant-care/crop-calendar.service';
import Swal from 'sweetalert2';
import { environment } from '../../../environment/environment';


interface NewsItem {
  id: number;
  cropNameEnglish: string;
  cropNameSinhala: string;
  cropNameTamil: string;
  category: string;
  bgColor: string;
  image: string;

}

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
    cropNameSinahala: '',
    cropNameTamil: '',
    parentCategory: '',
    bgColor: '',
    fileName: ''
  };
  categories = ['Fruit', 'Grain', 'Mushrooms', 'Vegetables'];
  imagePreview: string | ArrayBuffer | null = null;
  isLoading = false;
  selectedFileName: string = '';
  selectedImage: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  selectUpdateName!: string

  itemId: number | null = null;

  newsItems: NewsItem[] = [];


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private cropCalendarService: CropCalendarService
  ) { }


  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.itemId = params['id'] ? +params['id'] : null;
      console.log('Received item ID:', this.itemId);

      if (this.itemId) {
        // Fetch crop group details for editing
        this.isLoading = true;
        this.cropCalendarService.getCropGroupById(this.itemId).subscribe({
          next: (response: any) => {
            this.newsItems = response.groups;
            this.selectUpdateName = response.groups[0].cropNameEnglish

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


  onSubmit() {
    if (!this.cropGroup.cropNameEnglish || !this.cropGroup.cropNameSinahala || !this.cropGroup.cropNameTamil || !this.cropGroup.parentCategory || !this.cropGroup.bgColor) {
      Swal.fire(
        'warning',
        'pleace fill all input feilds',
        'warning'
      );
      return;
    }
    if (!this.selectedFile) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid File Type',
        text: 'Please select an image file.',
      });
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
    formData.append('image', this.selectedFile);  // The key should match backend's expected field name selectedFileName
    formData.append('fileName', this.selectedFileName);  // The key should match backend's expected field name selectedFileName

    // Send POST request to backend
    this.cropCalendarService.createCropGroup(formData).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.isLoading = false;
          Swal.fire(
            'Success',
            response.message,
            'success'
          );
          this.router.navigate(['/plant-care/view-crop-group']);
        } else {
          this.isLoading = false;
          Swal.fire(
            'Unsuccess',
            response.message,
            'error'
          );
        }

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
    // this.router.navigate(['/plant-care']);
    this.cropGroup = {
      cropNameEnglish: '',
      cropNameSinahala: '',
      cropNameTamil: '',
      parentCategory: '',
      bgColor: '',
      fileName: ''
    };
    Swal.fire({
      icon: 'info',
      title: 'Cancelled',
      text: 'Form has been cleared!',
      timer: 2000,
      showConfirmButton: false,
    });
  }

  onCancelUpdate() {
    // Reset form or navigate away
    // this.router.navigate(['/plant-care']);

    this.ngOnInit();

    Swal.fire({
      icon: 'info',
      title: 'Cancelled',
      text: 'Form has been cleared!',
      timer: 2000,
      showConfirmButton: false,
    });
  }

  triggerFileInput(event: Event): void {
    event.preventDefault();
    const fileInput = document.getElementById('imageUpload') as HTMLElement;
    fileInput.click();
  }

  onColorChange(event: any): void {
    this.cropGroup.bgColor = event.color.hex;
  }




  // updateCropGroup() {
  //   if (!this.selectedFile && !this.selectedImage) {
  //     alert('Please select an image file.');
  //     return;
  //   }

  //   this.isLoading = true;

  //   // Create FormData object
  //   const formData = new FormData();
  //   formData.append('cropNameEnglish', this.cropGroup.cropNameEnglish);
  //   formData.append('cropNameSinhala', this.cropGroup.cropNameSinahala); // Adjust as needed
  //   formData.append('cropNameTamil', this.cropGroup.cropNameTamil);     // Adjust as needed
  //   formData.append('category', this.cropGroup.parentCategory);
  //   formData.append('bgColor', this.cropGroup.bgColor);
  //   if (this.selectedFile) {
  //     formData.append('image', this.selectedFile); // Include only if a new file is selected
  //   }
  // console.log('hiiii',formData);
  //   // Send PUT request to backend
  //   if (this.itemId !== null) {
  //   this.cropCalendarService.updateCropGroup(this.itemId, formData).subscribe({
  //     next: (response: any) => {
  //       console.log('Crop group updated successfully:', response);
  //       this.isLoading = false;
  //       Swal.fire('Success', response.message, 'success');
  //       this.router.navigate(['/plant-care/view-crop-group']);
  //     },
  //     error: (error) => {
  //       console.error('Error updating crop group:', error);
  //       this.isLoading = false;
  //       Swal.fire('Error', error, 'error');
  //     },
  //   });
  // }
  // }




  updateNews() {

    if (!this.newsItems[0].cropNameEnglish || !this.newsItems[0].cropNameSinhala || !this.newsItems[0].cropNameTamil || !this.newsItems[0].bgColor) {
      Swal.fire(
        'warning',
        'pleace fill all input feilds',
        'warning'
      );
      return;
    }

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
    formData.append('cropNameEnglish', newsItem.cropNameEnglish || '');
    formData.append('cropNameSinhala', newsItem.cropNameSinhala || '');
    formData.append('cropNameTamil', newsItem.cropNameTamil || '');
    formData.append('category', newsItem.category || '');
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
        `${environment.API_URL}crop-calendar/update-crop-group/${this.itemId}/${this.selectUpdateName}`,
        formData,
        { headers }
      )
      .subscribe(
        (res: any) => {
          if (res.status) {
            this.isLoading = false;
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Market Price updated successfully!',
            });
            this.router.navigate(['/plant-care/view-crop-group']);
          } else {
            this.isLoading = false;
            Swal.fire(
              'Unsuccess',
              res.message,
              'error'
            );
          }
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

  ischeckEnglish = false;

  checkEnglishName(): boolean {
    this.ischeckEnglish = true
    if (this.cropGroup.cropNameEnglish) {
      return false
    }
    return true
  }



}
