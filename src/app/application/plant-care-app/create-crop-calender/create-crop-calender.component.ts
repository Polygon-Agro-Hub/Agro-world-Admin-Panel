

// import { Component, OnInit } from '@angular/core';
// import {
//   FormBuilder,
//   FormGroup,
//   ReactiveFormsModule,
//   Validators,
//   AbstractControl,
//   ValidationErrors,
// } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute, Router } from '@angular/router';
// import { NgxColorsModule } from 'ngx-colors';
// import Swal from 'sweetalert2';
// import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
// import { CropCalendarService, NewCropCalender, NewCropGroup, NewVarietyGroup } from '../../../services/plant-care/crop-calendar.service';
// import { DropdownModule } from 'primeng/dropdown';
// import { MultiSelectModule } from 'primeng/multiselect';
// import { DropdownChangeEvent } from 'primeng/dropdown';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatSelectModule } from '@angular/material/select';

// interface District {
//   name: string;
// }

// export class CreateCrop {
//   groupId: string = '';
//   varietyId: string = '';
//   cultivationMethod: string = '';
//   natureOfCultivation: string = '';
//   cropDuration: string = '';
//   suitableAreas: string = '';
// }

// @Component({
//   selector: 'app-create-crop-calender',
//   standalone: true,
//   imports: [
//     ReactiveFormsModule,
//     CommonModule,
//     LoadingSpinnerComponent,
//     NgxColorsModule,
//     DropdownModule,
//     MultiSelectModule,
//     MatFormFieldModule,
//     MatSelectModule,
//   ],
//   templateUrl: './create-crop-calender.component.html',
//   styleUrl: './create-crop-calender.component.css',
// })
// export class CreateCropCalenderComponent implements OnInit {
//   toppingList: District[] = [
//     { name: 'Ampara' },
//     { name: 'Anuradhapura' },
//     { name: 'Badulla' },
//     { name: 'Batticaloa' },
//     { name: 'Colombo' },
//     { name: 'Galle' },
//     { name: 'Gampaha' },
//     { name: 'Hambantota' },
//     { name: 'Jaffna' },
//     { name: 'Kalutara' },
//     { name: 'Kandy' },
//     { name: 'Kegalle' },
//     { name: 'Kilinochchi' },
//     { name: 'Kurunegala' },
//     { name: 'Mannar' },
//     { name: 'Matale' },
//     { name: 'Matara' },
//     { name: 'Monaragala' },
//     { name: 'Mullaitivu' },
//     { name: 'Nuwara Eliya' },
//     { name: 'Polonnaruwa' },
//     { name: 'Puttalam' },
//     { name: 'Rathnapura' },
//     { name: 'Trincomalee' },
//     { name: 'Vavuniya' },
//   ].sort((a, b) => a.name.localeCompare(b.name));

//   cropForm: FormGroup;
//   cropId: number | null = null;
//   cropIdNew: number | null = null;
//   createNewObj: CreateCrop = new CreateCrop();
//   cropCalender: NewCropCalender[] = [];
//   isLoading = false;
//   selectedFile: File | null = null;
//   selectedImage: string | ArrayBuffer | null = null;
//   selectedLanguage: 'english' | 'sinhala' | 'tamil' = 'english';
//   selectedPage: 'pageOne' | 'pageTwo' = 'pageOne';
//   groupList: NewCropGroup[] = [];
//   varietyList: NewVarietyGroup[] = [];

//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private route: ActivatedRoute,
//     private cropCalendarService: CropCalendarService
//   ) {
//     this.cropForm = this.fb.group({
//       groupId: [''], // Removed Validators.required
//       varietyId: [''], // Removed Validators.required
//       cultivationMethod: ['', Validators.required],
//       natureOfCultivation: ['', Validators.required],
//       cropDuration: ['', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.min(1)]],
//       suitableAreas: ['', Validators.required],
//     });
//   }

//   ngOnInit() {
//     this.route.queryParams.subscribe((params) => {
//       this.cropId = params['id'] ? +params['id'] : null;
//       if (this.cropId != null) {
//         this.getCropCalenderById(this.cropId);
//       }
//     });
//     this.getAllCropGroups();
//   }

