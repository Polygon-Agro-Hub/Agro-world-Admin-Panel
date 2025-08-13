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
  startingDate!: string;
  selectedLanguage: 'english' | 'sinhala' | 'tamil' = 'english';
  taskForm: FormGroup;
  cropTaskObj: Croptask = new Croptask();
  requireImageLink: string = 'no';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cropCalendarService: CropCalendarService,
    private location: Location
  ) {
    this.taskForm = this.fb.group({
      cropId: ['', [Validators.required]],
      startingDate: ['', [Validators.required]],
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
      reqImages: ['', [Validators.required]],
      imageLink: ['',],
      videoLinkEnglish: [''],
  videoLinkSinhala: [''],
  videoLinkTamil: [''],
      images: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.cultivationId = params['cultivationId']
        ? +params['cultivationId']
        : null;
      this.userName = params['userName'] ? params['userName'] : '';
    console.log('cultivationId', this.cultivationId);
    });
    this.cropId = this.route.snapshot.params['cropId'];
    this.indexId = this.route.snapshot.params['indexId'];
    this.userId = this.route.snapshot.params['userId'];
    this.onCulscropID = this.route.snapshot.params['onCulscropID '];
    console.log('hiiiii', this.onCulscropID);
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
    console.log('onsubmit:', this.cropId, this.indexId, this.userId);

    if (
      !this.cropTaskObj.startingDate ||
      !this.cropTaskObj.taskTypeEnglish ||
      !this.cropTaskObj.taskTypeSinhala ||
      !this.cropTaskObj.taskTypeTamil ||
      !this.cropTaskObj.taskCategoryEnglish ||
      !this.cropTaskObj.taskCategorySinhala ||
      !this.cropTaskObj.taskCategoryTamil ||
      !this.cropTaskObj.taskEnglish ||
      !this.cropTaskObj.taskSinhala ||
      !this.cropTaskObj.taskTamil ||
      !this.cropTaskObj.taskDescriptionEnglish ||
      !this.cropTaskObj.taskDescriptionSinhala ||
      !this.cropTaskObj.taskDescriptionTamil ||
      !this.cropTaskObj.reqImages ||
      (this.requireImageLink === 'yes' && !this.cropTaskObj.imageLink)
    ) {
      this.taskForm.markAllAsTouched();
      console.log('failed');
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill in all required fields before submitting.',
      });
      return;
    }

    if (this.userId == 'null') {
      this.isLoading = true;
      console.log('no user', this.userId);
      this.cropCalendarService
        .createNewCropTask(this.cropId, this.indexId, this.cropTaskObj)
        .subscribe((res) => {
          this.isLoading = false;
          if (res) {
            Swal.fire('Success', 'New Crop Calendar Task Added!', 'success');
            // Navigate to the previous page
            this.location.back();
          } else {
            Swal.fire('Error', 'Error occurred in adding task!', 'error');
          }
        });
    } else {
      this.isLoading = true;
      console.log('has user', this.userId);
      this.cropCalendarService
        .createNewCropTaskU(
          this.cropId,
          this.indexId,
          this.userId,
          this.cropTaskObj,
          this.onCulscropID
        )
        .subscribe((res) => {
          this.isLoading = false;
          if (res) {
            Swal.fire('Success', 'New Crop Calendar Task Added!', 'success');
            // Navigate to the previous page
            this.location.back();
          } else {
            Swal.fire('Error', 'Error occurred in adding task!', 'error');
          }
        });
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


  onlyAllowIntegers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
}
  
class Croptask {
  'cropId': string;
  'startingDate': string;
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
