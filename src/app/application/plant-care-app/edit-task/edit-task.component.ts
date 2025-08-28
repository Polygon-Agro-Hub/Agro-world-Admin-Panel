
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CropCalendarService } from '../../../services/plant-care/crop-calendar.service';
import { TokenService } from '../../../services/token/services/token.service';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';

class CropTask {
  id: number = 0;
  taskIndex: string = '';
  days: string = '';
  startingDate: string = ''; // Added missing property
  taskTypeEnglish: string = '';
  taskTypeSinhala: string = '';
  taskTypeTamil: string = '';
  taskCategoryEnglish: string = '';
  taskCategorySinhala: string = '';
  taskCategoryTamil: string = '';
  taskEnglish: string = '';
  taskSinhala: string = '';
  taskTamil: string = '';
  taskDescriptionEnglish: string = '';
  taskDescriptionSinhala: string = '';
  taskDescriptionTamil: string = '';
  reqImages: string = '';
  imageLink: string = '';
  videoLinkEnglish: string = '';
  videoLinkSinhala: string = '';
  videoLinkTamil: string = '';
}

@Component({
  selector: 'app-edit-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-task.component.html',
  styleUrls: ['./edit-task.component.css'],
})
export class EditTaskComponent implements OnInit {
  taskForm: FormGroup;
  cropTask: CropTask = new CropTask();
  selectedLanguage: 'english' | 'sinhala' | 'tamil' = 'english';
  itemId!: string;
  taskItems: CropTask = new CropTask();
  formSubmitted: boolean = false; // Added missing property

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private taskService: CropCalendarService,
    private tokenService: TokenService,
    private location: Location
  ) {
    this.taskForm = this.fb.group({
      taskEnglish: ['', Validators.required],
      taskTypeEnglish: ['', Validators.required],
      taskCategoryEnglish: ['', Validators.required],
      taskDescriptionEnglish: ['', Validators.required],
      taskSinhala: ['', Validators.required],
      taskTypeSinhala: ['', Validators.required],
      taskCategorySinhala: ['', Validators.required],
      taskDescriptionSinhala: ['', Validators.required],
      taskTamil: ['', Validators.required],
      taskTypeTamil: ['', Validators.required],
      taskCategoryTamil: ['', Validators.required],
      taskDescriptionTamil: ['', Validators.required],
      reqImages: ['0', [Validators.pattern(/^(0|[1-9][0-9]*)$/)]],
      hasImageLink: [false],
      imageLink: [''],
      videoLinkEnglish: [''],
      videoLinkSinhala: [''],
      videoLinkTamil: [''],
    });
  }

  ngOnInit() {
    this.itemId = this.route.snapshot.params['id'];
    this.getTaskById(this.itemId);

    // Update imageLink validation based on hasImageLink
    this.taskForm.get('hasImageLink')?.valueChanges.subscribe((hasImageLink) => {
      const imageLinkControl = this.taskForm.get('imageLink');
      if (hasImageLink) {
        imageLinkControl?.setValidators([Validators.required]);
      } else {
        imageLinkControl?.clearValidators();
      }
      imageLinkControl?.updateValueAndValidity();
    });
  }

  selectLanguage(lang: 'english' | 'sinhala' | 'tamil') {
    this.selectedLanguage = lang;
  }

  allowOnlyEnglishLetters(event: KeyboardEvent): void {
    const allowedControlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
    if (allowedControlKeys.includes(event.key)) return;

    const input = event.currentTarget as HTMLInputElement;
    if (event.key === ' ' && input.selectionStart === 0) {
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
    if (event.key === ' ' && input.selectionStart === 0) {
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
    if (event.key === ' ' && input.selectionStart === 0) {
      event.preventDefault();
      return;
    }

    const isTamil = /^[\u0B80-\u0BFF]$/.test(event.key);
    if (!isTamil && event.key !== ' ') {
      event.preventDefault();
    }
  }

  allowOnlyNumbers(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9]/g, '');
    input.value = value;
    this.taskForm.get('reqImages')?.setValue(value);
  }

  capitalizeFirstLetter(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value.length > 0) {
      input.value = value.charAt(0).toUpperCase() + value.slice(1);
      this.taskForm.get(input.name)?.setValue(input.value);
    }
  }

  getTaskById(id: string) {
    this.taskService.getCropTaskBycropId(id).subscribe(
      (data) => {
        this.taskItems = data;
        this.taskForm.patchValue({
          taskEnglish: this.taskItems.taskEnglish,
          taskTypeEnglish: this.taskItems.taskTypeEnglish,
          taskCategoryEnglish: this.taskItems.taskCategoryEnglish,
          taskDescriptionEnglish: this.taskItems.taskDescriptionEnglish,
          taskSinhala: this.taskItems.taskSinhala,
          taskTypeSinhala: this.taskItems.taskTypeSinhala,
          taskCategorySinhala: this.taskItems.taskCategorySinhala,
          taskDescriptionSinhala: this.taskItems.taskDescriptionSinhala,
          taskTamil: this.taskItems.taskTamil,
          taskTypeTamil: this.taskItems.taskTypeTamil,
          taskCategoryTamil: this.taskItems.taskCategoryTamil,
          taskDescriptionTamil: this.taskItems.taskDescriptionTamil,
          reqImages: this.taskItems.reqImages || '0',
          hasImageLink: !!this.taskItems.imageLink,
          imageLink: this.taskItems.imageLink,
          videoLinkEnglish: this.taskItems.videoLinkEnglish,
          videoLinkSinhala: this.taskItems.videoLinkSinhala,
          videoLinkTamil: this.taskItems.videoLinkTamil,
        });
      },
      (error) => {
        console.error('Error fetching task:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch task details.',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          },
        });
      }
    );
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

  updateTask() {
  this.formSubmitted = true;

  // Mark all form controls as touched to trigger validation messages
  Object.keys(this.taskForm.controls).forEach(key => {
    this.taskForm.get(key)?.markAsTouched();
  });

  // Check if the form is invalid
  if (this.taskForm.invalid) {
    // Array to store missing or invalid field messages
    const missingFields: string[] = [];

    // Check each form control for errors
    Object.keys(this.taskForm.controls).forEach(key => {
      const control = this.taskForm.get(key);
      if (control?.invalid) {
        let fieldName = key;
        let errorMessage = '';
        
        // Customize field names
        if (key.includes('English')) fieldName = key.replace('English', ' (English)');
        if (key.includes('Sinhala')) fieldName = key.replace('Sinhala', ' (Sinhala)');
        if (key.includes('Tamil')) fieldName = key.replace('Tamil', ' (Tamil)');
        if (key === 'reqImages') fieldName = 'Required Images';
        if (key === 'imageLink') fieldName = 'Image Link';
        
        // Specific error messages
        if (control.errors?.['required']) {
          errorMessage = `${fieldName} is required`;
        } else if (control.errors?.['pattern']) {
          if (key === 'reqImages') {
            errorMessage = 'Required Images must be a valid number (no leading zeros or decimals)';
          } else {
            errorMessage = `${fieldName} has an invalid format`;
          }
        } else {
          errorMessage = `${fieldName} is invalid`;
        }
        
        missingFields.push(errorMessage);
      }
    });

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

      return;
    }
  }

  // Update taskItems with form values
  this.taskItems = {
    ...this.taskItems,
    ...this.taskForm.value,
  };

  // Array to store missing or invalid field messages
  const missingFields: string[] = [];

  // Validate form fields
  // if (!this.taskItems.startingDate) {
  //   missingFields.push('Starting Date is required');
  // }
  if (!this.taskItems.taskTypeEnglish) {
    missingFields.push('Task Type (English) is required');
  }
  if (!this.taskItems.taskTypeSinhala) {
    missingFields.push('Task Type (Sinhala) is required');
  }
  if (!this.taskItems.taskTypeTamil) {
    missingFields.push('Task Type (Tamil) is required');
  }
  if (!this.taskItems.taskCategoryEnglish) {
    missingFields.push('Task Category (English) is required');
  }
  if (!this.taskItems.taskCategorySinhala) {
    missingFields.push('Task Category (Sinhala) is required');
  }
  if (!this.taskItems.taskCategoryTamil) {
    missingFields.push('Task Category (Tamil) is required');
  }
  if (!this.taskItems.taskEnglish) {
    missingFields.push('Task (English) is required');
  }
  if (!this.taskItems.taskSinhala) {
    missingFields.push('Task (Sinhala) is required');
  }
  if (!this.taskItems.taskTamil) {
    missingFields.push('Task (Tamil) is required');
  }
  if (!this.taskItems.taskDescriptionEnglish) {
    missingFields.push('Task Description (English) is required');
  }
  if (!this.taskItems.taskDescriptionSinhala) {
    missingFields.push('Task Description (Sinhala) is required');
  }
  if (!this.taskItems.taskDescriptionTamil) {
    missingFields.push('Task Description (Tamil) is required');
  }
  if (this.taskItems.reqImages === null || this.taskItems.reqImages === undefined) {
    missingFields.push('Required Images is required');
  }
  if (this.taskForm.get('hasImageLink')?.value && !this.taskItems.imageLink) {
    missingFields.push('Image Link is required when Require Images is set to Yes');
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

    return;
  }

  // Confirm update
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

  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you really want to update this crop task?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, update it!',
    cancelButtonText: 'Cancel',
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      // Prepare task data
      const taskData = {
        ...this.taskItems,
        imageLink: this.taskForm.get('hasImageLink')?.value ? this.taskItems.imageLink : null,
      };

      this.taskService.updateCropTask(this.itemId, taskData).subscribe({
        next: (res: any) => {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Task updated successfully!',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
            },
          }).then(() => {
            this.location.back();
          });
          this.formSubmitted = false;
        },
        error: (error) => {
          let errorMessage = 'There was an error updating the crop task.';
          if (error.error?.error) {
            errorMessage = error.error.error;
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.status === 400) {
            errorMessage = 'Invalid data sent to server. Please check your inputs.';
          }
          Swal.fire({
            icon: 'error',
            title: 'Unsuccessful',
            text: errorMessage,
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
            },
          });
          this.formSubmitted = false;
        },
      });
    }
  });
}

   onImageLinkChange() {
    if (!this.taskForm.get('hasImageLink')?.value) {
    this.taskForm.get('imageLink')?.setErrors(null);
  }
  }



  // Format date to YYYY-MM-DD
  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }
}

export class CreateTask {
  taskTypeEnglish: string = '';
  taskTypeSinhala: string = '';
  taskTypeTamil: string = '';
  taskCategoryEnglish: string = '';
  taskCategorySinhala: string = '';
  taskCategoryTamil: string = '';
  taskEnglish: string = '';
  taskSinhala: string = '';
  taskTamil: string = '';
  taskDescriptionEnglish: string = '';
  taskDescriptionSinhala: string = '';
  taskDescriptionTamil: string = '';
}