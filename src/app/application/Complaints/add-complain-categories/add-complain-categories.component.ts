
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ComplaintsService } from '../../../services/complaints/complaints.service';
import Swal from 'sweetalert2';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-add-complain-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule],
  templateUrl: './add-complain-categories.component.html',
  styleUrls: ['./add-complain-categories.component.css']
})
export class AddComplainCategoriesComponent implements OnInit {
  roleArr: Roles[] = [];
  appsArr: Apps[] = [];
  complainObj: ComplainCategory = new ComplainCategory();

  constructor(
    private router: Router,
    private complaintSrv: ComplaintsService
  ) { }

  ngOnInit(): void {
    this.fetchComplainCategory();
  }

  fetchComplainCategory() {
    this.complaintSrv.getAdminComplainCategoryForCreate().subscribe(
      (res) => {
        this.roleArr = res.adminRoles;
        this.appsArr = res.systemApps;
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
      errors.push('Select Displaying Application is required');
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
  
    this.complaintSrv.AddNewComplainCategory(this.complainObj).subscribe(
      (res) => {
        if (res.status) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Complaint category created successfully!',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
              confirmButton: 'bg-[#3980C0] text-white px-4 py-2 rounded-lg'
            }
          });
          window.history.back()
        } else {
          if (res.message === 'Category already added') {
            Swal.fire({
              icon: 'info',
              title: 'Info',
              text: 'This complaint category already exists.',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold',
                confirmButton: 'bg-[#3980C0] text-white px-4 py-2 rounded-lg'
              }
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Error occurred while creating complaint category!',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold',
                confirmButton: 'bg-[#3980C0] text-white px-4 py-2 rounded-lg'
              }
            });
          }
        }
      },
      (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Already added this category!',
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
      text: 'You may lose the added data after going back!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Go Back',
      cancelButtonText: 'No, Stay Here',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
        confirmButton: 'bg-[#3980C0] text-white px-4 py-2 rounded-lg mr-2',
        cancelButton: 'bg-[#74788D] text-[#D3D3D3] px-4 py-2 rounded-lg'
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/complaints']);
      }
    });
  }

  onCancel() {
    Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "You may lose the added data after canceling!",
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel",
      cancelButtonText: "No, Keep Editing",
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
        confirmButton: 'bg-[#3980C0] text-white px-4 py-2 rounded-lg mr-2',
        cancelButton: 'bg-[#74788D] text-[#D3D3D3] px-4 py-2 rounded-lg'
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(["/complaints"]);
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
        return 'Displaying Application is required';
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

  navigationPath(path: string) {
    this.router.navigate([path]);
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
  roleId: number = 0;
  appId: number = 0;
  categoryEnglish!: string;
  categorySinhala!: string;
  categoryTamil!: string;
}