//   getAllCropGroups() {
//     this.isLoading = true;
//     this.cropCalendarService.fetchAllCropGroups().subscribe({
//       next: (response) => {
//         this.groupList = response.items;
//         this.isLoading = false;
//       },
//       error: () => {
//         this.isLoading = false;
//         Swal.fire('Error', 'Failed to fetch crop groups.', 'error');
//       }
//     });
//   }

//   getAllVarities(event: DropdownChangeEvent) {
//     const groupId = event.value;
//     if (groupId) {
//       this.isLoading = true;
//       this.cropCalendarService.getVarietiesByGroup(groupId).subscribe({
//         next: (response) => {
//           this.varietyList = response.groups;
//           this.isLoading = false;
//         },
//         error: () => {
//           this.varietyList = [];
//           this.cropForm.get('varietyId')?.setValue('');
//           this.isLoading = false;
//           Swal.fire('Error', 'Failed to fetch varieties.', 'error');
//         }
//       });
//     } else {
//       this.varietyList = [];
//       this.cropForm.get('varietyId')?.setValue('');
//     }
//   }

//   isFieldInvalid(field: string): boolean {
//     const control = this.cropForm.get(field);
//     return control ? control.invalid && (control.dirty || control.touched) : false;
//   }

//   checkDuplicateCropCalendar(formValue: any, excludeId?: number): Promise<boolean> {
//     return new Promise((resolve) => {
//       this.isLoading = true;
//       this.cropCalendarService.fetchAllCropCalenders(1, 1000).subscribe({
//         next: (response) => {
//           this.isLoading = false;
//           const suitableAreasStr = Array.isArray(formValue.suitableAreas)
//             ? formValue.suitableAreas.sort().join(', ')
//             : formValue.suitableAreas;

//           const isDuplicate = response.items.some((calendar) => {
//             if (excludeId && calendar.id === excludeId) return false; // Skip current crop for edit
//             // Only check required fields for duplication
//             return (
//               calendar.method === formValue.cultivationMethod &&
//               calendar.natOfCul === formValue.natureOfCultivation &&
//               calendar.suitableAreas === suitableAreasStr
//               // Optionally include groupId and varietyId if provided
//               && (!formValue.groupId || (this.groupList.find(g => g.id.toString() === formValue.groupId)?.cropNameEnglish === calendar.cropNameEnglish))
//               && (!formValue.varietyId || (this.varietyList.find(v => v.id.toString() === formValue.varietyId)?.varietyNameEnglish === calendar.varietyNameEnglish))
//             );
//           });
//           resolve(isDuplicate);
//         },
//         error: () => {
//           this.isLoading = false;
//           Swal.fire('Error', 'Failed to check for duplicates.', 'error');
//           resolve(false);
//         }
//       });
//     });
//   }

//   async onSubmit(): Promise<void> {
//     this.cropForm.markAllAsTouched();
//     if (this.cropForm.invalid) {
//       this.showMissingFieldsAlert();
//       return;
//     }

//     const formValue = this.cropForm.value;
//     if (formValue.cropDuration === 0) {
//       Swal.fire('Warning', 'Crop duration in days cannot be 0', 'warning');
//       return;
//     }

//     // Check for duplicates
//     const isDuplicate = await this.checkDuplicateCropCalendar(formValue);
//     if (isDuplicate) {
//       Swal.fire({
//         icon: 'warning',
//         title: 'Duplicate Crop Calendar',
//         text: 'A crop calendar with the same cultivation method, nature of cultivation, and suitable areas already exists.',
//         confirmButtonText: 'OK',
//         allowOutsideClick: false,
//       });
//       return;
//     }

//     if (formValue.suitableAreas && Array.isArray(formValue.suitableAreas)) {
//       formValue.suitableAreas = formValue.suitableAreas.join(', ');
//     }

//     const formData = new FormData();
//     Object.keys(formValue).forEach((key) => {
//       if (formValue[key]) { // Only append non-empty values
//         formData.append(key, formValue[key]);
//       }
//     });

