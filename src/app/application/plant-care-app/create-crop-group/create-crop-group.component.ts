import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { NgxColorsModule } from 'ngx-colors';
import { CropCalendarService } from '../../../services/plant-care/crop-calendar.service';
import Swal from 'sweetalert2';
import { environment } from '../../../environment/environment';
import { TokenService } from '../../../services/token/services/token.service';

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
  imports: [
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    NgxColorsModule,
  ],
  templateUrl: './create-crop-group.component.html',
  styleUrl: './create-crop-group.component.css',
})
export class CreateCropGroupComponent {
  cropGroup = {
    cropNameEnglish: '',
    cropNameSinahala: '',
    cropNameTamil: '',
    parentCategory: '',
    bgColor: '',
    fileName: '',
  };
  categories = ['Fruit', 'Grain', 'Mushrooms', 'Vegetables'];
  imagePreview: string | ArrayBuffer | null = null;
  isLoading = false;
  selectedFileName: string = '';
  selectedImage: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  selectUpdateName!: string;

  itemId: number | null = null;

  newsItems: NewsItem[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private cropCalendarService: CropCalendarService,
    private tokenService: TokenService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.itemId = params['id'] ? +params['id'] : null;

      if (this.itemId) {
        this.isLoading = true;
        this.cropCalendarService.getCropGroupById(this.itemId).subscribe({
          next: (response: any) => {
            this.newsItems = response.groups;
            this.selectUpdateName = response.groups[0].cropNameEnglish;

            if (response.groups[0].image) {
              this.selectedImage = response.groups[0].image;
              this.selectedFileName = 'Existing Image';
            }
            this.isLoading = false;
          },
          error: (error) => {
            this.isLoading = false;
          },
        });
      }
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];

    if (file) {
      const allowedTypes = ['image/png', 'image/jpeg'];

      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File',
          text: 'Only PNG and JPEG images are allowed!',
          confirmButtonText: 'OK',
        });
        return;
      }

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
    if (!this.cropGroup.cropNameEnglish) {
      Swal.fire('Warning', 'Please fill the Crop Name in English', 'warning');
      return;
    }

    if (!this.cropGroup.cropNameSinahala) {
      Swal.fire('Warning', 'Please fill the Crop Name in Sinhala', 'warning');
      return;
    }

    if (!this.cropGroup.cropNameTamil) {
      Swal.fire('Warning', 'Please fill the Crop Name in Tamil', 'warning');
      return;
    }

    if (!this.cropGroup.parentCategory) {
      Swal.fire('Warning', 'Please select a Parent Category', 'warning');
      return;
    }

    if (!this.cropGroup.bgColor) {
      Swal.fire('Warning', 'Please choose a Background Color', 'warning');
      return;
    }

    const onlyNumbersPattern = /^[0-9]+$/;

    if (onlyNumbersPattern.test(this.cropGroup.cropNameEnglish)) {
      Swal.fire('Warning', "crop name can't be only numbers", 'warning');
      return;
    }

    if (onlyNumbersPattern.test(this.cropGroup.cropNameSinahala)) {
      Swal.fire('Warning', "crop name can't be only numbers", 'warning');
      return;
    }

    if (onlyNumbersPattern.test(this.cropGroup.cropNameTamil)) {
      Swal.fire('Warning', "crop name can't be only numbers", 'warning');
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

    const formData = new FormData();
    formData.append('cropNameEnglish', this.cropGroup.cropNameEnglish);
    formData.append('cropNameSinhala', this.cropGroup.cropNameSinahala);
    formData.append('cropNameTamil', this.cropGroup.cropNameTamil);
    formData.append('category', this.cropGroup.parentCategory);
    formData.append('bgColor', this.cropGroup.bgColor);
    formData.append('image', this.selectedFile);
    formData.append('fileName', this.selectedFileName);

    this.cropCalendarService.createCropGroup(formData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.status) {
          this.isLoading = false;
          Swal.fire('Success', response.message, 'success');
          this.router.navigate(['/plant-care/action/view-crop-group']);
        } else {
          Swal.fire('Unsuccess', response.message, 'error');
        }
      },
      error: (error) => {
        this.isLoading = false;
        Swal.fire('Error', 'Something went wrong!', 'error');
      },
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
        this.selectedFile = null;
        this.selectedImage = null;
        this.cropGroup = {
          cropNameEnglish: '',
          cropNameSinahala: '',
          cropNameTamil: '',
          parentCategory: '',
          bgColor: '',
          fileName: '',
        };
        this.router.navigate(['/plant-care/action']);
      }
    });
  }

  onCancelUpdate() {
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

  updateNews() {
    if (
      !this.newsItems[0].cropNameEnglish ||
      !this.newsItems[0].cropNameSinhala ||
      !this.newsItems[0].cropNameTamil ||
      !this.newsItems[0].bgColor
    ) {
      Swal.fire('warning', 'pleace fill all input feilds', 'warning');
      return;
    }

    const token = this.tokenService.getToken();
    if (!token) {
      return;
    }

    if (!this.newsItems || this.newsItems.length === 0) {
      return;
    }

    const newsItem = this.newsItems[0];

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
              text: 'Crop Group Updated Successful!',
            });
            this.router.navigate(['/plant-care/action/view-crop-group']);
          } else {
            this.isLoading = false;
            Swal.fire('Unsuccess', res.message, 'error');
          }
        },
        (error) => {
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
    this.ischeckEnglish = true;
    if (this.cropGroup.cropNameEnglish) {
      return false;
    }
    return true;
  }

  backCreate(): void {
    this.router.navigate(['/plant-care/action']);
  }

  backEdit(): void {
    this.router.navigate(['/plant-care/action/view-crop-group']);
  }
}
