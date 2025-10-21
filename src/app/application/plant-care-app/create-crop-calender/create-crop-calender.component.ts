import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxColorsModule } from 'ngx-colors';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CropCalendarService, NewCropCalender, NewCropGroup, NewVarietyGroup } from '../../../services/plant-care/crop-calendar.service';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

interface District {
  name: string;
}

export class CreateCrop {
  groupId: string = '';
  varietyId: string = '';
  cultivationMethod: string = '';
  natureOfCultivation: string = '';
  cropDuration: string = '';
  suitableAreas: string = '';
  specialNotes: string = '';
}

@Component({
  selector: 'app-create-crop-calender',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    LoadingSpinnerComponent,
    NgxColorsModule,
    DropdownModule,
    MultiSelectModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './create-crop-calender.component.html',
  styleUrls: ['./create-crop-calender.component.css'],
})
export class CreateCropCalenderComponent implements OnInit {
  toppingList: District[] = [
    { name: 'Ampara' },
    { name: 'Anuradhapura' },
    { name: 'Badulla' },
    { name: 'Batticaloa' },
    { name: 'Colombo' },
    { name: 'Galle' },
    { name: 'Gampaha' },
    { name: 'Hambantota' },
    { name: 'Jaffna' },
    { name: 'Kalutara' },
    { name: 'Kandy' },
    { name: 'Kegalle' },
    { name: 'Kilinochchi' },
    { name: 'Kurunegala' },
    { name: 'Mannar' },
    { name: 'Matale' },
    { name: 'Matara' },
    { name: 'Monaragala' },
    { name: 'Mullaitivu' },
    { name: 'Nuwara Eliya' },
    { name: 'Polonnaruwa' },
    { name: 'Puttalam' },
    { name: 'Rathnapura' },
    { name: 'Trincomalee' },
    { name: 'Vavuniya' },
  ].sort((a, b) => a.name.localeCompare(b.name));

  cropForm: FormGroup;
  cropId: number | null = null;
  cropIdNew: number | null = null;
  createNewObj: CreateCrop = new CreateCrop();
  cropCalender: NewCropCalender[] = [];
  isLoading = false;
  selectedFile: File | null = null;
  selectedImage: string | ArrayBuffer | null = null;
  selectedLanguage: 'english' | 'sinhala' | 'tamil' = 'english';
  selectedPage: 'pageOne' | 'pageTwo' = 'pageOne';
  groupList: NewCropGroup[] = [];
  varietyList: NewVarietyGroup[] = [];

  cultivationMethodOptions = [
    { label: 'Open Field', value: 'Open Field' },
    { label: 'Protected Field', value: 'Protected Field' }
  ];

  natureOptions = [
    { label: 'Conventional Farming', value: 'Conventional Farming' },
    { label: 'GAP Farming', value: 'GAP Farming' },
    { label: 'Organic Farming', value: 'Organic Farming' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cropCalendarService: CropCalendarService
  ) {
    this.cropForm = this.fb.group({
      groupId: ['', Validators.required],
      varietyId: ['', Validators.required],
      cultivationMethod: ['', Validators.required],
      natureOfCultivation: ['', Validators.required],
      cropDuration: ['', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.min(1)]],
      suitableAreas: ['', Validators.required],
      specialNotes: ['', Validators.required]
    });
  }

