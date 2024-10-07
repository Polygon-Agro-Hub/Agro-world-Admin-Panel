import { ActivatedRoute, Router } from '@angular/router';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormControl,
  Validators,
} from '@angular/forms';
import {
  HttpClient,
  HttpClientModule,
  HttpErrorResponse,
} from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgxColorsModule } from 'ngx-colors';

interface NewCropCalender {
  id: number;
  cropName: string;
  sinhalaCropName: string;
  tamilCropName: string;
  variety: string;
  sinhalaVariety: string;
  tamilVariety: string;
  CultivationMethod: string;
  NatureOfCultivation: string;
  CropDuration: string;
  createdAt: string;
  SpecialNotes: string;
  sinhalaSpecialNotes: string;
  tamilSpecialNotes: string;
  cropColor: string;
  SuitableAreas: string;
  image: string;
}

import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import Swal from 'sweetalert2';

import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CropCalendarService } from '../../../services/plant-care/crop-calendar.service';

@Component({
  selector: 'app-create-crop-calender',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    LoadingSpinnerComponent,
    MatFormFieldModule,
    MatSelectModule,
    NgxColorsModule,
  ],
  templateUrl: './create-crop-calender.component.html',
  styleUrl: './create-crop-calender.component.css',
})
export class CreateCropCalenderComponent {
  toppingList: string[] = [
    'Ampara',
    'Anuradhapura',
    'Badulla',
    'Batticaloa',
    'Colombo',
    'Galle',
    'Gampaha',
    'Hambantota',
    'Jaffna',
    'Kalutara',
    'Kandy',
    'Kegalle',
    'Kilinochchi',
    'Kurunegala',
    'Mannar',
    'Matale',
    'Matara',
    'Monaragala',
    'Mullaitivu',
    'Nuwara Eliya',
    'Polonnaruwa',
    'Puttalam',
    'Ratnapura',
    'Trincomalee',
    'Vavuniya',
  ];

