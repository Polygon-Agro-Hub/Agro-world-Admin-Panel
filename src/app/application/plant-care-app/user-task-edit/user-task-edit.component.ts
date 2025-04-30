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
      },
      (error) => {
        if (error.status === 401) {
        }
      }
    );
  }

  updateTask() {
    const token = this.tokenService.getToken();

    if (!token) {
      return;
    }

    const formData = new FormData();
    formData.append('taskEnglish', this.taskItems.taskEnglish);
    formData.append('taskSinhala', this.taskItems.taskSinhala);
    formData.append('taskTamil', this.taskItems.taskTamil);
    formData.append('taskTypeEnglish', this.taskItems.taskTypeEnglish);
    formData.append('taskTypeSinhala', this.taskItems.taskTypeSinhala);
    formData.append('taskTypeTamil', this.taskItems.taskTypeTamil);
    formData.append('taskCategoryEnglish', this.taskItems.taskCategoryEnglish);
    formData.append('taskCategorySinhala', this.taskItems.taskCategorySinhala);
    formData.append('taskCategoryTamil', this.taskItems.taskCategoryTamil);
    formData.append('startingDate', this.taskItems.startingDate);
    formData.append('reqImages', this.taskItems.reqImages);
    formData.append('imageLink', this.taskItems.imageLink);
    formData.append('videoLink', this.taskItems.videoLinkEnglish);
    formData.append('videoLink', this.taskItems.videoLinkSinhala);
    formData.append('videoLink', this.taskItems.videoLinkTamil);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

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
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Unsuccessful',
          text: 'Error updating task',
        });
      }
    );
  }

  formatDate(date: any): string {
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