  back(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after going back!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Go Back',
      cancelButtonText: 'No, Stay Here',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
      buttonsStyling: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/plant-care/action']);
      }
    });
  }

  backEdit(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after going back!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Go Back',
      cancelButtonText: 'No, Stay Here',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
      buttonsStyling: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/plant-care/action/view-crop-calender']);
      }
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.cropId = params['id'] ? +params['id'] : null;
      if (this.cropId != null) {
        this.getCropCalenderById(this.cropId);
      }
    });
    this.getAllCropGroups();
  }

  getAllCropGroups() {
    this.isLoading = true;
    this.cropCalendarService.cropGropForFilter().subscribe({
      next: (response) => {
        this.groupList = response.items;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        Swal.fire('Error', 'Failed to fetch crop groups.', 'error');
      },
    });
  }

  getAllVarities(event: DropdownChangeEvent) {
    const groupId = event.value;
    if (groupId) {
      this.isLoading = true;
      this.cropCalendarService.getVarietiesByGroup(groupId).subscribe({
        next: (response) => {
          this.varietyList = response.groups;
          this.isLoading = false;
        },
        error: () => {
          this.varietyList = [];
          this.cropForm.get('varietyId')?.setValue('');
          this.isLoading = false;
          Swal.fire('Error', 'Failed to fetch varieties.', 'error');
        },
      });
    } else {
      this.varietyList = [];
      this.cropForm.get('varietyId')?.setValue('');
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.cropForm.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  checkDuplicateCropCalendar(formValue: any, excludeId?: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.isLoading = true;
      const { varietyId, cultivationMethod, natureOfCultivation } = formValue;

      if (!cultivationMethod || !natureOfCultivation) {
        this.isLoading = false;
        Swal.fire('Error', 'Cultivation Method and Nature of Cultivation are required for duplicate check.', 'error');
        reject(new Error('Missing required fields for duplicate check'));
        return;
      }

      this.cropCalendarService
        .checkDuplicateCropCalendar(varietyId || '', cultivationMethod, natureOfCultivation, excludeId)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            resolve(response.exists);
          },
          error: (err) => {
            this.isLoading = false;
            Swal.fire('Error', 'Failed to check for duplicates.', 'error');
            reject(err);
          },
        });
    });
  }

  async onSubmit(): Promise<void> {
    this.cropForm.markAllAsTouched();
    if (this.cropForm.invalid) {
      this.showMissingFieldsAlert();
      return;
    }

    const formValue = this.cropForm.value;
    if (formValue.cropDuration === 0) {
      Swal.fire('Warning', 'Crop duration in days cannot be 0', 'warning');
      return;
    }

    try {
      const isDuplicate = await this.checkDuplicateCropCalendar(formValue);
      if (isDuplicate) {
        Swal.fire({
          icon: 'error',
          title: 'Already Exists',
          text: 'A crop calendar with the same variety, cultivation method, and nature of cultivation already exists.',
          confirmButtonText: 'OK',
          allowOutsideClick: false,
        });
        return;
      }

      if (formValue.suitableAreas && Array.isArray(formValue.suitableAreas)) {
        formValue.suitableAreas = formValue.suitableAreas.join(', ');
      }

      const formData = new FormData();
      Object.keys(formValue).forEach((key) => {
        if (formValue[key]) {
          formData.append(key, formValue[key]);
        }
      });

      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      this.isLoading = true;
      this.cropCalendarService.createCropCalendar(formData).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.cropIdNew = res.cropId;
          if (this.cropIdNew !== null) {
            this.openXlsxUploadDialog(this.cropIdNew);
          } else {
            Swal.fire('Error', 'Unable to process XLSX upload due to missing Crop ID', 'error');
          }
        },
        error: () => {
          this.isLoading = false;
          Swal.fire('Error', 'Failed to create crop calendar.', 'error');
        },
      });
    } catch (err) {
      this.isLoading = false;
      Swal.fire('Error', 'Failed to perform duplicate check.', 'error');
    }
  }

  async updateCropCalendar(): Promise<void> {
    this.cropForm.markAllAsTouched();

    // For edit mode, we need to validate all fields except groupId and varietyId which are hidden
    if (this.cropId !== null) {
      // Check if other required fields are valid (excluding groupId and varietyId since they're not in edit form)
      const otherFieldsValid =
        this.cropForm.get('cultivationMethod')?.valid &&
        this.cropForm.get('natureOfCultivation')?.valid &&
        this.cropForm.get('cropDuration')?.valid &&
        this.cropForm.get('suitableAreas')?.valid &&
        this.cropForm.get('specialNotes')?.valid;

      if (!otherFieldsValid) {
        this.showMissingFieldsAlert();
        return;
      }
    } else {
      // For create mode, validate all fields
      if (this.cropForm.invalid) {
        this.showMissingFieldsAlert();
        return;
      }
    }

    const formValue = this.cropForm.value;

    try {
      const isDuplicate = await this.checkDuplicateCropCalendar(formValue, this.cropId!);
      if (isDuplicate) {
        Swal.fire({
          icon: 'error',
          title: 'Already Exists',
          text: 'A crop calendar with the same variety, cultivation method, and nature of cultivation already exists.',
          confirmButtonText: 'OK',
          allowOutsideClick: false,
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          },
        });
        return;
      }

      if (formValue.suitableAreas && Array.isArray(formValue.suitableAreas)) {
        formValue.suitableAreas = formValue.suitableAreas.join(', ');
      }

      const formData = new FormData();
      formData.append('method', formValue.cultivationMethod);
      formData.append('natOfCul', formValue.natureOfCultivation);
      formData.append('cropDuration', formValue.cropDuration);
      formData.append('suitableAreas', formValue.suitableAreas);
      formData.append('specialNotes', formValue.specialNotes);

      // Only append groupId and varietyId if they have values (they might be empty in edit mode)
      if (formValue.groupId) formData.append('groupId', formValue.groupId);
      if (formValue.varietyId) formData.append('varietyId', formValue.varietyId);

      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      this.isLoading = true;
      this.cropCalendarService.updateCropCalendar(this.cropId!, formData).subscribe({
        next: () => {
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Crop calendar has been updated successfully.',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
            },
          });
          this.router.navigate(['/plant-care/action/view-crop-calender']);
        },
        error: () => {
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to update crop calendar.',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
            },
          });
        },
      });
    } catch (err) {
      this.isLoading = false;
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to perform duplicate check.',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        },
      });
    }
  }

  private showMissingFieldsAlert(): void {
    const missingFields = this.getMissingFields();
    if (missingFields.length > 0) {
      let errorMessage = 'Please fill in the following required fields:<br><br>';
      errorMessage += missingFields.map((field) => ` ${field}`).join('<br>');

      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        html: errorMessage,
        confirmButtonText: 'OK',
        focusConfirm: false,
        allowOutsideClick: false,
      }).then(() => {
        const firstInvalidField = this.getFirstInvalidField();
        if (firstInvalidField) {
          this.scrollToInvalidField(firstInvalidField);
        }
      });
    }
  }

  private getMissingFields(): string[] {
    const missingFields: string[] = [];
    const controls = this.cropForm.controls;
    const fieldLabels: { [key: string]: string } = {
      groupId: 'Crop Name',
      varietyId: 'Variety Name',
      cultivationMethod: 'Cultivation Method',
      natureOfCultivation: 'Nature of Cultivation',
      cropDuration: 'Crop Duration',
      suitableAreas: 'Suitable Areas',
      specialNotes: 'Special Notes'
    };

    for (const controlName in controls) {
      // Skip groupId and varietyId validation in edit mode since they're not shown in the form
      if (this.cropId !== null && (controlName === 'groupId' || controlName === 'varietyId')) {
        continue;
      }

      if (controls[controlName].invalid && fieldLabels[controlName]) {
        missingFields.push(fieldLabels[controlName]);
      }
    }
    return missingFields;
  }

  private getFirstInvalidField(): string | null {
    const controls = this.cropForm.controls;
    for (const controlName in controls) {
      // Skip hidden fields in edit mode
      if (this.cropId !== null && (controlName === 'groupId' || controlName === 'varietyId')) {
        continue;
      }
      
      if (controls[controlName].invalid) {
        return controlName;
      }
    }
    return null;
  }

  private scrollToInvalidField(fieldName: string): void {
    const element = document.getElementById(fieldName);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus();
    }
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
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
        confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
        cancelButton: 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-black dark:text-white',
      },
      didOpen: () => {
        const fileInput = document.getElementById('xlsx-file-input') as HTMLInputElement;
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
        const fileInput = document.getElementById('xlsx-file-input') as HTMLInputElement;
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
    this.isLoading = true;
    this.cropCalendarService.uploadXlsxFile(cropId, file).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          title: 'Success',
          text: 'Crop calendar has been added successfully.',
          icon: 'success',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
            confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
          },
        });
        this.router.navigate(['/plant-care/action/view-crop-calender']);
      },
      error: () => {
        this.isLoading = false;
        Swal.fire({
          title: 'Error',
          text: 'Failed to upload XLSX file.',
          icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
            confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
          },
        });
      },
    });
  }

  getCropCalenderById(id: number) {
    this.isLoading = true;
    this.cropCalendarService.getCropCalendarById(id).subscribe({
      next: (data: NewCropCalender[]) => {
        this.cropCalender = data;
        this.isLoading = false;
        if (this.cropCalender[0]) {
          const selectedAreas = this.cropCalender[0].suitableAreas
            ? this.cropCalender[0].suitableAreas.split(', ').map((area: string) => area.trim())
            : [];

          this.cropForm.patchValue({
            cultivationMethod: this.cropCalender[0].method || '',
            natureOfCultivation: this.cropCalender[0].natOfCul || '',
            cropDuration: this.cropCalender[0].cropDuration || '',
            suitableAreas: selectedAreas,
            specialNotes: this.cropCalender[0] .specialNotes || '',
            groupId: this.cropCalender[0].groupId?.toString() || '',
            varietyId: this.cropCalender[0].varietyId?.toString() || '',
          });
        }
      },
      error: () => {
        this.isLoading = false;
        Swal.fire('Error', 'Failed to fetch crop calendar.', 'error');
      },
    });
  }

  onCancel() {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after canceling!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'No, Keep Editing',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
      buttonsStyling: true,
    }).then((result) => {
      if (result.isConfirmed) {
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
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
      buttonsStyling: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/plant-care/action/view-crop-calender']);
      }
    });
  }

  deleteCropCalender(id: number) {
    this.isLoading = true;
    this.cropCalendarService.deleteCropCalender(id).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          title: 'Success',
          text: 'Crop calendar deleted successfully.',
          icon: 'success',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
            confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
          },
        });
      },
      error: () => {
        this.isLoading = false;
        Swal.fire({
          title: 'Error',
          text: 'Failed to delete crop calendar.',
          icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
            confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
          },
        });
      },
    });
  }

  blockFloatAndZero(event: KeyboardEvent): void {
    const invalidKeys = ['.', '-', 'e', '+'];
    if (invalidKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  validateCropDuration(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    if (value <= 0) {
      input.value = '';
      this.cropForm.get('cropDuration')?.setValue('');
    }
  }

  blockPasteInvalid(event: ClipboardEvent): void {
    const pasteData = event.clipboardData?.getData('text') ?? '';
    const value = Number(pasteData);
    if (!/^\d+$/.test(pasteData) || value <= 0) {
      event.preventDefault();
    }
  }

  blockStartingSpace(event: KeyboardEvent): void {
  const target = event.target as HTMLTextAreaElement;
  const cursorPosition = target.selectionStart;
  
  // Block space if cursor is at the beginning or if the text is empty
  if (event.key === ' ' && (cursorPosition === 0 || target.value.length === 0)) {
    event.preventDefault();
  }
}

trimStartingSpaces(event: Event, controlName: string): void {
  const target = event.target as HTMLTextAreaElement;
  const currentValue = target.value;
  
  // Remove leading spaces
  if (currentValue.startsWith(' ')) {
    const trimmedValue = currentValue.replace(/^\s+/, '');
    this.cropForm.get(controlName)?.setValue(trimmedValue, { emitEvent: false });
    
    // Set cursor position after the update
    setTimeout(() => {
      target.setSelectionRange(trimmedValue.length, trimmedValue.length);
    });
  }
}

capitalizeFirstLetter(event: Event, controlName: string): void {
  const target = event.target as HTMLTextAreaElement;
  const currentValue = target.value.trim();
  
  if (currentValue && currentValue.length > 0) {
    // Capitalize first letter and keep the rest as is
    const capitalizedValue = currentValue.charAt(0).toUpperCase() + currentValue.slice(1);
    
    if (currentValue !== capitalizedValue) {
      this.cropForm.get(controlName)?.setValue(capitalizedValue, { emitEvent: false });
    }
  }
}

onTextareaInput(event: Event): void {
  const textarea = event.target as HTMLTextAreaElement;
  const value = textarea.value;
  
  // Block starting spaces
  if (value.startsWith(' ')) {
    textarea.value = value.trimStart();
    this.cropForm.get('specialNotes')?.setValue(textarea.value);
    return;
  }
  
  // Auto-capitalize first letter in real-time
  if (value.length === 1) {
    textarea.value = value.toUpperCase();
    this.cropForm.get('specialNotes')?.setValue(textarea.value);
  } else if (value.length > 1 && value[0] !== value[0].toUpperCase()) {
    textarea.value = value.charAt(0).toUpperCase() + value.slice(1);
    this.cropForm.get('specialNotes')?.setValue(textarea.value);
  }
}

capitalizeTextarea(): void {
  const value = this.cropForm.get('specialNotes')?.value;
  if (value && value.length > 0) {
    const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
    this.cropForm.get('specialNotes')?.setValue(capitalized);
  }
}
}

export function nonZeroValidator(control: AbstractControl): ValidationErrors | null {
  const value = Number(control.value);
  return value > 0 ? null : { nonZero: true };
}