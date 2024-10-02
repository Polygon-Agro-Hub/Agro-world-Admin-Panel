import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxColorsModule } from 'ngx-colors';
import { ActivatedRoute, Router } from '@angular/router';
import { CropCalendarService } from '../../../services/plant-care/crop-calendar.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-new-crop-calander-task',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    LoadingSpinnerComponent,
    MatFormFieldModule,
    NgxColorsModule
  ],
  templateUrl: './add-new-crop-calander-task.component.html',
  styleUrl: './add-new-crop-calander-task.component.css'
})
export class AddNewCropCalanderTaskComponent implements OnInit {
  isLoading = false;
  cropId!: string
  indexId!: string
  daysPrm!: string
  selectedLanguage: 'english' | 'sinhala' | 'tamil' = 'english';
  taskForm: FormGroup;
  cropTaskObj: Croptask = new Croptask();


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cropCalendarService: CropCalendarService,

  ) {
    this.taskForm = this.fb.group({
      cropId: [''],
      days: [''],
      taskTypeEnglish: [''],
      taskTypeSinhala: [''],
      taskTypeTamil: [''],
      taskCategoryEnglish: [''],
      taskCategorySinhala: [''],
      taskCategoryTamil: [''],
      taskEnglish: [''],
      taskSinhala: [''],
      taskTamil: [''],
      taskDescriptionEnglish: [''],
      taskDescriptionSinhala: [''],
      taskDescriptionTamil: ['']
    })


  }

  ngOnInit(): void {
    this.cropId = this.route.snapshot.params['cropId'];
    this.indexId = this.route.snapshot.params['indexId'];
    this.daysPrm = this.route.snapshot.params['days']
  }

  selectLanguage(lang: 'english' | 'sinhala' | 'tamil') {
    this.selectedLanguage = lang;
  }

  onSubmit() {
    console.log(this.cropId, this.indexId,)
    this.cropCalendarService.createNewCropTask(this.cropId, this.indexId, this.cropTaskObj).subscribe(
      (res) => {
        if (res) {
          Swal.fire(
            'Success',
            'New Crop Calander Task Added !',
            'success'
          );

          this.router.navigate([`plant-care/view-crop-task/${this.cropId}`])
        }
        else {
          Swal.fire(
            'Error',
            'Error occor in adding task !',
            'error'
          );
        }
      }
    )

  }

  onCancel(): void {
    console.log('Cancelled');
    this.selectedLanguage = 'english';

  }

}



class Croptask {
  "cropId": string
  "days": string
  "taskTypeEnglish": string
  "taskTypeSinhala": string
  "taskTypeTamil": string
  "taskCategoryEnglish": string
  "taskCategorySinhala": string
  "taskCategoryTamil": string
  "taskEnglish": string
  "taskSinhala": string
  "taskTamil": string
  "taskDescriptionEnglish": string
  "taskDescriptionSinhala": string
  "taskDescriptionTamil": string
}