//     if (this.selectedFile) {
//       formData.append('image', this.selectedFile);
//     }

//     this.isLoading = true;
//     this.cropCalendarService.createCropCalendar(formData).subscribe({
//       next: (res: any) => {
//         this.isLoading = false;
//         this.cropIdNew = res.cropId;
//         if (this.cropIdNew !== null) {
//           this.openXlsxUploadDialog(this.cropIdNew);
//         } else {
//           Swal.fire('Error', 'Unable to process XLSX upload due to missing Crop ID', 'error');
//         }
//       },
//       error: () => {
//         this.isLoading = false;
//       }
//     });
//   }

//   private showMissingFieldsAlert(): void {
//     const missingFields = this.getMissingFields();
//     if (missingFields.length > 0) {
//       let errorMessage = 'Please fill in the following required fields:<br><br>';
//       errorMessage += missingFields.map((field) => ` ${field}`).join('<br>');

//       Swal.fire({
//         icon: 'warning',
//         title: 'Missing Information',
//         html: errorMessage,
//         confirmButtonText: 'OK',
//         focusConfirm: false,
//         allowOutsideClick: false,
//       }).then(() => {
//         const firstInvalidField = this.getFirstInvalidField();
//         if (firstInvalidField) {
//           this.scrollToInvalidField(firstInvalidField);
//         }
//       });
//     }
//   }

//   private getMissingFields(): string[] {
//     const missingFields: string[] = [];
//     const controls = this.cropForm.controls;
//     const fieldLabels: { [key: string]: string } = {
//       cultivationMethod: 'Cultivation Method',
//       natureOfCultivation: 'Nature of Cultivation',
//       cropDuration: 'Crop Duration',
//       suitableAreas: 'Suitable Areas',
//     };

//     for (const controlName in controls) {
//       if (controls[controlName].invalid && fieldLabels[controlName]) {
//         missingFields.push(fieldLabels[controlName]);
//       }
//     }
//     return missingFields;
//   }

//   private getFirstInvalidField(): string | null {
//     const controls = this.cropForm.controls;
//     for (const controlName in controls) {
//       if (controls[controlName].invalid) {
//         return controlName;
//       }
//     }
//     return null;
//   }

//   private scrollToInvalidField(fieldName: string): void {
//     const element = document.getElementById(fieldName);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth', block: 'center' });
//       element.focus();
//     }
//   }

//   openXlsxUploadDialog(cropId: number) {
//     Swal.fire({
//       title: 'Upload XLSX File',
//       html: `
//         <div class="upload-container">
//           <input type="file" id="xlsx-file-input" accept=".xlsx, .xls" style="display: none;">
//           <label for="xlsx-file-input" class="upload-box">
//             <div class="upload-box-content" style="cursor: pointer;">
//               <svg xmlns="http://www.w3.org/2000/svg" class="upload-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v8m0 0l-4-4m4 4l4-4M4 20h16" />
//               </svg>
//             </div>
//             <p class="upload-text">Select a XLSX file to upload</p>
//             <p id="selected-file-name" class="file-name">No file selected</p>
//           </label>
//         </div>
//       `,
//       showCancelButton: true,
//       confirmButtonText: 'Upload',
//       cancelButtonText: 'Cancel',
//       allowOutsideClick: false,
//       didOpen: () => {
//         const fileInput = document.getElementById('xlsx-file-input') as HTMLInputElement;
//         const fileNameDisplay = document.getElementById('selected-file-name');
//         Swal.getConfirmButton()?.setAttribute('disabled', 'true');

//         fileInput.onchange = () => {
//           if (fileInput.files && fileInput.files[0]) {
//             fileNameDisplay!.textContent = `Selected file: ${fileInput.files[0].name}`;
//             Swal.getConfirmButton()?.removeAttribute('disabled');
//           } else {
//             Swal.getConfirmButton()?.setAttribute('disabled', 'true');
//           }
//         };
//       },
//       preConfirm: () => {
//         const fileInput = document.getElementById('xlsx-file-input') as HTMLInputElement;
//         if (fileInput.files && fileInput.files[0]) {
//           return fileInput.files[0];
//         }
//         return null;
//       },
//     }).then((result) => {
//       if (result.isConfirmed && result.value) {
//         this.uploadXlsxFile(cropId, result.value);
//       } else {
//         this.deleteCropCalender(cropId);
//       }
//     });
//   }

