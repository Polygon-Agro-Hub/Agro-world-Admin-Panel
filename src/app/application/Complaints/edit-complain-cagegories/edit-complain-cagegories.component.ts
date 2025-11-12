
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComplaintsService } from '../../../services/complaints/complaints.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";
import { DropdownModule } from 'primeng/dropdown';
import { Location } from '@angular/common';
@Component({
  selector: 'app-edit-complain-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, DropdownModule],
templateUrl: './edit-complain-cagegories.component.html',
  styleUrl: './edit-complain-cagegories.component.css'
})
export class EditComplainCagegoriesComponent implements OnInit {
  categorieId!: number;
  roleArr: Roles[] = [];
  appsArr: Apps[] = [];
  complainObj: ComplainCategory = new ComplainCategory();
  isLoading: boolean = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private complaintSrv: ComplaintsService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.categorieId = this.route.snapshot.params['id'];
    this.fetchComplainCategory();
    this.fetchCategoriDetails();
  }

  fetchComplainCategory() {
    this.isLoading = true;
    this.complaintSrv.getAdminComplainCategoryForCreate().subscribe(
      (res) => {
        this.roleArr = res.adminRoles;
        this.appsArr = res.systemApps;
        this.isLoading = false;
      },
      (err) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch complaint category data!',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          }
        });
      }
    );
  }

  fetchCategoriDetails() {
    this.isLoading = true;
    this.complaintSrv.getCategoieDetailsById(this.categorieId).subscribe(
      (res) => {
        this.complainObj = res;
        this.isLoading = false;
      },
      (err) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch category details!',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          }
        });
      }
    );
  }

  validateForm(): string[] {
    const errors: string[] = [];
    const c = this.complainObj;

    if (!c.roleId || c.roleId === 0) {
      errors.push('Complaint Assignee Admin Category is required');
    }
    if (!c.appId || c.appId === 0) {
      errors.push('Displaying application is required');
    }
    if (!c.categoryEnglish || c.categoryEnglish.trim() === '') {
      errors.push('Category name in English is required');
    }
    if (!c.categorySinhala || c.categorySinhala.trim() === '') {
      errors.push('Category name in Sinhala is required');
    }
    if (!c.categoryTamil || c.categoryTamil.trim() === '') {
      errors.push('Category name in Tamil is required');
    }

    return errors;
  }

  onSubmit() {
    const validationErrors = this.validateForm();
    
    if (validationErrors.length > 0) {
      const errorList = validationErrors.map(error => `<li class="text-left">${error}</li>`).join('');
      const errorHtml = `<ul class="text-left list-disc pl-5">${errorList}</ul>`;
      
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        html: `Please fix the following errors: ${errorHtml}`,
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
          confirmButton: 'bg-[#3980C0] text-white px-4 py-2 rounded-lg'
        }
      });
      return;
    }
  
    this.isLoading = true;
    this.complaintSrv.EditComplainCategory(this.complainObj).subscribe(
      (res) => {
        this.isLoading = false;
        if (res.status) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Complaint category updated successfully!',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
              confirmButton: 'bg-[#3980C0] text-white px-4 py-2 rounded-lg'
            }
          });
          window.history.back()
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error occurred while updating complaint category!',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
              confirmButton: 'bg-[#3980C0] text-white px-4 py-2 rounded-lg'
            }
          });
        }
      },
      (err) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update complaint category!',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
            confirmButton: 'bg-[#3980C0] text-white px-4 py-2 rounded-lg'
          }
        });
      }
    );
  }

  back(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the changes after going back!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Go Back',
      cancelButtonText: 'No, Stay Here',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
        confirmButton: 'bg-[#3980C0] text-white px-4 py-2 rounded-lg mr-2',
        cancelButton: 'bg-[#74788D] text-[#D3D3D3] px-4 py-2 rounded-lg'
      }
    }).then((result) => {
if (result.isConfirmed) {
  this.location.back();
}
    });
  }

  onCancel() {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the changes after canceling!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'No, Keep Editing',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
        confirmButton: 'bg-[#3980C0] text-white px-4 py-2 rounded-lg mr-2',
        cancelButton: 'bg-[#74788D] text-[#D3D3D3] px-4 py-2 rounded-lg'
      }
    }).then((result) => {
   if (result.isConfirmed) {
  this.location.back();
}
    });
  }

  blockLeadingSpace(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    if (event.key === ' ' && input.selectionStart === 0) {
      event.preventDefault();
    }
  }

  validateEnglish(): void {
    let value = this.complainObj.categoryEnglish || '';
    value = value.replace(/[^A-Za-z ]+/g, '');
    value = value.replace(/^\s+/, '');
    this.complainObj.categoryEnglish = value;
  }

  allowOnlySinhala(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const char = event.key;
    if (char === ' ' && input.selectionStart === 0) {
      event.preventDefault();
      return;
    }
    if (!/^[\u0D80-\u0DFF ]$/.test(char) && event.key.length === 1) {
      event.preventDefault();
    }
  }

  allowOnlyTamil(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const char = event.key;
    if (char === ' ' && input.selectionStart === 0) {
      event.preventDefault();
      return;
    }
    if (!/^[\u0B80-\u0BFF ]$/.test(char) && event.key.length === 1) {
      event.preventDefault();
    }
  }

  isFieldInvalid(field: any): boolean {
    return field?.invalid && (field?.dirty || field?.touched);
  }

  markTouched(field: any) {
    field.control.markAsTouched();
    field.control.updateValueAndValidity();
  }

  getErrorMessage(fieldName: string): string {
    switch (fieldName) {
      case 'roleId':
        return 'Complaint Assignee Admin Category is required';
      case 'appId':
        return 'Displaying application is required';
      case 'categoryEnglish':
        return 'Category name in English is required';
      case 'categorySinhala':
        return 'Category name in Sinhala is required';
      case 'categoryTamil':
        return 'Category name in Tamil is required';
      default:
        return '';
    }
  }
}

class Roles {
  id!: number;
  role!: string;
}

class Apps {
  id!: number;
  appName!: string;
}

class ComplainCategory {
  id!: number;
  roleId!: number;
  appId!: number;
  categoryEnglish!: string;
  categorySinhala!: string;
  categoryTamil!: string;
}