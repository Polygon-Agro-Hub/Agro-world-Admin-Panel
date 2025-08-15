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
  'reqImages': any;
  'videoLinkEnglish': any;
  'videoLinkSinhala': any;
  'videoLinkTamil': any;
  'imageLink': any;
}

@Component({
  selector: 'app-user-task-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
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
  // Step 1: Remove non-English characters
  let value = event.target.value.replace(/[^A-Za-z\s]/g, '');

  // Step 2: Capitalize first letter
  if (value.length > 0) {
    value = value.charAt(0).toUpperCase() + value.slice(1);
  }

  // Update both the input box and ngModel
  event.target.value = value;
  this.taskItems[field] = value;
}



  getTaskById(id: any) {
  this.taskService.getUserCropTaskBycropId(id).subscribe(
    (data) => {
      this.taskItems = data;
      this.taskItems.startingDate = this.formatDate(
        this.taskItems.startingDate
      );
      this.hasImageLink = !!this.taskItems.imageLink;
      
      // Set default value of 0 if reqImages is null/undefined
      if (this.taskItems.reqImages == null || this.taskItems.reqImages === undefined) {
        this.taskItems.reqImages = 0;
      }
    },
    (error) => {
      if (error.status === 401) {
        // Handle unauthorized error
      }
    }
  );
}

  onImageLinkChange(hasImage: boolean) {
    this.hasImageLink = hasImage;
  }

  updateTask() {
  this.formSubmitted = true;

  if (!this.isFormValid()) {
    Swal.fire({
      icon: 'error',
      title: 'Validation Error',
      text: 'Please fill all required fields correctly',
    });
    return;
  }

  const token = this.tokenService.getToken();

  if (!token) {
    return;
  }

  // Create a copy of taskItems to avoid modifying the original
  const taskData = {
    ...this.taskItems,
    startingDate: this.formatDate(this.taskItems.startingDate),
    // Set imageLink to null if hasImageLink is false
    imageLink: this.hasImageLink ? this.taskItems.imageLink : null
  };

  this.taskService.updateUserCropTask(this.id, taskData).subscribe(
    (res: any) => {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Task updated successfully!',
      });
      this.formSubmitted = false;
    },
    (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Unsuccessful',
        text: 'Error updating task',
      });
      this.formSubmitted = false;
    }
  );
}

  private isFormValid(): boolean {
  // Check common required fields
  if (!this.taskItems.startingDate) {
    return false;
  }

  // Check language-specific fields based on selected language
  switch (this.selectedLanguage) {
    case 'english':
      if (
        !this.taskItems.taskEnglish ||
        !this.taskItems.taskTypeEnglish ||
        !this.taskItems.taskCategoryEnglish ||
        !this.taskItems.taskDescriptionEnglish
      ) {
        return false;
      }
      break;
    case 'sinhala':
      if (
        !this.taskItems.taskSinhala ||
        !this.taskItems.taskTypeSinhala ||
        !this.taskItems.taskCategorySinhala ||
        !this.taskItems.taskDescriptionSinhala
      ) {
        return false;
      }
      break;
    case 'tamil':
      if (
        !this.taskItems.taskTamil ||
        !this.taskItems.taskTypeTamil ||
        !this.taskItems.taskCategoryTamil ||
        !this.taskItems.taskDescriptionTamil
      ) {
        return false;
      }
      break;
  }

  // Only check image link if hasImageLink is true
  if (this.hasImageLink && !this.taskItems.imageLink) {
    return false;
  }

  return true;
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
    // Block space key only at the beginning of input
    if (
      (event.code === 'Space' || event.key === ' ') &&
      fieldValue.length === 0
    ) {
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