//   uploadXlsxFile(cropId: number, file: File) {
//     this.isLoading = true;
//     this.cropCalendarService.uploadXlsxFile(cropId, file).subscribe({
//       next: () => {
//         this.isLoading = false;
//         Swal.fire('Success', 'XLSX file uploaded and data inserted successfully', 'success');
//         this.router.navigate(['/plant-care/action/view-crop-calender']);
//       },
//       error: () => {
//         this.isLoading = false;
//       }
//     });
//   }

//   getCropCalenderById(id: number) {
//     this.isLoading = true;
//     this.cropCalendarService.getCropCalendarById(id).subscribe({
//       next: (data: NewCropCalender[]) => {
//         this.cropCalender = data;
//         this.isLoading = false;
//         if (this.cropCalender[0]?.suitableAreas) {
//           const selectedAreas = this.cropCalender[0].suitableAreas
//             .split(', ')
//             .map((area: string) => area.trim());
//           this.cropForm.patchValue({
//             cultivationMethod: this.cropCalender[0].method,
//             natureOfCultivation: this.cropCalender[0].natOfCul,
//             cropDuration: this.cropCalender[0].cropDuration,
//             suitableAreas: selectedAreas,
//             groupId: this.cropCalender[0].groupId?.toString() || '', // Optional
//             varietyId: this.cropCalender[0].varietyId?.toString() || '', // Optional
//           });
//         }
//       },
//       error: () => {
//         this.isLoading = false;
//       }
//     });
//   }

//   async updateCropCalender(): Promise<void> {
//     this.cropForm.markAllAsTouched();
//     if (this.cropForm.invalid) {
//       this.showMissingFieldsAlert();
//       return;
//     }

//     const formValue = this.cropForm.value;
//     // Check for duplicates, excluding the current cropId
//     const isDuplicate = await this.checkDuplicateCropCalendar(formValue, this.cropId!);
//     if (isDuplicate) {
//       Swal.fire({
//         icon: 'warning',
//         title: 'Duplicate Crop Calendar',
//         text: 'A crop calendar with the same cultivation method, nature of cultivation, and suitable areas already exists.',
//         confirmButtonText: 'OK',
//         allowOutsideClick: false,
//       });
//       return;
//     }

//     if (formValue.suitableAreas && Array.isArray(formValue.suitableAreas)) {
//       formValue.suitableAreas = formValue.suitableAreas.join(', ');
//     }

//     const formData = new FormData();
//     formData.append('method', formValue.cultivationMethod);
//     formData.append('natOfCul', formValue.natureOfCultivation);
//     formData.append('cropDuration', formValue.cropDuration);
//     formData.append('suitableAreas', formValue.suitableAreas);
//     if (formValue.groupId) formData.append('groupId', formValue.groupId);
//     if (formValue.varietyId) formData.append('varietyId', formValue.varietyId);

//     if (this.selectedFile) {
//       formData.append('image', this.selectedFile);
//     }

//     this.isLoading = true;
//     this.cropCalendarService.updateCropCalendar(this.cropId!, formData).subscribe({
//       next: () => {
//         this.isLoading = false;
//         Swal.fire('Success', 'Crop Calendar updated successfully!', 'success');
//         this.router.navigate(['/plant-care/action/view-crop-calender']);
//       },
//       error: () => {
//         this.isLoading = false;
//       }
//     });
//   }

//   onCancel() {
//     Swal.fire({
//       icon: 'warning',
//       title: 'Are you sure?',
//       text: 'You may lose the added data after canceling!',
//       showCancelButton: true,
//       confirmButtonText: 'Yes, Cancel',
//       cancelButtonText: 'No, Keep Editing',
//     }).then((result) => {
//       if (result.isConfirmed) {
//         this.selectedFile = null;
//         this.selectedImage = null;
//         this.router.navigate(['/plant-care/action']);
//       }
//     });
//   }

