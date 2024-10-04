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
  userId!: string
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
      cropId: ['',[Validators.required]],
      days: ['',[Validators.required]],
      taskTypeEnglish: ['',[Validators.required]],
      taskTypeSinhala: ['',[Validators.required]],
      taskTypeTamil: ['',[Validators.required]],
      taskCategoryEnglish: ['',[Validators.required]],
      taskCategorySinhala: ['',[Validators.required]],
      taskCategoryTamil: ['',[Validators.required]],
      taskEnglish: ['',[Validators.required]],
      taskSinhala: ['',[Validators.required]],
      taskTamil: ['',[Validators.required]],
      taskDescriptionEnglish: ['',[Validators.required]],
      taskDescriptionSinhala: ['',[Validators.required]],
      taskDescriptionTamil: ['',[Validators.required]]
    })


  }

  ngOnInit(): void {
    this.cropId = this.route.snapshot.params['cropId'];
    this.indexId = this.route.snapshot.params['indexId'];
    this.userId = this.route.snapshot.params['userId'];
    this.daysPrm = this.route.snapshot.params['days']
  }

  selectLanguage(lang: 'english' | 'sinhala' | 'tamil') {
    this.selectedLanguage = lang;
  }

  onSubmit() {
    console.log(this.cropId, this.indexId,)

    if(this.userId==null){
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
  }else{this.cropCalendarService.createNewCropTaskU(this.cropId, this.indexId, this.userId,  this.cropTaskObj).subscribe(
    (res) => {
      if (res) {
        Swal.fire(
          'Success',
          'New Crop Calander Task Added !',
          'success'
        );

        this.back(this.cropId, this.userId)
      }
      else {
        Swal.fire(
          'Error',
          'Error occor in adding task !',
          'error'
        );
      }
    }
  )}
  
    

  }

  back(cropCalendarId: string, userId: string) {

    this.router.navigate(['plant-care/view-crop-task-by-user/user-task-list'], { 
      queryParams: { cropCalendarId, userId} 
    });
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
