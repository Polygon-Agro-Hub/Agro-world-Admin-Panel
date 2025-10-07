import { CommonModule, Location } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { NgxColorsModule } from 'ngx-colors';
import { CropCalendarService } from '../../../services/plant-care/crop-calendar.service';
import Swal from 'sweetalert2';
import { environment } from '../../../environment/environment';
import { TokenService } from '../../../services/token/services/token.service';
import { DropdownModule } from 'primeng/dropdown';
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
    DropdownModule,
    LoadingSpinnerComponent,
    NgxColorsModule,
  ],
  templateUrl: './create-crop-group.component.html',
  styleUrl: './create-crop-group.component.css',
})
export class CreateCropGroupComponent {
  @ViewChild('cropForm') cropForm!: NgForm;

  imageTouched = false;

  // Allow only English letters and spaces (no leading space)
  allowOnlyEnglish(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const char = event.key;
    if (char === ' ' && input.selectionStart === 0) {
      event.preventDefault();
      return;
    }
    if (!/^[a-zA-Z ]$/.test(char) && event.key.length === 1) {
      event.preventDefault();
    }
  }

  capitalizeFirstLetter(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value.length > 0) {
      const capitalized = input.value.charAt(0).toUpperCase() + input.value.slice(1);
      const cursorPos = input.selectionStart || 0;

      this.cropGroup.cropNameEnglish = capitalized;
      input.value = capitalized;

      // Restore cursor position to avoid jumpiness
      input.setSelectionRange(cursorPos, cursorPos);
    }
  }

  // Allow only Tamil letters (Unicode range: 0B80–0BFF) and spaces (no leading space)
  allowOnlyTamil(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const char = event.key;
    if (char === ' ' && input.selectionStart === 0) {
      event.preventDefault();
      return;
    }
    if (!/^[\u0B80-\u0BFF ]$/.test(char) && event.key.length === 1) {
      event.preventDefault();
    }
  }

  // Allow only Sinhala letters (Unicode range: 0D80–0DFF) and spaces (no leading space)
  allowOnlySinhala(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const char = event.key;
    if (char === ' ' && input.selectionStart === 0) {
      event.preventDefault();
      return;
    }
    if (!/^[\u0D80-\u0DFF ]$/.test(char) && event.key.length === 1) {
      event.preventDefault();
    }
  }

  cropGroup = {
    cropNameEnglish: '',
    cropNameSinahala: '',
    cropNameTamil: '',
    parentCategory: '',
    bgColor: '',
    fileName: '',
  };

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
    private tokenService: TokenService,
    private location: Location,
  ) { }
  categories = [
    { label: 'Vegetables', value: 'Vegetables' },
    { label: 'Fruits', value: 'Fruit' },
    // { label: 'Grains', value: 'Grain' },
    { label: 'Cereals', value: 'Cereals' },
    { label: 'Spices', value: 'Spices' },
    { label: 'Mushrooms', value: 'Mushrooms' },
    { label: 'Legumes', value: 'Legumes' },
  ];

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

            // if (!this.newsItems[0].category) {
            //   this.newsItems[0].category = 'Fruits';
            // }
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
    this.imageTouched = true;
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
    // Mark all fields as touched to trigger validation messages
    if (this.cropForm) {
      Object.keys(this.cropForm.controls).forEach(key => {
        this.cropForm.controls[key].markAsTouched();
      });
    }
    this.imageTouched = true;

    // Collect all validation errors
    const errors: string[] = [];

    if (!this.cropGroup.cropNameEnglish) {
      errors.push('Please fill the Crop Name in English');
    }

    if (!this.cropGroup.cropNameSinahala) {
      errors.push('Please fill the Crop Name in Sinhala');
    }

    if (!this.cropGroup.cropNameTamil) {
      errors.push('Please fill the Crop Name in Tamil');
    }

    if (!this.cropGroup.parentCategory) {
      errors.push('Please select a Parent Category');
    }

    if (!this.cropGroup.bgColor) {
      errors.push('Please choose a Background Color');
    }

    const onlyNumbersPattern = /^[0-9]+$/;

    // if (onlyNumbersPattern.test(this.cropGroup.cropNameEnglish)) {
    //   errors.push("Crop name can't be only numbers (English)");
    // }

    // if (onlyNumbersPattern.test(this.cropGroup.cropNameSinahala)) {
    //   errors.push("Crop name can't be only numbers (Sinhala)");
    // }

    // if (onlyNumbersPattern.test(this.cropGroup.cropNameTamil)) {
    //   errors.push("Crop name can't be only numbers (Tamil)");
    // }

    if (!this.selectedFile) {
      errors.push('Please select an image file');
    }

    // If there are validation errors, show them in SweetAlert
    if (errors.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Errors',
        html: errors.join('<br>'),
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        },
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

    // Add the file only if it exists
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    formData.append('fileName', this.selectedFileName);

    this.cropCalendarService.createCropGroup(formData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.status) {
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: response.message,
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
            },
          });
          this.router.navigate(['/plant-care/action/view-crop-group']);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Unsuccess',
            text: response.message,
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
            },
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Something went wrong!',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          },
        });
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
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.selectedFile = null;
        this.selectedImage = null;
        this.imageTouched = false;
        this.cropGroup = {
          cropNameEnglish: '',
          cropNameSinahala: '',
          cropNameTamil: '',
          parentCategory: '',
          bgColor: '',
          fileName: '',
        };
        this.location.back();
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
    this.imageTouched = true;
    const fileInput = document.getElementById('imageUpload') as HTMLElement;
    fileInput.click();
  }

  onColorChange(event: any): void {
    this.cropGroup.bgColor = event.color.hex;
  }

  updateNews() {
    // Mark all fields as touched to trigger validation messages
    if (this.cropForm) {
      Object.keys(this.cropForm.controls).forEach(key => {
        this.cropForm.controls[key].markAsTouched();
      });
    }

    // Collect all validation errors
    const errors: string[] = [];

    if (!this.newsItems[0].cropNameEnglish) {
      errors.push('Please fill the Crop Name in English');
    }

    if (!this.newsItems[0].cropNameSinhala) {
      errors.push('Please fill the Crop Name in Sinhala');
    }

    if (!this.newsItems[0].cropNameTamil) {
      errors.push('Please fill the Crop Name in Tamil');
    }

    if (!this.newsItems[0].category) {
      errors.push('Please select a Parent Category');
    }

    if (!this.newsItems[0].bgColor) {
      errors.push('Please choose a Background Color');
    }

    // If there are validation errors, show them in SweetAlert
    if (errors.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Errors',
        html: errors.join('<br>'),
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        },
      });
      return;
    }

    const token = this.tokenService.getToken();
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Authentication token not found',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        },
      });
      return;
    }

    if (!this.newsItems || this.newsItems.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No crop group data found',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        },
      });
      return;
    }

    const newsItem = this.newsItems[0];

    const formData = new FormData();
    formData.append('cropNameEnglish', newsItem.cropNameEnglish || '');
    formData.append('cropNameSinhala', newsItem.cropNameSinhala || '');
    formData.append('cropNameTamil', newsItem.cropNameTamil || '');
    formData.append('category', newsItem.category || '');
    formData.append('bgColor', newsItem.bgColor || '');

    // Add the file only if it exists
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
              text: 'Crop group has been updated successfully',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold',
              },
            });
            this.router.navigate(['/plant-care/action/view-crop-group']);
          } else {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Unsuccess',
              text: res.message,
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold',
              },
            });
          }
        },
        (error) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Unsuccessful',
            text: 'Error updating crop group',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
            },
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
    }).then((result) => {
      if (result.isConfirmed) {
        this.location.back();
      }
    });
  }

  backEdit(): void {
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
    }).then((result) => {
      if (result.isConfirmed) {
        this.location.back();
      }
    });
  }

  // Prevent leading spaces
  preventLeadingSpace(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    if (event.key === ' ' && input.selectionStart === 0) {
      event.preventDefault();
    }
  }

}