//   onCancelEdit() {
//     Swal.fire({
//       icon: 'warning',
//       title: 'Are you sure?',
//       text: 'You may lose the added data after canceling!',
//       showCancelButton: true,
//       confirmButtonText: 'Yes, Cancel',
//       cancelButtonText: 'No, Keep Editing',
//     }).then((result) => {
//       if (result.isConfirmed) {
//         this.selectedFile = null;
//         this.selectedImage = null;
//         this.router.navigate(['/plant-care/action/view-crop-calender']);
//       }
//     });
//   }

//   deleteCropCalender(id: number) {
//     this.isLoading = true;
//     this.cropCalendarService.deleteCropCalender(id).subscribe({
//       next: () => {
//         this.isLoading = false;
//       },
//       error: () => {
//         this.isLoading = false;
//       }
//     });
//   }

//   blockFloatAndZero(event: KeyboardEvent): void {
//     const invalidKeys = ['.', '-', 'e', '+'];
//     if (invalidKeys.includes(event.key)) {
//       event.preventDefault();
//     }
//   }

//   validateCropDuration(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     const value = Number(input.value);
//     if (value <= 0) {
//       input.value = '';
//       this.cropForm.get('cropDuration')?.setValue('');
//     }
//   }

//   blockPasteInvalid(event: ClipboardEvent): void {
//     const pasteData = event.clipboardData?.getData('text') ?? '';
//     const value = Number(pasteData);
//     if (!/^\d+$/.test(pasteData) || value <= 0) {
//       event.preventDefault();
//     }
//   }

//   backCreate(): void {
//     this.router.navigate(['/plant-care/action']);
//   }

//   backEdit(): void {
//     this.router.navigate(['/plant-care/action/view-crop-calender']);
//   }
// }

// export function nonZeroValidator(control: AbstractControl): ValidationErrors | null {
//   const value = Number(control.value);
//   return value > 0 ? null : { nonZero: true };
// }


// create-crop-calender.component.ts
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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cropCalendarService: CropCalendarService
  ) {
    this.cropForm = this.fb.group({
      groupId: ['', Validators.required], // Add Validators.required
      varietyId: ['', Validators.required], // Add Validators.required
      cultivationMethod: ['', Validators.required],
      natureOfCultivation: ['', Validators.required],
      cropDuration: ['', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.min(1)]],
      suitableAreas: ['', Validators.required],
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

  cultivationMethodOptions = [
    { label: 'Open Field', value: 'Open Field' },
    { label: 'Protected Field', value: 'Protected Field' }
  ];


  natureOptions = [
    { label: 'Conventional Farming', value: 'Conventional Farming' },
    { label: 'GAP Farming', value: 'GAP Farming' },
    { label: 'Organic Farming', value: 'Organic Farming' }
  ];

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

  // Create a custom validation that excludes groupId and varietyId for edit mode
  if (this.cropId !== null) {
    // Check if other required fields are valid (excluding groupId and varietyId)
    const otherFieldsValid =
      this.cropForm.get('cultivationMethod')?.valid &&
      this.cropForm.get('natureOfCultivation')?.valid &&
      this.cropForm.get('cropDuration')?.valid &&
      this.cropForm.get('suitableAreas')?.valid;

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

    // Only append groupId and varietyId if they have values (for edit mode)
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
    };

    for (const controlName in controls) {
      // Skip groupId and varietyId validation in edit mode
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
        if (this.cropCalender[0]?.suitableAreas) {
          const selectedAreas = this.cropCalender[0].suitableAreas
            .split(', ')
            .map((area: string) => area.trim());
          this.cropForm.patchValue({
            cultivationMethod: this.cropCalender[0].method,
            natureOfCultivation: this.cropCalender[0].natOfCul,
            cropDuration: this.cropCalender[0].cropDuration,
            suitableAreas: selectedAreas,
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



}




export function nonZeroValidator(control: AbstractControl): ValidationErrors | null {
  const value = Number(control.value);
  return value > 0 ? null : { nonZero: true };
}