import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NewsService } from '../../../services/plant-care/news.service';
import { OngoingCultivationService } from '../../../services/plant-care/ongoing-cultivation.service';
import { CropCalendarService } from '../../../services/plant-care/crop-calendar.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { TokenService } from '../../../services/token/services/token.service';

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
    private tokenService: TokenService
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

  getTaskById(id: any) {
    this.taskService.getUserCropTaskBycropId(id).subscribe(
      (data) => {
        this.taskItems = data;
        this.taskItems.startingDate = this.formatDate(
          this.taskItems.startingDate
        );
        this.hasImageLink = !!this.taskItems.imageLink;
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
    if (!hasImage) {
      this.taskItems.imageLink = null;
    }
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

    const taskData = {
      ...this.taskItems,
      startingDate: this.formatDate(this.taskItems.startingDate),
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
    if (!this.taskItems.startingDate || !this.taskItems.reqImages) {
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

    // Check image link if hasImageLink is true
    if (this.hasImageLink && !this.taskItems.imageLink) {
      return false;
    }

    return true;
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
