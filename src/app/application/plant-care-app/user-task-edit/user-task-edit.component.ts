import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup,FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NewsService } from '../../../services/plant-care/news.service';
import { OngoingCultivationService } from '../../../services/plant-care/ongoing-cultivation.service';
import { CropCalendarService } from '../../../services/plant-care/crop-calendar.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { TokenService } from '../../../services/token/services/token.service';
import { Location } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';

class CropTask {
  'id': number;
  'taskIndex': string;
  'startingDate': any;
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
  'reqImages': number;
  'videoLinkEnglish': any;
  'videoLinkSinhala': any;
  'videoLinkTamil': any;
  'imageLink': any;
}

@Component({
  selector: 'app-user-task-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CalendarModule],
  templateUrl: './user-task-edit.component.html',
  styleUrl: './user-task-edit.component.css',
})
export class UserTaskEditComponent {
   taskForm!: FormGroup;
  id: any | null = null;
  taskItems: CropTask = new CropTask();
  selectedLanguage: 'english' | 'sinhala' | 'tamil' = 'english';
  hasImageLink: boolean = false;
  formSubmitted: boolean = false;
  hasVideoLink: boolean = false;

  

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private newsService: NewsService,
    private ongoingCultivationService: OngoingCultivationService,
    private router: Router,
    private taskService: CropCalendarService,
    private tokenService: TokenService,
      private location: Location
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.id = params['id'] ? +params['id'] : null;
    });

    this.getTaskById(this.id);
  }

  selectLanguage(lang: 'english' | 'sinhala' | 'tamil') {
    this.selectedLanguage = lang;
  }

    allowOnlyNumbers(event: any) {
  let value = event.target.value;

  // Remove any non-digit characters
  value = value.replace(/[^0-9]/g, '');

  // Update input value and form control
  event.target.value = value;
 this.taskForm.get('reqImages')?.setValue(value);
}
validateAndCapitalizeEnglish(event: any, field: 'taskEnglish' | 'taskTypeEnglish'| 'taskCategoryEnglish' | 'taskDescriptionEnglish') {
  let value = event.target.value;

  // Step 2: Capitalize first letter
  if (value.length > 0) {
    value = value.charAt(0).toUpperCase() + value.slice(1);
  }

  // Update both the input box and ngModel
  event.target.value = value;
  this.taskItems[field] = value;
}

onVideoLinkChange(hasVideo: boolean) {
  this.hasVideoLink = hasVideo;
  if (!hasVideo) {
    // Clear video link fields when 'No' is selected
    this.taskItems.videoLinkEnglish = '';
    this.taskItems.videoLinkSinhala = '';
    this.taskItems.videoLinkTamil = '';
  }
}


getTaskById(id: any) {
  this.taskService.getUserCropTaskBycropId(id).subscribe(
    (data) => {
      this.taskItems = data;
      this.taskItems.startingDate = this.formatDate(this.taskItems.startingDate);

      // Images
      this.hasImageLink = !!this.taskItems.imageLink;

      // Videos
      this.hasVideoLink =
        !!this.taskItems.videoLinkEnglish ||
        !!this.taskItems.videoLinkSinhala ||
        !!this.taskItems.videoLinkTamil;

      console.log(this.taskItems.reqImages);
      

      // Set default value of 0 if reqImages is null/undefined
      if (this.taskItems.reqImages == null || this.taskItems.reqImages === undefined) {
        this.taskItems.reqImages = 0;
      }
    },
    (error) => {
      console.error(error);
    }
  );
}
  onImageLinkChange(hasImage: boolean) {
    this.hasImageLink = hasImage;
  }

updateTask() {
  this.formSubmitted = true;

  // Array to store missing or invalid field messages
  const missingFields: string[] = [];

  // Validate form fields
  if (!this.taskItems.startingDate) {
    missingFields.push('Starting Date is required');
  }

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
    missingFields.push('Require Images is required');
  }

  // Validate imageLink only if hasImageLink is true
  if (this.hasImageLink && !this.taskItems.imageLink) {
    missingFields.push('Image Link is required when Require Images is set to Yes');
  }

  if (this.hasVideoLink) {
  if (!this.taskItems.videoLinkEnglish) missingFields.push('Video Link English is required');
  if (!this.taskItems.videoLinkSinhala) missingFields.push('Video Link Sinhala is required');
  if (!this.taskItems.videoLinkTamil) missingFields.push('Video Link Tamil is required');
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

  // If valid, confirm update
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

      // Create a copy of taskItems to avoid modifying the original
      const taskData = {
        ...this.taskItems,
        startingDate: this.formatDate(this.taskItems.startingDate),
        imageLink: this.hasImageLink ? this.taskItems.imageLink : null,
      };

      console.log('taskData', taskData)

      this.taskService.updateUserCropTask(this.id, taskData).subscribe({
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

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

onKeyDown(event: KeyboardEvent, fieldValue: string): void {
  // Block space at the very beginning
  if ((event.key === ' ' || event.code === 'Space') && fieldValue.length === 0) {
    event.preventDefault();
  }

  // Block if cursor is at index 0 and tries to type space
  const input = event.target as HTMLInputElement;
  if ((event.key === ' ' || event.code === 'Space') && input.selectionStart === 0) {
    event.preventDefault();
  }
}


  validateEnglishInput(event: any) {
    const englishRegex = /^[a-zA-Z\s.,!?'"-]*$/;
    let value = event.target.value;

    // Remove leading spaces
    if (value.startsWith(' ')) {
      value = value.trimStart();
      event.target.value = value;
    }

    // Validate English characters
    if (!englishRegex.test(value)) {
      event.target.value = value.slice(0, -1);
    }
  }

  validateSinhalaInput(event: any) {
    const sinhalaRegex = /^[\u0D80-\u0DFF\s.,!?'"-]*$/; // Sinhala Unicode range
    let value = event.target.value;

    // Remove leading spaces
    if (value.startsWith(' ')) {
      value = value.trimStart();
      event.target.value = value;
    }

    // Validate Sinhala characters
    if (!sinhalaRegex.test(value)) {
      event.target.value = value.slice(0, -1);
    }
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

  validateTamilInput(event: any) {
    const tamilRegex = /^[\u0B80-\u0BFF\s.,!?'"-]*$/; // Tamil Unicode range
    let value = event.target.value;

    // Remove leading spaces
    if (value.startsWith(' ')) {
      value = value.trimStart();
      event.target.value = value;
    }

    // Validate Tamil characters
    if (!tamilRegex.test(value)) {
      event.target.value = value.slice(0, -1);
    }
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
