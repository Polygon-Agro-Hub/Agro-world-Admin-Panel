import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CropCalendarService } from '../../../services/plant-care/crop-calendar.service';
import { TokenService } from '../../../services/token/services/token.service';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';
import { Output, EventEmitter } from '@angular/core';
// Model for crop task
class CropTask {
  id: number = 0;
  taskIndex: string = '';
  days: string = '';
  startingDate: string = '';
  hasVideoLink: string = '';
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
  templateUrl: './view-crop-tasks.component.html',
  styleUrls: ['./view-crop-tasks.component.css'],
})
export class ViewCropTasksComponent implements OnInit {
  @Input() cropId!: number;  // Receive cropId as input
  @Output() close = new EventEmitter<void>();
  taskForm: FormGroup;
  cropTask: CropTask = new CropTask();   // data from API
  selectedLanguage: 'english' | 'sinhala' | 'tamil' = 'english';
  itemId!: string;
  formSubmitted: boolean = false;
  ispopup: boolean = true; // or false initially
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private taskService: CropCalendarService,
    private tokenService: TokenService,
    private location: Location
  ) {
    // Build form
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
      reqImages: ['0', [Validators.pattern(/^(0|[1-9][0-9]*)$/)]],
      hasImageLink: [false],
      imageLink: [''],
      hasVideoLink: [false],
      videoLinkEnglish: [''],
      videoLinkSinhala: [''],
      videoLinkTamil: [''],
    });
  }
 
  ngOnInit() {
    this.itemId = this.route.snapshot.params['id'];

    // 🔹 Use the SAME API as View component
    this.taskService.getCropTaskBycropId(this.cropId).subscribe(
      (data: CropTask) => {
        this.cropTask = data;

        // patch values into the form
        this.taskForm.patchValue({
          taskEnglish: data.taskEnglish,
          taskTypeEnglish: data.taskTypeEnglish,
          taskCategoryEnglish: data.taskCategoryEnglish,
          taskDescriptionEnglish: data.taskDescriptionEnglish,
          taskSinhala: data.taskSinhala,
          taskTypeSinhala: data.taskTypeSinhala,
          taskCategorySinhala: data.taskCategorySinhala,
          taskDescriptionSinhala: data.taskDescriptionSinhala,
          taskTamil: data.taskTamil,
          taskTypeTamil: data.taskTypeTamil,
          taskCategoryTamil: data.taskCategoryTamil,
          taskDescriptionTamil: data.taskDescriptionTamil,
          reqImages: data.reqImages || '0',
          hasImageLink: !!data.imageLink,
          imageLink: data.imageLink,
          hasVideoLink: !!(data.videoLinkEnglish || data.videoLinkSinhala || data.videoLinkTamil),
          videoLinkEnglish: data.videoLinkEnglish,
          videoLinkSinhala: data.videoLinkSinhala,
          videoLinkTamil: data.videoLinkTamil,
        });
      },
      (error) => {
        console.error('Error fetching task:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch task details.',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          },
        });
      }
    );

    // Subscribe to checkbox changes
    this.taskForm.get('hasImageLink')?.valueChanges.subscribe((hasImageLink) => {
      const imageLinkControl = this.taskForm.get('imageLink');
      if (hasImageLink) {
        imageLinkControl?.setValidators([Validators.required]);
      } else {
        imageLinkControl?.clearValidators();
        imageLinkControl?.setValue('');
      }
      imageLinkControl?.updateValueAndValidity();
    });

    this.taskForm.get('hasVideoLink')?.valueChanges.subscribe((hasVideoLink) => {
      const videoFields = ['videoLinkEnglish', 'videoLinkSinhala', 'videoLinkTamil'];
      videoFields.forEach((field) => {
        const control = this.taskForm.get(field);
        if (hasVideoLink) {
          control?.setValidators([Validators.required]);
        } else {
          control?.clearValidators();
          control?.setValue('');
        }
        control?.updateValueAndValidity();
      });
    });
  }
closePopup() {
  this.close.emit();
}
  // Change language tab
  selectLanguage(lang: 'english' | 'sinhala' | 'tamil') {
    this.selectedLanguage = lang;
  }

  // Cancel navigation
  back(): void {
    this.location.back();
  }

  // Format date
  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }
  openLink(url: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }
  // Update Task (PUT)
  updateTask() {
    this.formSubmitted = true;
    if (this.taskForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid',
        text: 'Please fill all required fields correctly.',
      });
      return;
    }

    const token = this.tokenService.getToken();
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Authentication token not found',
      });
      return;
    }

    // merge taskForm values into cropTask
    const updatedTask: CropTask = {
      ...this.cropTask,
      ...this.taskForm.value,
      imageLink: this.taskForm.get('hasImageLink')?.value ? this.taskForm.get('imageLink')?.value : null,
      videoLinkEnglish: this.taskForm.get('hasVideoLink')?.value ? this.taskForm.get('videoLinkEnglish')?.value : null,
      videoLinkSinhala: this.taskForm.get('hasVideoLink')?.value ? this.taskForm.get('videoLinkSinhala')?.value : null,
      videoLinkTamil: this.taskForm.get('hasVideoLink')?.value ? this.taskForm.get('videoLinkTamil')?.value : null,
    };

    this.taskService.updateCropTask(this.itemId, updatedTask).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Updated',
          text: 'Task updated successfully!',
        }).then(() => this.location.back());
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error?.error?.message || 'Failed to update task.',
        });
      },
    });
  }
}
