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
    private cropCalendarService: CropCalendarService
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
      imageLink: [''],
      videoLinkEnglish: [''],
      videoLinkSinhala: [''],
      videoLinkTamil: [''],
    });
  }

  ngOnInit(): void {
    this.cropId = this.route.snapshot.params['cropId'];
    this.indexId = this.route.snapshot.params['indexId'];
    this.userId = this.route.snapshot.params['userId'];
    this.onCulscropID = this.route.snapshot.params['onCulscropID '];
    console.log('hiiiii', this.onCulscropID);
  }

  selectLanguage(lang: 'english' | 'sinhala' | 'tamil') {
    this.selectedLanguage = lang;
  }

  onSubmit() {
    console.log('onsubmit:', this.cropId, this.indexId, this.userId);

    if (this.userId == 'null') {
      this.cropCalendarService
        .createNewCropTask(this.cropId, this.indexId, this.cropTaskObj)
        .subscribe((res) => {
          if (res) {
            Swal.fire('Success', 'New Crop Calander Task Added !', 'success');

            history.back();
          } else {
            Swal.fire('Error', 'Error occor in adding task !', 'error');
          }
        });
    } else {
      this.cropCalendarService
        .createNewCropTaskU(
          this.cropId,
          this.indexId,
          this.userId,
          this.cropTaskObj,
          this.onCulscropID
        )
        .subscribe((res) => {
          if (res) {
            Swal.fire('Success', 'New Crop Calander Task Added !', 'success');

            this.back(this.cropId, this.userId);
          } else {
            Swal.fire('Error', 'Error occor in adding task !', 'error');
          }
        });
    }
  }

  back(cropCalendarId: string, userId: string) {
    this.router.navigate(
      ['plant-care/action/view-crop-task-by-user/user-task-list'],
      {
        queryParams: { cropCalendarId, userId },
      }
    );
  }

  onCancel(): void {
    console.log('Cancelled');
    this.selectedLanguage = 'english';
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
