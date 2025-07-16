import { ActivatedRoute, Router } from '@angular/router';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import {
  HttpClient,
  HttpClientModule,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgxColorsModule } from 'ngx-colors';

interface NewCropCalender {
  id: number;
  method: any;
  natOfCul: any;
  cropDuration: string;
  createdAt: string;
  suitableAreas: string;
}

import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import Swal from 'sweetalert2';

import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CropCalendarService } from '../../../services/plant-care/crop-calendar.service';
import { environment } from '../../../environment/environment';
import { TokenService } from '../../../services/token/services/token.service';

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
    'Rathnapura',
    'Trincomalee',
    'Vavuniya',
  ];

  cropForm: FormGroup;
  cropId: number | null = null;
  cropIdNew: number | null = null;
  createNewObj: CreateCrop = new CreateCrop();
  cropCalender: NewCropCalender[] = [];
  isLoading = false;
  selectedFile: File | null = null;
  selectedFileName: string | null = null;
  selectedImage: string | ArrayBuffer | null = null;
  selectedLanguage: 'english' | 'sinhala' | 'tamil' = 'english';
  selectedPage: 'pageOne' | 'pageTwo' = 'pageOne';
  groupList: any[] = [];
  varietyList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cropCalendarService: CropCalendarService,
    private http: HttpClient,
    private tokenService: TokenService
  ) {
    this.cropForm = this.fb.group({
      varietyId: ['', [Validators.required]],
      groupId: ['', [Validators.required]],
      cultivationMethod: ['', [Validators.required]],
      natureOfCultivation: ['', [Validators.required]],
      cropDuration: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]+$'),
          Validators.min(1),
        ],
      ],
      suitableAreas: ['', [Validators.required]],
    });
  }

  onSubmit() {
    const formValue = this.cropForm.value;
    if (
      !formValue.varietyId ||
      !formValue.cultivationMethod ||
      !formValue.natureOfCultivation ||
      !formValue.suitableAreas ||
      !formValue.cropDuration
    ) {
      Swal.fire('warning', 'Please fill all input feilds', 'warning');
      return;
    }

    if (formValue.cropDuration === 0) {
      Swal.fire('warning', 'Crop duration in days can not 0', 'warning');
      return;
    }

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
        if (res.status) {
          this.isLoading = false;
          this.cropIdNew = res.cropId;
          if (this.cropIdNew !== null) {
            this.openXlsxUploadDialog(this.cropIdNew);
          } else {
            this.isLoading = false;
            Swal.fire(
              'Error',
              'Unable to process XLSX upload due to missing Crop ID',
              'error'
            );
          }
        } else {
          this.isLoading = false;
          Swal.fire('Error', res.message, 'error');
        }
      },
      (error: any) => {
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
            <p class="upload-text">Select a XLSX file to upload</p>
            <p id="selected-file-name" class="file-name">No file selected</p>
          </label>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Upload',
      cancelButtonText: 'Cancel',
      allowOutsideClick: false,
      didOpen: () => {
        const fileInput = document.getElementById(
          'xlsx-file-input'
        ) as HTMLInputElement;
        const fileNameDisplay = document.getElementById('selected-file-name');

        Swal.getConfirmButton()?.setAttribute('disabled', 'true');

        fileInput.onchange = () => {
          if (fileInput.files && fileInput.files[0]) {
            fileNameDisplay!.textContent = `Selected file: ${fileInput.files[0].name}`;
            Swal.getConfirmButton()?.removeAttribute('disabled');
          } else {
            Swal.getConfirmButton()?.setAttribute('disabled', 'true');
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
        this.deleteCropCalender(cropId);
      }
    });
  }

  uploadXlsxFile(cropId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    this.cropCalendarService.uploadXlsxFile(cropId, file).subscribe(
      (res: any) => {
        Swal.fire(
          'Success',
          'XLSX file uploaded and data inserted successfully',
          'success'
        );
        this.router.navigate(['/plant-care/action/view-crop-calender']);
      },
      (error: HttpErrorResponse) => {
        console.error('Error uploading XLSX file', error);
        let errorMessage = 'Please check XLSX file again.';
        Swal.fire('Error!', 'Please check XLSX file again.', 'error');

        this.deleteCropCalender(cropId);

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
    });
    if (this.cropId != null) {
      this.getCropCalenderById(this.cropId);
    }
    this.getAllRoles();
  }

  getCropCalenderById(id: any) {
    this.isLoading = true;
    this.cropCalendarService.getCropCalendarById(id).subscribe(
      (data) => {
        this.cropCalender = data;
        this.isLoading = false;

        if (this.cropCalender[0]?.suitableAreas) {
          const selectedAreas = this.cropCalender[0].suitableAreas
            .split(', ')
            .map((area) => area.trim());
          this.cropForm.patchValue({
            suitableAreas: selectedAreas,
          });
        }
      },
      (error) => {
        if (error.status === 401) {
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
    formData.append('method', this.cropCalender[0].method);
    formData.append('natOfCul', this.cropCalender[0].natOfCul);
    formData.append('cropDuration', this.cropCalender[0].cropDuration);
    formData.append('suitableAreas', formValue.suitableAreas);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }
    this.isLoading = true;
    this.cropCalendarService
      .updateCropCalendar(this.cropId!, formData)
      .subscribe(
        (res: any) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Crop Calendar updated successfully!',
          });
          this.router.navigate(['/plant-care/action/view-crop-calender']);
        },
        (error: any) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Unsuccess',
            text: 'Error updating Crop Calendar',
          });
        }
      );
  }

  onCancel() {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after canceling!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'No, Keep Editing',
    }).then((result) => {
      if (result.isConfirmed) {
        this.selectedFile = null;
        this.selectedImage = null;
        this.router.navigate(['/plant-care/action']);
      }
    });
  }

  onCancelEdit() {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after canceling!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'No, Keep Editing',
    }).then((result) => {
      if (result.isConfirmed) {
        this.selectedFile = null;
        this.selectedImage = null;
        this.router.navigate(['/plant-care/action/view-crop-calender']);
      }
    });
  }

  deleteCropCalender(id: any) {
    this.isLoading = true;
    this.cropCalendarService.deleteCropCalender(id).subscribe(
      (data: any) => {
        if (data) {
          // Swal.fire(
          //   "Deleted!",
          //   "Your uncomplete crop calender has been deleted",
          //   "success",
          // );
          this.isLoading = false;
        }
      },
      (error) => {
        Swal.fire(
          'Error!',
          'There was an error deleting the uncomplete crop calendar.',
          'error'
        );
        this.isLoading = false;
      }
    );
  }

  getAllRoles() {
    const token = this.tokenService.getToken();

    if (!token) {
      return;
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get<any>(`${environment.API_URL}crop-calendar/crop-groups`, {
        headers,
      })
      .subscribe(
        (response) => {
          this.groupList = response.groups;
        },
        (error) => {}
      );
  }

  getAllVarities(event: Event) {
    const token = this.tokenService.getToken();

    if (!token) {
      return;
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const selectElement = event.target as HTMLSelectElement;
    const cropGroupId = selectElement.value;

    this.http
      .get<any>(
        `${environment.API_URL}crop-calendar/crop-variety/${cropGroupId}`,
        {
          headers,
        }
      )
      .subscribe(
        (response) => {
          this.varietyList = response.varieties;
        },
        (error) => {}
      );
  }

  backCreate(): void {
    this.router.navigate(['/plant-care/action']);
  }

  backEdit(): void {
    this.router.navigate(['/plant-care/action/view-crop-calender']);
  }

  preventNegativeNumbers(event: KeyboardEvent) {
    // Prevent minus key
    if (event.key === '-' || event.key === 'Subtract') {
      event.preventDefault();
    }

    // Prevent pasting negative numbers
    if (event.ctrlKey && event.key === 'v') {
      setTimeout(() => {
        const control = this.cropForm?.get('cropDuration');
        if (control && control.value < 0) {
          control.setValue(null);
        }
      });
    }
  }
}

export function nonZeroValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = Number(control.value);
  return value > 0 ? null : { nonZero: true };
}

export class CreateCrop {
  varietyId: string = '';
  cultivationMethod: string = '';
  natureOfCultivation: string = '';
  cropDuration: string = '';
  suitableAreas: string = '';
}