  cropForm: FormGroup;
  cropId: number | null = null;
  createNewObj: CreateCrop = new CreateCrop();
  cropCalender: NewCropCalender[] = [];
  isLoading = false;
  selectedFile: File | null = null;
  selectedFileName: string | null = null;
  selectedImage: string | ArrayBuffer | null = null;
  selectedLanguage: 'english' | 'sinhala' | 'tamil' = 'english';
  

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cropCalendarService: CropCalendarService
  ) {
    // Initialize the form with FormBuilder
    this.cropForm = this.fb.group({
      cropName: ['',[Validators.required]],
      sinhalaCropName: ['',[Validators.required]],
      tamilCropName: ['',[Validators.required]],
      variety: ['',[Validators.required]],
      sinhalaVariety: ['',[Validators.required]],
      tamilVariety: ['',[Validators.required]],
      cultivationMethod: ['',[Validators.required]],
      natureOfCultivation: ['',[Validators.required]],
      cropDuration: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      cropCategory: ['',[Validators.required]],
      specialNotes: ['',[Validators.required]],
      sinhalaSpecialNotes: ['',[Validators.required]],
      tamilSpecialNotes: ['',[Validators.required]],
      suitableAreas: ['',[Validators.required]],
      cropColor: ['',[Validators.required]],
      image: ['',[Validators.required]],
    });
  }

  onSubmit() {

    const formValue = this.cropForm.value;

    if (formValue.suitableAreas && Array.isArray(formValue.suitableAreas)) {
      formValue.suitableAreas = formValue.suitableAreas.join(', ');
    }

    const formData = new FormData();
    Object.keys(formValue).forEach((key) => {
      formData.append(key, formValue[key]);
    });

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.isLoading = true;
  
      this.cropCalendarService.createCropCalendar(formData).subscribe(
        (res: any) => {
          this.isLoading = false;
          this.cropId = res.cropId;
          if (this.cropId !== null) {
            this.openXlsxUploadDialog(this.cropId);
          } else {
            console.error('Crop ID is null after creation');
            this.isLoading = false;
            Swal.fire(
              'Error',
              'Unable to process XLSX upload due to missing Crop ID',
              'error'
            );
          }
        },
        (error: any) => {
          console.error('Error creating crop calendar', error);
          Swal.fire(
            'Error',
            'There was an error creating the crop calendar',
            'error'
          );
          this.isLoading = false;
        }
      );

    


  }

  openXlsxUploadDialog(cropId: number) {
    Swal.fire({
      title: 'Upload XLSX File',
      html: `
        <div class="upload-container">
        <input type="file" id="xlsx-file-input" accept=".xlsx, .xls" style="display: none;">
        <label for="xlsx-file-input" class="upload-box">
          <div class="upload-box-content" style="cursor: pointer;">
            <svg xmlns="http://www.w3.org/2000/svg" class="upload-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v8m0 0l-4-4m4 4l4-4M4 20h16" />
            </svg>
          </div>
            <p class="upload-text">Drag & drop your XLSX file here or click to select</p>
            <p id="selected-file-name" class="file-name">No file selected</p>
        </label>
      </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Upload',
      cancelButtonText: 'Skip',
      allowOutsideClick: false,
      didOpen: () => {
        const fileInput = document.getElementById(
          'xlsx-file-input'
        ) as HTMLInputElement;
        const fileNameDisplay = document.getElementById('selected-file-name');
        fileInput.onchange = () => {
          if (fileInput.files && fileInput.files[0]) {
            fileNameDisplay!.textContent = `Selected file: ${fileInput.files[0].name}`;
          }
        };
      },
      preConfirm: () => {
        const fileInput = document.getElementById(
          'xlsx-file-input'
        ) as HTMLInputElement;
        if (fileInput.files && fileInput.files[0]) {
          return fileInput.files[0];
        }
        return null;
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.uploadXlsxFile(cropId, result.value);
      } else {
        this.deleteCropCalender(this.cropId)
        console.log('XLSX upload skipped');
        // You can add any additional logic here for when the user skips the upload
      }
    });
  }

  uploadXlsxFile(cropId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file); // Changed 'xlsxFile' to 'file' to match backend expectation

    this.cropCalendarService.uploadXlsxFile(cropId, file).subscribe(
      (res: any) => {
        // console.log('XLSX file uploaded successfully', res);
        Swal.fire(
          'Success',
          'XLSX file uploaded and data inserted successfully',
          'success'
        );
        //navigate table
        this.router.navigate(["/plant-care/view-crop-calender"])
      },
      (error: HttpErrorResponse) => {
        console.error('Error uploading XLSX file', error);
        let errorMessage = 'There was an error uploading the XLSX file';

        this.cropCalendarService.deleteCropCalender(this.cropId)
          .subscribe(
            (data: any) => {
              if(data){
               
              }
             
            },
            (error) => {
              console.error('Error deleting crop calendar:', error);
            }
          );


        if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        }
        Swal.fire('Error', errorMessage, 'error');
      }
    );
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.cropId = params['id'] ? +params['id'] : null;
      console.log('Received crop ID:', this.cropId);
    });
    if (this.cropId!=null) {
      this.getCropCalenderById(this.cropId);
    }
  }

  getCropCalenderById(id: any) {
    this.isLoading = true;
    this.cropCalendarService.getCropCalendarById(id).subscribe(
      (data) => {
        this.cropCalender = data;
        this.isLoading = false;



        if (this.cropCalender[0]?.SuitableAreas) {
          const selectedAreas = this.cropCalender[0].SuitableAreas.split(', ').map(area => area.trim());
          // Set the parsed array as the default value for the suitableAreas form control
          this.cropForm.patchValue({
            suitableAreas: selectedAreas,
          });
        }
      },
      (error) => {
        console.error('Error fetching crop calendar', error);
        if (error.status === 401) {
          // Handle unauthorized error
          this.isLoading = false;
          alert('Unauthorized access. Please log in again.');
        }
      }
    );
  }

  updateCropCalender(): void {

    const formValue = this.cropForm.value;

    if (formValue.suitableAreas && Array.isArray(formValue.suitableAreas)) {
      formValue.suitableAreas = formValue.suitableAreas.join(', ');
    }
    const formData = new FormData();
    formData.append('cropName', this.cropCalender[0].cropName);
    formData.append('sinhalaCropName', this.cropCalender[0].sinhalaCropName);
    formData.append('tamilCropName', this.cropCalender[0].tamilCropName);
    formData.append('variety', this.cropCalender[0].variety);
    formData.append('sinhalaVariety', this.cropCalender[0].sinhalaVariety);
    formData.append('tamilVariety', this.cropCalender[0].tamilVariety);
    formData.append('CultivationMethod', this.cropCalender[0].CultivationMethod);
    formData.append('NatureOfCultivation', this.cropCalender[0].NatureOfCultivation);
    formData.append('CropDuration', this.cropCalender[0].CropDuration);
    formData.append('SpecialNotes', this.cropCalender[0].SpecialNotes);
    formData.append('sinhalaSpecialNotes', this.cropCalender[0].sinhalaSpecialNotes);
    formData.append('tamilSpecialNotes', this.cropCalender[0].tamilSpecialNotes);
    formData.append('SuitableAreas', formValue.suitableAreas);
    formData.append('cropColor', this.cropCalender[0].cropColor);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }
    this.isLoading = true;
    this.cropCalendarService.updateCropCalendar(this.cropId!, formData).subscribe(
      (res: any) => {
        this.isLoading = false;
        // console.log('Crop Calendar updated successfully', res);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Crop Calendar updated successfully!',
        });
        this.router.navigate(['/plant-care/view-crop-calender']);
      },
      (error: any) => {
        this.isLoading = false;
        console.error('Error updating Crop Calendar', error);
        Swal.fire({
          icon: 'error',
          title: 'Unsuccess',
          text: 'Error updating Crop Calendar',
        });
      }
    );
  }


  onCancel(): void {
    // Handle cancel action (e.g., clear the form, navigate back, etc.)
    this.selectedLanguage = 'english';

  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.cropForm.get('image')?.updateValueAndValidity(); // Update form validity

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage = e.target?.result as string | ArrayBuffer;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFileInput(event: Event): void {
    event.preventDefault();
    const fileInput = document.getElementById('imageUpload') as HTMLElement;
    fileInput.click();
  }

  selectLanguage(lang: 'english' | 'sinhala' | 'tamil') {
    this.selectedLanguage = lang;
  }


  deleteCropCalender(id: any) {
  
       
        this.cropCalendarService.deleteCropCalender(id)
          .subscribe(
            (data: any) => {
              if(data){
                Swal.fire(
                  'Deleted!',
                  'Your uncomplete crop calender has been deleted',
                  'success'
                  
                );
                
              }
             
            },
            (error) => {
              console.error('Error deleting crop calendar:', error);
              Swal.fire(
                'Error!',
                'There was an error deleting the uncomplete crop calendar.',
                'error'
              );
            }
          );
    
  }
}

export class CreateCrop {
  cropName: string = '';
  sinhalaCropName: string = '';
  tamilCropName: string = '';
  variety: string = '';
  sinhalaVariety: string = '';
  tamilVariety: string = '';
  CultivationMethod: string = '';
  NatureOfCultivation: string = '';
  CropDuration: string = '';
  SpecialNotes: string = '';
  sinhalaSpecialNotes: string = '';
  tamilSpecialNotes: string = '';
  SuitableAreas: string = '';
}
