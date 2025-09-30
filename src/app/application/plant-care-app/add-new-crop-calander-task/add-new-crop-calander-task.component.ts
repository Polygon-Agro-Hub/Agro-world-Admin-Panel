import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxColorsModule } from 'ngx-colors';
import { ActivatedRoute, Router } from '@angular/router';
import { CropCalendarService } from '../../../services/plant-care/crop-calendar.service';
import Swal from 'sweetalert2';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Location } from '@angular/common';
@Component({
  selector: 'app-add-new-crop-calander-task',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    LoadingSpinnerComponent,
    MatFormFieldModule,
    NgxColorsModule,
    FormsModule,
    RadioButtonModule,
  ],
  templateUrl: './add-new-crop-calander-task.component.html',
  styleUrl: './add-new-crop-calander-task.component.css',
})
export class AddNewCropCalanderTaskComponent implements OnInit {
  cultivationId: any | null = null;
  userName: string = '';
  isLoading = false;
  cropId!: string;
  userId!: string;
  indexId!: string;
  onCulscropID!: string;
  days!: string;
  selectedLanguage: 'english' | 'sinhala' | 'tamil' = 'english';
  taskForm: FormGroup;
  cropTaskObj: Croptask = new Croptask();
  requireImageLink: string = 'no';
  requireVideoLink: string = 'no';
  ongCultivationId: number | null = null;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cropCalendarService: CropCalendarService,
    private location: Location
  ) {
    this.taskForm = this.fb.group({
      cropId: ['', [Validators.required]],
      days: ['', [Validators.required]],
      taskTypeEnglish: ['', [Validators.required]],
      taskTypeSinhala: ['', [Validators.required]],
      taskTypeTamil: ['', [Validators.required]],
      taskCategoryEnglish: ['', [Validators.required]],
      taskCategorySinhala: ['', [Validators.required]],
      taskCategoryTamil: ['', [Validators.required]],
      taskEnglish: ['', [Validators.required]],
      taskSinhala: ['', [Validators.required]],
      taskTamil: ['', [Validators.required]],
      taskDescriptionEnglish: ['', [Validators.required]],
      taskDescriptionSinhala: ['', [Validators.required]],
      taskDescriptionTamil: ['', [Validators.required]],
      reqImages: ['no', [Validators.required]], // Initialize with 'no'
      imageLink: [''],
      requireVideoLink: ['no', [Validators.required]], // Add this
      videoLinkEnglish: [''],
      videoLinkSinhala: [''],
      videoLinkTamil: [''],
      images: [''],
    });
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.cultivationId = params['cultivationId'] ? +params['cultivationId'] : null;
      this.userName = params['userName'] ? params['userName'] : '';
      this.ongCultivationId = params['ongCultivationId'] === 'null' ? null : params['ongCultivationId']
    });
    this.cropId = this.route.snapshot.params['cropId'];
    this.indexId = this.route.snapshot.params['indexId'];
    this.userId = this.route.snapshot.params['userId'];
    this.onCulscropID = this.route.snapshot.params['onCulscropID'];

    // Watch for changes in requireVideoLink
    this.taskForm.get('requireVideoLink')?.valueChanges.subscribe((value) => {
      const videoFields = ['videoLinkEnglish', 'videoLinkSinhala', 'videoLinkTamil'];
      videoFields.forEach((field) => {
        const control = this.taskForm.get(field);
        if (value === 'yes') {
          control?.setValidators([Validators.required]);
        } else {
          control?.clearValidators();
        }
        control?.updateValueAndValidity();
      });
    });

    // Watch for changes in reqImages
    this.taskForm.get('reqImages')?.valueChanges.subscribe((value) => {
      const imageFields = ['imageLink', 'images'];
      imageFields.forEach((field) => {
        const control = this.taskForm.get(field);
        if (value === 'yes') {
          control?.setValidators([Validators.required]);
        } else {
          control?.clearValidators();
        }
        control?.updateValueAndValidity();
      });
    });
  }

  selectLanguage(lang: 'english' | 'sinhala' | 'tamil') {
    this.selectedLanguage = lang;
  }

  back(): void {
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


  allowOnlyEnglishLetters(event: KeyboardEvent): void {
    const allowedControlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
    if (allowedControlKeys.includes(event.key)) return;

    const input = event.currentTarget as HTMLInputElement;
    const currentValue = input.value;

    // Prevent space at beginning during typing or editing
    if (event.key === ' ' && (currentValue === '' || input.selectionStart === 0 || currentValue.startsWith(' '))) {
      event.preventDefault();
      return;
    }

    const isLetter = /^[a-zA-Z]$/.test(event.key);
    if (!isLetter && event.key !== ' ') {
      event.preventDefault();
    }
  }

  allowOnlySinhalaLetters(event: KeyboardEvent): void {
    const allowedControlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
    if (allowedControlKeys.includes(event.key)) return;

    const input = event.currentTarget as HTMLInputElement;
    const currentValue = input.value;

    if (event.key === ' ' && (currentValue === '' || input.selectionStart === 0 || currentValue.startsWith(' '))) {
      event.preventDefault();
      return;
    }

    const isSinhala = /^[\u0D80-\u0DFF]$/.test(event.key);
    if (!isSinhala && event.key !== ' ') {
      event.preventDefault();
    }
  }

  allowOnlyTamilLetters(event: KeyboardEvent): void {
    const allowedControlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
    if (allowedControlKeys.includes(event.key)) return;

    const input = event.currentTarget as HTMLInputElement;
    const currentValue = input.value;

    if (event.key === ' ' && (currentValue === '' || input.selectionStart === 0 || currentValue.startsWith(' '))) {
      event.preventDefault();
      return;
    }

    const isTamil = /^[\u0B80-\u0BFF]$/.test(event.key);
    if (!isTamil && event.key !== ' ') {
      event.preventDefault();
    }
  }
  // This handles space trimming while typing or editing
  autoTrimStart(event: Event): void {
    const input = event.target as HTMLInputElement;
    const original = input.value;
    const trimmed = original.replace(/^\s+/, ''); // Trim leading spaces
    if (original !== trimmed) {
      input.value = trimmed;
    }
  }

  // This handles pasting with leading space
  removeLeadingSpace(event: ClipboardEvent): void {
    const input = event.target as HTMLInputElement;
    setTimeout(() => {
      input.value = input.value.trimStart();
    }, 0); // Wait for paste to complete
  }


  capitalizeFirstLetter(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value.length > 0) {
      input.value = value.charAt(0).toUpperCase() + value.slice(1);
    }
  }

  blockZeroValue(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value === '0') {
      input.value = '';
      this.cropTaskObj.reqImages = '';

    }
  }


  onSubmit() {
    // Log the entire form value and the task object
    console.log('Form Value:', this.taskForm.value);
    console.log('Task Object:', this.cropTaskObj);
    // Array to store missing or invalid field messages
    const missingFields: string[] = [];

    // Validate form fields
    // if (this.taskForm.get('cropId')?.invalid) {
    //   missingFields.push('Crop ID is required');
    // }

    // if (this.taskForm.get('startingDate')?.invalid) {
    //   missingFields.push('Starting Date is required');
    // }

    if (this.taskForm.get('taskTypeEnglish')?.invalid) {
      missingFields.push('Task Type (English) is required');
    }

    if (this.taskForm.get('taskTypeSinhala')?.invalid) {
      missingFields.push('Task Type (Sinhala) is required');
    }

    if (this.taskForm.get('taskTypeTamil')?.invalid) {
      missingFields.push('Task Type (Tamil) is required');
    }

    if (this.taskForm.get('taskCategoryEnglish')?.invalid) {
      missingFields.push('Task Category (English) is required');
    }

    if (this.taskForm.get('taskCategorySinhala')?.invalid) {
      missingFields.push('Task Category (Sinhala) is required');
    }

    if (this.taskForm.get('taskCategoryTamil')?.invalid) {
      missingFields.push('Task Category (Tamil) is required');
    }

    if (this.taskForm.get('taskEnglish')?.invalid) {
      missingFields.push('Task (English) is required');
    }

    if (this.taskForm.get('taskSinhala')?.invalid) {
      missingFields.push('Task (Sinhala) is required');
    }

    if (this.taskForm.get('taskTamil')?.invalid) {
      missingFields.push('Task (Tamil) is required');
    }

    if (this.taskForm.get('taskDescriptionEnglish')?.invalid) {
      missingFields.push('Task Description (English) is required');
    }

    if (this.taskForm.get('taskDescriptionSinhala')?.invalid) {
      missingFields.push('Task Description (Sinhala) is required');
    }

    if (this.taskForm.get('taskDescriptionTamil')?.invalid) {
      missingFields.push('Task Description (Tamil) is required');
    }

    if (this.taskForm.get('reqImages')?.invalid) {
      missingFields.push('Require Images is required');
    }



    // Validate imageLink and images fields based on requireImageLink
    if (this.requireImageLink === 'yes') {
      if (this.taskForm.get('imageLink')?.invalid) {
        missingFields.push('Image Link is required when Require Images is set to Yes');
      }
      if (this.taskForm.get('images')?.invalid) {
        missingFields.push('Images are required when Require Images is set to Yes');
      }
    }

    if (this.requireVideoLink === 'yes') {
      if (this.taskForm.get('videoLinkEnglish')?.invalid || !this.cropTaskObj.videoLinkEnglish) {
        missingFields.push('Video Link English is required when "Want to Add Videos?" is Yes');
      }
      if (this.taskForm.get('videoLinkSinhala')?.invalid || !this.cropTaskObj.videoLinkSinhala) {
        missingFields.push('Video Link Sinhala is required when "Want to Add Videos?" is Yes');
      }
      if (this.taskForm.get('videoLinkTamil')?.invalid || !this.cropTaskObj.videoLinkTamil) {
        missingFields.push('Video Link Tamil is required when "Want to Add Videos?" is Yes');
      }
    }

    // If there are validation errors, show popup and stop submission
    if (missingFields.length > 0) {
      let errorMessage = '<div class="text-left"><p class="mb-2">Please fix the following issues:</p><ul class="list-disc pl-5">';
      missingFields.forEach((field) => {
        errorMessage += `<li>${field}</li>`;
      });
      errorMessage += '</ul></div>';

      Swal.fire({
        icon: 'error',
        title: 'Missing or Invalid Information',
        html: errorMessage,
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
          htmlContainer: 'text-left',
        },
      });

      // Mark all fields as touched to show real-time errors
      this.taskForm.markAllAsTouched();
      return;
    }

    // If valid, proceed with submission
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to add this new crop calendar task?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, add it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        if (this.userId === 'null') {
          this.cropCalendarService
            .createNewCropTask(this.cropId, this.indexId, this.cropTaskObj)
            .subscribe({
              next: (res) => {
                this.isLoading = false;
                if (res) {
                  Swal.fire({
                    title: 'Success',
                    text: 'New Crop Calendar Task Added!',
                    icon: 'success',
                    customClass: {
                      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                      title: 'font-semibold text-lg',
                      htmlContainer: 'text-left',
                    }
                  }).then(() => {
                    this.location.back();
                  });
                } else {
                  Swal.fire({
                    title: 'Error',
                    text: 'Error occurred in adding task!',
                    icon: 'error',
                    customClass: {
                      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                      title: 'font-semibold text-lg',
                      htmlContainer: 'text-left',
                    }
                  });
                }
              },
              error: (error) => {
                this.isLoading = false;
                let errorMessage = 'There was an error adding the crop calendar task.';
                if (error.error?.error) {
                  errorMessage = error.error.error;
                } else if (error.error?.message) {
                  errorMessage = error.error.message;
                } else if (error.status === 400) {
                  errorMessage = 'Invalid data sent to server. Please check your inputs.';
                }
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: errorMessage,
                  confirmButtonText: 'OK',
                  customClass: {
                    popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                    title: 'font-semibold text-lg',
                  },
                });
              },
            });
        } else {
          this.cropCalendarService
            .createNewCropTaskU(this.cropId, this.indexId, this.userId, this.cropTaskObj, this.cultivationId, this.ongCultivationId)
            .subscribe({
              next: (res) => {
                this.isLoading = false;
                if (res) {
                  Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'New Crop Calendar Task Added!',
                    confirmButtonText: 'OK',
                    customClass: {
                      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                      title: 'font-semibold text-lg',
                    },
                  }).then(() => {
                    this.location.back();
                  });
                } else {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error occurred in adding task!',
                    confirmButtonText: 'OK',
                    customClass: {
                      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                      title: 'font-semibold text-lg',
                    },
                  });
                }
              },
              error: (error) => {
                this.isLoading = false;
                let errorMessage = 'There was an error adding the crop calendar task.';
                if (error.error?.error) {
                  errorMessage = error.error.error;
                } else if (error.error?.message) {
                  errorMessage = error.error.message;
                } else if (error.status === 400) {
                  errorMessage = 'Invalid data sent to server. Please check your inputs.';
                }
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: errorMessage,
                  confirmButtonText: 'OK',
                  customClass: {
                    popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                    title: 'font-semibold text-lg',
                  },
                });
              },
            });
        }
      } else {
        this.isLoading = false;
      }
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
        this.location.back();

      }
    });
  }


  onlyAllowIntegers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
}

class Croptask {
  'cropId': string;
  'days': string;
  'taskTypeEnglish': string;
  'taskTypeSinhala': string;
  'taskTypeTamil': string;
  'taskCategoryEnglish': string;
  'taskCategorySinhala': string;
  'taskCategoryTamil': string;
  'taskEnglish': string;
  'taskSinhala': string;
  'taskTamil': string;
  'taskDescriptionEnglish': string;
  'taskDescriptionSinhala': string;
  'taskDescriptionTamil': string;
  'reqImages': string;
  'imageLink': string;
  'videoLinkEnglish': string;
  'videoLinkSinhala': string;
  'videoLinkTamil': string;
}
