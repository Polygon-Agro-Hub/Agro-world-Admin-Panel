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
  CropPassId: number | null = null;

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
      varietyNameEnglish: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern(/^(?!\d+$)[\s\S]*/),
        ],
      ],
      varietyNameSinhala: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern(/^(?!\d+$)[\s\S]*/),
        ],
      ],
      varietyNameTamil: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern(/^(?!\d+$)[\s\S]*/),
        ],
      ],
      descriptionEnglish: ['', [Validators.required, Validators.minLength(10)]],
      descriptionSinhala: ['', [Validators.required, Validators.minLength(10)]],
      descriptionTamil: ['', [Validators.required, Validators.minLength(10)]],
      bgColor: new FormControl('', Validators.required),
      image: [null, [Validators.required]],
    });
  }

  ngOnInit() {
    this.getAllCropGroups();
    this.route.queryParams.subscribe((params) => {
      this.itemId = params['id'] ? +params['id'] : null;
      this.CropPassId = params['cid'] ? +params['cid'] : null;

      if (this.itemId) {
        this.isLoading = true;
        this.cropCalendarService.getCropVarietyById(this.itemId).subscribe({
          next: (response: any) => {
            this.newsItems = response.groups;
            if (response.groups[0].image) {
              this.selectedImage = response.groups[0].image;
              this.selectedFileName = 'Existing Image';
            }
            this.isLoading = false;
          },
          error: () => {
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

  onVarietyNameInput(event: any, field: string): void {
  let value = event.target.value;
  
  // Trim leading spaces immediately
  value = value.replace(/^\s+/, '');
  
  // If the field becomes empty after trimming, set it to empty
  if (value === '') {
    event.target.value = '';
    if (field === 'english') {
      this.cropForm.patchValue({ varietyNameEnglish: '' });
    } else if (field === 'sinhala') {
      this.cropForm.patchValue({ varietyNameSinhala: '' });
    } else if (field === 'tamil') {
      this.cropForm.patchValue({ varietyNameTamil: '' });
    }
    return;
  }

  // Capitalize first letter
  if (value.length > 0) {
    value = value.charAt(0).toUpperCase() + value.slice(1);
  }

  if (field === 'english') {
    this.cropForm.patchValue({ varietyNameEnglish: value });
  } else if (field === 'sinhala') {
    this.cropForm.patchValue({ varietyNameSinhala: value });
  } else if (field === 'tamil') {
    this.cropForm.patchValue({ varietyNameTamil: value });
  }

  event.target.value = value;
}

  onDescriptionInput(event: any, field: string): void {
  let value = event.target.value;
  
  // Trim leading spaces immediately
  value = value.replace(/^\s+/, '');
  
  // If the field becomes empty after trimming, set it to empty
  if (value === '') {
    event.target.value = '';
    if (field === 'english') {
      this.cropForm.patchValue({ descriptionEnglish: '' });
    } else if (field === 'sinhala') {
      this.cropForm.patchValue({ descriptionSinhala: '' });
    } else if (field === 'tamil') {
      this.cropForm.patchValue({ descriptionTamil: '' });
    }
    return;
  }

  if (field === 'english') {
    this.cropForm.patchValue({ descriptionEnglish: value });
  } else if (field === 'sinhala') {
    this.cropForm.patchValue({ descriptionSinhala: value });
  } else if (field === 'tamil') {
    this.cropForm.patchValue({ descriptionTamil: value });
  }

  event.target.value = value;
}

  onEditVarietyNameInput(event: any, field: string): void {
  let value = event.target.value;
  
  // Trim leading spaces immediately
  value = value.replace(/^\s+/, '');
  
  // If the field becomes empty after trimming, set it to empty
  if (value === '') {
    event.target.value = '';
    if (field === 'english') {
      this.newsItems[0].varietyNameEnglish = '';
    } else if (field === 'sinhala') {
      this.newsItems[0].varietyNameSinhala = '';
    } else if (field === 'tamil') {
      this.newsItems[0].varietyNameTamil = '';
    }
    return;
  }

  // Capitalize first letter
  if (value.length > 0) {
    value = value.charAt(0).toUpperCase() + value.slice(1);
  }

  if (field === 'english') {
    this.newsItems[0].varietyNameEnglish = value;
  } else if (field === 'sinhala') {
    this.newsItems[0].varietyNameSinhala = value;
  } else if (field === 'tamil') {
    this.newsItems[0].varietyNameTamil = value;
  }

  event.target.value = value;
}

  onEditDescriptionInput(event: any, field: string): void {
  let value = event.target.value;
  
  // Trim leading spaces immediately
  value = value.replace(/^\s+/, '');
  
  // If the field becomes empty after trimming, set it to empty
  if (value === '') {
    event.target.value = '';
    if (field === 'english') {
      this.newsItems[0].descriptionEnglish = '';
    } else if (field === 'sinhala') {
      this.newsItems[0].descriptionSinhala = '';
    } else if (field === 'tamil') {
      this.newsItems[0].descriptionTamil = '';
    }
    return;
  }

  if (field === 'english') {
    this.newsItems[0].descriptionEnglish = value;
  } else if (field === 'sinhala') {
    this.newsItems[0].descriptionSinhala = value;
  } else if (field === 'tamil') {
    this.newsItems[0].descriptionTamil = value;
  }

  event.target.value = value;
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
      } else if (
        this.cropForm.controls['varietyNameEnglish'].hasError('pattern')
      ) {
        errorMessages.push(
          'Variety name cannot be only numbers and special characters are not allowed'
        );
      }

      if (this.cropForm.controls['varietyNameSinhala'].hasError('required')) {
        errorMessages.push('Sinhala variety name is required.');
      } else if (
        this.cropForm.controls['varietyNameSinhala'].hasError('pattern')
      ) {
        errorMessages.push(
          'Variety name cannot be only numbers and only Sinhala characters and numbers are allowed'
        );
      }

      if (this.cropForm.controls['varietyNameTamil'].hasError('required')) {
        errorMessages.push('Tamil variety name is required.');
      } else if (
        this.cropForm.controls['varietyNameTamil'].hasError('pattern')
      ) {
        errorMessages.push(
          'Variety name cannot be only numbers and only tamil characters and numbers are allowed'
        );
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
                    ${errorMessages
              .map(
                (msg) => `<li style="margin-bottom: 5px;">${msg}</li>`
              )
              .join('')}
                 </ul>`,
          icon: 'warning',
          confirmButtonText: 'OK',
        });
        return;
      }
    }

    this.isLoading = true;
    const formData = new FormData();

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


  // Add these methods to your component class

  // Prevent invalid English characters (allow letters, numbers, spaces, and common punctuation)
  preventInvalidEnglishAlphanumericCharacters(event: KeyboardEvent): void {
    const char = event.key;

    // Allow control keys (backspace, delete, tab, escape, enter, etc.)
    if (event.ctrlKey || event.altKey || event.metaKey ||
      char === 'Backspace' || char === 'Delete' || char === 'Tab' ||
      char === 'Escape' || char === 'Enter' || char === 'ArrowLeft' ||
      char === 'ArrowRight' || char === 'ArrowUp' || char === 'ArrowDown' ||
      char === 'Home' || char === 'End') {
      return;
    }

    // Allow English letters, numbers, spaces, and common punctuation
    const englishAlphanumericRegex = /^[a-zA-Z0-9\s.,!?()-]$/;
    if (!englishAlphanumericRegex.test(char)) {
      event.preventDefault();
    }
  }

  // Validate and filter pasted English content
  validateEnglishPaste(event: ClipboardEvent): void {
    event.preventDefault();

    const pastedText = event.clipboardData?.getData('text') || '';
    const englishAlphanumericRegex = /[a-zA-Z0-9\s.,!?()-]/g;

    // Filter out invalid characters, keeping only valid ones
    const filteredText = pastedText.match(englishAlphanumericRegex)?.join('') || '';

    // Insert the filtered text at cursor position
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const start = target.selectionStart || 0;
    const end = target.selectionEnd || 0;
    const currentValue = target.value;

    target.value = currentValue.substring(0, start) + filteredText + currentValue.substring(end);

    // Set cursor position after inserted text
    const newPosition = start + filteredText.length;
    target.setSelectionRange(newPosition, newPosition);

    // Trigger input event for Angular form validation
    target.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // Prevent invalid Sinhala characters (allow Sinhala unicode, numbers, spaces, and common punctuation)
  preventInvalidSinhalaAlphanumericCharacters(event: KeyboardEvent): void {
    const char = event.key;

    // Allow control keys
    if (event.ctrlKey || event.altKey || event.metaKey ||
      char === 'Backspace' || char === 'Delete' || char === 'Tab' ||
      char === 'Escape' || char === 'Enter' || char === 'ArrowLeft' ||
      char === 'ArrowRight' || char === 'ArrowUp' || char === 'ArrowDown' ||
      char === 'Home' || char === 'End') {
      return;
    }

    // Allow Sinhala characters, numbers, spaces, and common punctuation
    const sinhalaAlphanumericRegex = /^[\u0D80-\u0DFF0-9\s.,!?()-]$/;
    if (!sinhalaAlphanumericRegex.test(char)) {
      event.preventDefault();
    }
  }

  // Validate and filter pasted Sinhala content
  validateSinhalaPaste(event: ClipboardEvent): void {
    event.preventDefault();

    const pastedText = event.clipboardData?.getData('text') || '';
    const sinhalaAlphanumericRegex = /[\u0D80-\u0DFF0-9\s.,!?()-]/g;

    // Filter out invalid characters, keeping only valid ones
    const filteredText = pastedText.match(sinhalaAlphanumericRegex)?.join('') || '';

    // Insert the filtered text at cursor position
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const start = target.selectionStart || 0;
    const end = target.selectionEnd || 0;
    const currentValue = target.value;

    target.value = currentValue.substring(0, start) + filteredText + currentValue.substring(end);

    // Set cursor position after inserted text
    const newPosition = start + filteredText.length;
    target.setSelectionRange(newPosition, newPosition);

    // Trigger input event for Angular form validation
    target.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // Prevent invalid Tamil characters (allow Tamil unicode, numbers, spaces, and common punctuation)
  preventInvalidTamilAlphanumericCharacters(event: KeyboardEvent): void {
    const char = event.key;

    // Allow control keys
    if (event.ctrlKey || event.altKey || event.metaKey ||
      char === 'Backspace' || char === 'Delete' || char === 'Tab' ||
      char === 'Escape' || char === 'Enter' || char === 'ArrowLeft' ||
      char === 'ArrowRight' || char === 'ArrowUp' || char === 'ArrowDown' ||
      char === 'Home' || char === 'End') {
      return;
    }

    // Allow Tamil characters, numbers, spaces, and common punctuation
    const tamilAlphanumericRegex = /^[\u0B80-\u0BFF0-9\s.,!?()-]$/;
    if (!tamilAlphanumericRegex.test(char)) {
      event.preventDefault();
    }
  }

  // Validate and filter pasted Tamil content
  validateTamilPaste(event: ClipboardEvent): void {
    event.preventDefault();

    const pastedText = event.clipboardData?.getData('text') || '';
    const tamilAlphanumericRegex = /[\u0B80-\u0BFF0-9\s.,!?()-]/g;

    // Filter out invalid characters, keeping only valid ones
    const filteredText = pastedText.match(tamilAlphanumericRegex)?.join('') || '';

    // Insert the filtered text at cursor position
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const start = target.selectionStart || 0;
    const end = target.selectionEnd || 0;
    const currentValue = target.value;

    target.value = currentValue.substring(0, start) + filteredText + currentValue.substring(end);

    // Set cursor position after inserted text
    const newPosition = start + filteredText.length;
    target.setSelectionRange(newPosition, newPosition);

    // Trigger input event for Angular form validation
    target.dispatchEvent(new Event('input', { bubbles: true }));
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
          if (this.CropPassId) {
            this.cropForm.patchValue({ groupId: this.CropPassId });
          }
        },
        error: () => {
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

    if (!token) return;

    if (!this.newsItems || this.newsItems.length === 0) return;

    const newsItem = this.newsItems[0];

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
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Variety updated successfully!',
          });
          this.router.navigate(['/plant-care/action/view-crop-group']);
        },
        () => {
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
  Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: 'You may lose the added data after going back!',
    showCancelButton: true,
    confirmButtonText: 'Yes, Go Back',
    cancelButtonText: 'No, Stay Here',
  }).then((result) => {
    if (result.isConfirmed) {
      this.router.navigate(['/plant-care/action']);
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
  }).then((result) => {
    if (result.isConfirmed) {
      this.router.navigate(['/plant-care/action/view-crop-group']);
    }
  });
}


 
}
