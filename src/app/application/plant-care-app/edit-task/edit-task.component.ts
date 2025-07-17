import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CropCalendarService } from '../../../services/plant-care/crop-calendar.service';
import { error, log } from 'node:console';
import { environment } from '../../../environment/environment';
import Swal from 'sweetalert2';
import { TokenService } from '../../../services/token/services/token.service';
import { Location } from '@angular/common';

class CropTask {
  'id': number;
  'taskIndex': string;
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
@Component({
  selector: 'app-edit-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './edit-task.component.html',
  styleUrl: './edit-task.component.css',
})
export class EditTaskComponent implements OnInit {
  cropTask: CropTask = new CropTask();

  cropId!: string;
  selectedLanguage: 'english' | 'sinhala' | 'tamil' = 'english';
  createTaskObj: CreateTask = new CreateTask();
  validatedObj: CreateTask = new CreateTask();
  itemId!: string;
  taskItems: CropTask = new CropTask();
  updatetsk: CropTask = new CropTask();

  hasImageLink: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private taskService: CropCalendarService,
    private tokenService: TokenService,
    private location: Location
  ) {}

  selectLanguage(lang: 'english' | 'sinhala' | 'tamil') {
    this.selectedLanguage = lang;
  }

  isEnglishOnly(input: string): string {
    const englishRegex =
      /^[\u0041-\u005A\u0061-\u007A\u0030-\u0039\s\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\,\<\>\.\?\/\\\|]+$/;
    return input;
  }

  isSinhalaAndNumberOnly(input: string): string {
    const sinhalaAndNumberRegex =
      /^[\u0D80-\u0DFF0-9\s\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\,\<\>\.\?\/\\\|]+$/;
    return input;
  }

  isTamilAndNumberOnly(input: string): string {
    const tamilRegex =
      /^[\u0B80-\u0BFF0-9\s\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\,\<\>\.\?\/\\\|]+$/;
    return input;
  }

  ngOnInit() {
    this.itemId = this.route.snapshot.params['id'];
    console.log('Item ID: ', this.itemId);

    this.getTaskById(this.itemId);
    console.log(this.getTaskById);
  }

  getTaskById(id: any) {
    this.taskService.getCropTaskBycropId(id).subscribe(
      (data) => {
        console.log('jjjj', data);

        this.taskItems = data;
        console.log('Task Items:', this.taskItems);

        this.hasImageLink = !!this.taskItems.imageLink;
      },
      (error) => {
        console.error('Error fetching task:', error);
        if (error.status === 401) {
        }
      }
    );
  }

  updateTask() {
    // Check if image link is required but not provided
    if (this.hasImageLink && !this.taskItems.imageLink) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Image Link is required when "Has Image Link" is set to Yes',
      });
      return;
    }

    const token = this.tokenService.getToken();

    if (!token) {
      console.error('No token found');
      return;
    }

    const formData = new FormData();

    // Directly append all form fields without conditionals
    formData.append('taskEnglish', this.taskItems.taskEnglish);
    formData.append('taskSinhala', this.taskItems.taskSinhala);
    formData.append('taskTamil', this.taskItems.taskTamil);
    formData.append('taskTypeEnglish', this.taskItems.taskTypeEnglish);
    formData.append('taskTypeSinhala', this.taskItems.taskTypeSinhala);
    formData.append('taskTypeTamil', this.taskItems.taskTypeTamil);
    formData.append('taskCategoryEnglish', this.taskItems.taskCategoryEnglish);
    formData.append('taskCategorySinhala', this.taskItems.taskCategorySinhala);
    formData.append('taskCategoryTamil', this.taskItems.taskCategoryTamil);
    formData.append(
      'taskDescriptionEnglish',
      this.taskItems.taskDescriptionEnglish
    );
    formData.append(
      'taskDescriptionSinhala',
      this.taskItems.taskDescriptionSinhala
    );
    formData.append(
      'taskDescriptionTamil',
      this.taskItems.taskDescriptionTamil
    );
    formData.append('reqImages', this.taskItems.reqImages);
    formData.append('imageLink', this.taskItems.imageLink || '');
    formData.append('videoLink', this.taskItems.videoLinkEnglish);
    formData.append('videoLink', this.taskItems.videoLinkSinhala);
    formData.append('videoLink', this.taskItems.videoLinkTamil);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    console.log('FormData:', formData);

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
      this.taskItems.imageLink = ''; // Clear the image link if "No" is selected
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
