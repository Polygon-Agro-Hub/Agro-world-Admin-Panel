

import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CropCalendarService } from '../../../services/plant-care/crop-calendar.service';
import { environment } from '../../../environment/environment';
import Swal from 'sweetalert2';
import { TokenService } from '../../../services/token/services/token.service';
import { Location } from '@angular/common';

class CropTask {
  id: number = 0;
  taskIndex: string = '';
  days: string = '';
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
  cropId!: string;
  selectedLanguage: 'english' | 'sinhala' | 'tamil' = 'english';
  itemId!: string;
  taskItems: CropTask = new CropTask();
  hasImageLink: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private taskService: CropCalendarService,
    private tokenService: TokenService,
    private location: Location
  ) {
    // Initialize the form with validators
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
      reqImages: ['', [Validators.pattern(/^[1-9][0-9]*$/)]],
      imageLink: [''],
      videoLinkEnglish: [''],
      videoLinkSinhala: [''],
      videoLinkTamil: [''],
    });
  }

  ngOnInit() {
    this.itemId = this.route.snapshot.params['id'];
    console.log('Item ID: ', this.itemId);
    this.getTaskById(this.itemId);
  }

  selectLanguage(lang: 'english' | 'sinhala' | 'tamil') {
    this.selectedLanguage = lang;
  }

  allowOnlyEnglishLetters(event: KeyboardEvent): void {
    const allowedControlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (allowedControlKeys.includes(event.key)) return;
    const isLetter = /^[a-zA-Z\s]$/.test(event.key);
    if (!isLetter) {
      event.preventDefault();
    }
  }

  allowOnlySinhalaLetters(event: KeyboardEvent): void {
    const allowedControlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (allowedControlKeys.includes(event.key)) return;
    const isSinhala = /^[\u0D80-\u0DFF]$/.test(event.key);
    if (!isSinhala) {
      event.preventDefault();
    }
  }

  allowOnlyTamilLetters(event: KeyboardEvent): void {
    const allowedControlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (allowedControlKeys.includes(event.key)) return;
    const isTamil = /^[\u0B80-\u0BFF]$/.test(event.key);
    if (!isTamil) {
      event.preventDefault();
    }
  }

  capitalizeFirstLetter(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value.length > 0) {
      input.value = value.charAt(0).toUpperCase() + value.slice(1);
    }
  }

  validateImagesInput(event: KeyboardEvent) {
    const inputChar = event.key;
    const currentValue = (event.target as HTMLInputElement).value;
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (allowedKeys.includes(inputChar)) return;
    if (!/^[0-9]$/.test(inputChar)) {
      event.preventDefault();
      return;
    }
    if (inputChar === '0' && currentValue.length === 0) {
      event.preventDefault();
    }
  }

  onImagesInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (!/^[1-9][0-9]*$/.test(value)) {
      input.value = '';
      this.taskForm.get('reqImages')?.setValue('');
    }
  }

  getTaskById(id: string) {
    this.taskService.getCropTaskBycropId(id).subscribe(
      (data) => {
        console.log('Task Data:', data);
        this.taskItems = data;
        this.hasImageLink = !!this.taskItems.imageLink;
        // Patch form values
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
          reqImages: this.taskItems.reqImages,
          imageLink: this.taskItems.imageLink,
          videoLinkEnglish: this.taskItems.videoLinkEnglish,
          videoLinkSinhala: this.taskItems.videoLinkSinhala,
          videoLinkTamil: this.taskItems.videoLinkTamil,
        });
      },
      (error) => {
        console.error('Error fetching task:', error);
        if (error.status === 401) {
          // Handle unauthorized error
        }
      }
    );
  }

  updateTask() {
    // Mark all fields as touched to trigger validation
    this.taskForm.markAllAsTouched();

    // Custom validation for imageLink when hasImageLink is true
    if (this.hasImageLink && !this.taskForm.get('imageLink')?.value) {
      this.taskForm.get('imageLink')?.setErrors({ required: true });
    } else if (!this.hasImageLink) {
      this.taskForm.get('imageLink')?.setErrors(null);
      this.taskForm.get('imageLink')?.setValue('');
    }

    if (this.taskForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill all required fields correctly.',
      });
      return;
    }

    const token = this.tokenService.getToken();
    if (!token) {
      console.error('No token found');
      Swal.fire({
        icon: 'error',
        title: 'Authentication Error',
        text: 'No token found. Please log in again.',
      });
      return;
    }

    // Update taskItems with form values
    this.taskItems = { ...this.taskItems, ...this.taskForm.value };

    this.taskService.updateCropTask(this.itemId, this.taskItems).subscribe(
      (res: any) => {
        console.log('Task updated successfully', res);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Task updated successfully!',
        }).then(() => {
          this.location.back();
        });
      },
      (error) => {
        console.error('Error updating task', error);
        Swal.fire({
          icon: 'error',
          title: 'Unsuccessful',
          text: 'Error updating task',
        });
      }
    );
  }

  onImageLinkChange() {
    if (!this.hasImageLink) {
      this.taskForm.get('imageLink')?.setValue('');
      this.taskForm.get('imageLink')?.setErrors(null);
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