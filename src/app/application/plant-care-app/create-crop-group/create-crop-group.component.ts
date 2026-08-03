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
  costFeild: string;
  incomeFeild: string;
  bgColor: string;
  image: string;
  seedRate: string;
  rowSpace: string;
  plantSpace: string;
  AvgYield: string;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
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
      const capitalized =
        input.value.charAt(0).toUpperCase() + input.value.slice(1);
      const cursorPos = input.selectionStart || 0;

      this.cropGroup.cropNameEnglish = capitalized;
      input.value = capitalized;

      input.setSelectionRange(cursorPos, cursorPos);
    }
  }

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
    costFeild: '',
    incomeFeild: '',
    bgColor: '',
    fileName: '',
    seedRate: '',
    rowSpace: '',
    plantSpace: '',
    AvgYield: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
  };

  imagePreview: string | ArrayBuffer | null = null;
  isLoading = false;
  selectedFileName: string = '';
  selectedImage: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  selectUpdateName!: string;

  itemId: number | null = null;

  newsItems: NewsItem[] = [];

  isInputClicked: boolean = false;
  errorMassage: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private cropCalendarService: CropCalendarService,
    private tokenService: TokenService,
    private location: Location,
  ) {}
  categories = [
    { label: 'Vegetables', value: 'Vegetables' },
    { label: 'Fruits', value: 'Fruit' },
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
            this.selectUpdateName = response.groups[0]?.cropNameEnglish;

            if (response.groups[0]?.image) {
              this.selectedImage = response.groups[0]?.image;
              this.selectedFileName = 'Existing Image';
            }

            this.newsItems[0].seedRate = this.formatExactValue(
              this.newsItems[0].seedRate,
            );
            this.newsItems[0].rowSpace = this.formatExactValue(
              this.newsItems[0].rowSpace,
            );
            this.newsItems[0].plantSpace = this.formatExactValue(
              this.newsItems[0].plantSpace,
            );
            this.newsItems[0].AvgYield = this.formatExactValue(
              this.newsItems[0].AvgYield,
            );
            this.newsItems[0].nitrogen = this.formatExactValue(
              this.newsItems[0].nitrogen,
            );
            this.newsItems[0].phosphorus = this.formatExactValue(
              this.newsItems[0].phosphorus,
            );
            this.newsItems[0].potassium = this.formatExactValue(
              this.newsItems[0].potassium,
            );
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
    if (this.isInputClicked && !this.selectedFile) {
      this.errorMassage = 'Please select an image';
    } else if (this.isInputClicked && this.selectedFile) {
      this.errorMassage = '';
    }
  }

  onSubmit() {
    if (this.cropForm) {
      Object.keys(this.cropForm.controls).forEach((key) => {
        this.cropForm.controls[key].markAsTouched();
      });
    }
    this.imageTouched = true;

    if (this.isInputClicked && !this.selectedFile) {
      this.errorMassage = 'Please select an image';
    }

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

    if (!this.cropGroup.costFeild) {
      errors.push('Please fill the Cost per acre field');
    }

    if (!this.cropGroup.incomeFeild) {
      errors.push('Please fill the Income per acre field');
    }

    if (!this.cropGroup.seedRate) {
      errors.push('Please fill the Recommended Seed Rate');
    }
    if (!this.cropGroup.rowSpace) {
      errors.push('Please fill the Row Spacing');
    }
    if (!this.cropGroup.plantSpace) {
      errors.push('Please fill the Plant Spacing');
    }
    if (!this.cropGroup.AvgYield) {
      errors.push('Please fill the Average Yield');
    }
    if (
      !this.cropGroup.nitrogen ||
      !this.cropGroup.phosphorus ||
      !this.cropGroup.potassium
    ) {
      errors.push('Please fill all NPK Ratio values');
    }

    if (!this.cropGroup.bgColor) {
      errors.push('Please choose a Background Color');
    }

    const onlyNumbersPattern = /^[0-9]+$/;

    if (!this.selectedFile) {
      errors.push('Please select an image file');
    }

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
    formData.append('costFeild', this.cropGroup.costFeild);
    formData.append('incomeFeild', this.cropGroup.incomeFeild);
    formData.append('seedRate', this.cropGroup.seedRate);
    formData.append('rowSpace', this.cropGroup.rowSpace);
    formData.append('plantSpace', this.cropGroup.plantSpace);
    formData.append('AvgYield', this.cropGroup.AvgYield);
    formData.append('nitrogen', this.cropGroup.nitrogen);
    formData.append('phosphorus', this.cropGroup.phosphorus);
    formData.append('potassium', this.cropGroup.potassium);
    formData.append('bgColor', this.cropGroup.bgColor);

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
              popup:
                'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
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
              popup:
                'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
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
          costFeild: '',
          incomeFeild: '',
          bgColor: '',
          fileName: '',
          seedRate: '',
          rowSpace: '',
          plantSpace: '',
          AvgYield: '',
          nitrogen: '',
          phosphorus: '',
          potassium: '',
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
    this.isInputClicked = true;
  }

  onColorChange(event: any): void {
    this.cropGroup.bgColor = event.color.hex;
  }

  onColorChangeEdit(event: any): void {
    this.newsItems[0].bgColor = event.color.hex;
  }

  updateNews() {
    if (this.cropForm) {
      Object.keys(this.cropForm.controls).forEach((key) => {
        this.cropForm.controls[key].markAsTouched();
      });
    }

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

    if (!this.newsItems[0].costFeild) {
      errors.push('Please fill the Cost per acre field');
    }

    if (!this.newsItems[0].incomeFeild) {
      errors.push('Please fill the Income per acre field');
    }

    if (!this.newsItems[0].seedRate) {
      errors.push('Please fill the Recommended Seed Rate');
    }
    if (!this.newsItems[0].rowSpace) {
      errors.push('Please fill the Row Spacing');
    }
    if (!this.newsItems[0].plantSpace) {
      errors.push('Please fill the Plant Spacing');
    }
    if (!this.newsItems[0].AvgYield) {
      errors.push('Please fill the Average Yield');
    }
    if (
      !this.newsItems[0].nitrogen ||
      !this.newsItems[0].phosphorus ||
      !this.newsItems[0].potassium
    ) {
      errors.push('Please fill all NPK Ratio values');
    }

    if (!this.newsItems[0].bgColor) {
      errors.push('Please choose a Background Color');
    }

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
    formData.append('costFeild', newsItem.costFeild || '');
    formData.append('incomeFeild', newsItem.incomeFeild || '');
    formData.append('bgColor', newsItem.bgColor || '');
    formData.append('seedRate', newsItem.seedRate || '');
    formData.append('rowSpace', newsItem.rowSpace || '');
    formData.append('plantSpace', newsItem.plantSpace || '');
    formData.append('AvgYield', newsItem.AvgYield || '');
    formData.append('nitrogen', newsItem.nitrogen || '');
    formData.append('phosphorus', newsItem.phosphorus || '');
    formData.append('potassium', newsItem.potassium || '');

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
        { headers },
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
                popup:
                  'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
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
                popup:
                  'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
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
              popup:
                'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
            },
          });
        },
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

  preventLeadingSpace(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    if (event.key === ' ' && input.selectionStart === 0) {
      event.preventDefault();
    }
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const char = event.key;

    if (char === ' ' && input.selectionStart === 0) {
      event.preventDefault();
      return;
    }

    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'];

    if (char === '.' && !input.value.includes('.')) {
      return;
    }

    if (!/^\d$/.test(char) && !allowedKeys.includes(char)) {
      event.preventDefault();
    }
  }

  allowDecimal3Places(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const char = event.key;
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
    ];

    if (allowedKeys.includes(char)) return;

    if (char === '.') {
      if (input.value.includes('.')) {
        event.preventDefault();
        return;
      }
      return;
    }

    if (input.value.includes('.')) {
      const dotIndex = input.value.indexOf('.');
      const selStart = input.selectionStart || 0;
      const decimalPart = input.value.split('.')[1];
      if (selStart > dotIndex && decimalPart.length >= 3) {
        event.preventDefault();
        return;
      }
    }

    if (!/^\d$/.test(char)) event.preventDefault();
  }

  allowDecimal1Place(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const char = event.key;
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
    ];

    if (allowedKeys.includes(char)) return;

    if (char === '.') {
      if (input.value.includes('.')) {
        event.preventDefault();
        return;
      }
      return;
    }

    if (input.value.includes('.')) {
      const dotIndex = input.value.indexOf('.');
      const selStart = input.selectionStart || 0;
      const decimalPart = input.value.split('.')[1];
      if (selStart > dotIndex && decimalPart.length >= 1) {
        event.preventDefault();
        return;
      }
    }

    if (!/^\d$/.test(char)) event.preventDefault();
  }

  allowOnlyIntegers(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const char = event.key;
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
    ];

    if (allowedKeys.includes(char)) return;
    if (!/^\d$/.test(char)) event.preventDefault();
  }

  allowDecimal2Places(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const char = event.key;
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
    ];

    if (allowedKeys.includes(char)) return;

    if (char === ' ' && input.selectionStart === 0) {
      event.preventDefault();
      return;
    }

    if (char === '.') {
      if (input.value.includes('.')) {
        event.preventDefault();
        return;
      }
      return;
    }

    if (input.value.includes('.')) {
      const dotIndex = input.value.indexOf('.');
      const selStart = input.selectionStart || 0;
      const decimalPart = input.value.split('.')[1];
      if (selStart > dotIndex && decimalPart.length >= 2) {
        event.preventDefault();
        return;
      }
    }

    if (!/^\d$/.test(char)) event.preventDefault();
  }

  formatExactValue(value: any): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    const num = parseFloat(value);
    if (isNaN(num)) {
      return '';
    }
    return num.toString();
  }
}
