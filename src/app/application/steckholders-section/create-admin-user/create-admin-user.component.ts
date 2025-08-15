import { Component, OnInit } from '@angular/core';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormsModule,
  ValidationErrors,
  AbstractControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from '../../../environment/environment';
import { TokenService } from '../../../services/token/services/token.service';

interface Admin {
  id: number;
  mail: string;
  userName: string;
  role: string;
  position: string;
  storedCurrentPassword: string | null;
}

interface Roles {
  id: number;
  role: string;
}

@Component({
  selector: 'app-create-admin-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HttpClientModule],
  templateUrl: './create-admin-user.component.html',
  styleUrls: ['./create-admin-user.component.css'],
})
export class CreateAdminUserComponent implements OnInit {
  itemId: number | null = null;
  adminDetails: Admin[] = [];
  createAdminObj: CreateAdmin = new CreateAdmin();

  isPopupVisible = false;
  showPassword: boolean = false;
  rolesList: any[] = [];
  positionList: any[] = [];

  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private tokenService: TokenService
  ) {
    this.userForm = this.fb.group({
      id: [''],
      mail: ['', [Validators.required, this.emailValidator()]],
      userName: ['', [Validators.required, this.singleWordValidator]],
      role: ['', Validators.required],
      position: ['', Validators.required],
      password: ['', []], // Set validation dynamically
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.itemId = params['id'] ? +params['id'] : null;
    });

    if (this.itemId) {
      this.getAdminById(this.itemId);
      this.setPasswordValidation(false); // Not required for update
    } else {
      this.setPasswordValidation(true); // Required for creation
    }

    this.getAllRoles();
    this.getAllPosition();

    this.userForm.get('role')?.valueChanges.subscribe((roleId) => {
      if (+roleId === 1) {
        this.userForm.get('position')?.setValue(1);
        this.userForm.get('position')?.disable();
      } else {
        this.userForm.get('position')?.enable();
      }
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
    // keep default button styling
    buttonsStyling: true,
  }).then((result) => {
    if (result.isConfirmed) {
      this.router.navigate(['/steckholders/action/admin']);
    }
  });
}



  setPasswordValidation(isRequired: boolean) {
    const passwordControl = this.userForm.get('password');
    if (isRequired) {
      passwordControl?.setValidators([
        Validators.required,
        this.passwordValidator(),
      ]);
    } else {
      passwordControl?.clearValidators();
    }
    passwordControl?.updateValueAndValidity();
  }

  get isSuperAdminSelected(): boolean {
    return +this.userForm.get('role')?.value === 1;
  }

  getAllRoles() {
    const token = this.tokenService.getToken();
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>(`${environment.API_URL}auth/get-all-roles`, { headers }).subscribe(
      (response) => (this.rolesList = response.roles),
      (error) => console.error('Error fetching roles:', error)
    );
  }

  getAllPosition() {
    const token = this.tokenService.getToken();
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>(`${environment.API_URL}auth/get-all-position`, { headers }).subscribe(
      (response) => (this.positionList = response.positions),
      (error) => console.error('Error fetching positions:', error)
    );
  }
  emailValidator(): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      const value: string = control.value;
      if (!value) return null;

      // Stricter email regex
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const valid = emailRegex.test(value);

      return !valid ? { invalidEmail: true } : null;
    };
  }

  singleWordValidator(control: AbstractControl): ValidationErrors | null {
    const hasSpace = /\s/.test(control.value);
    const hasNumber = /\d/.test(control.value);
    if (hasNumber) return { containsNumber: true };
    return hasSpace ? { singleWord: true } : null;
  }

  passwordValidator(): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      const value: string = control.value;
      if (!value) return null;

      const valid =
        /[A-Z]/.test(value) &&
        /[a-z]/.test(value) &&
        /[0-9]/.test(value) &&
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value) &&
        value.length >= 8;

      return !valid ? { invalidPassword: true } : null;
    };
  }

  preventLeadingSpace(event: KeyboardEvent, fieldName: string): void {
    const input = event.target as HTMLInputElement;

    if (event.key === ' ' && (input.selectionStart === 0 || !input.value.trim())) {
      event.preventDefault();
    }
  }


  formatTextInput(fieldName: string): void {
    const control = this.userForm.get(fieldName);
    if (control && control.value) {
      const cleanedValue = control.value.replace(/^\s+/, '');
      control.setValue(cleanedValue);
    }
  }




  getErrorMessage(controlName: string): string {
    const control = this.userForm.get(controlName);

    if (control?.hasError('required')) {
      switch (controlName) {
        case 'userName':
          return 'Username is required';
        case 'mail':
          return 'Email is required';
        case 'password':
          return 'Password is required';
        case 'role':
          return 'Department is required';
        case 'position':
          return 'Position is required';
        default:
          return 'This field is required';
      }
    }

    if (control?.hasError('email')) {
      return 'Invalid email format !(example@gmail.com)';
    }
    if (control?.hasError('invalidPassword')) {
      return 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }
    if (control?.hasError('singleWord')) {
      return 'Username must be a single word (no spaces allowed)';
    }
    if (control?.hasError('containsNumber')) {
      return 'Username cannot contain numbers';
    }

    return ''; // Default return to satisfy the string return type
  }


  getAdminById(id: number): void {
    const token = this.tokenService.getToken();
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http
      .get<Admin[]>(`${environment.API_URL}auth/get-admin-by-id/${id}`, {
        headers,
      })
      .subscribe(
        (data) => {
          if (data && data.length > 0) {
            const admin = data[0];
            this.userForm.patchValue({
              id: admin.id,
              mail: admin.mail,
              userName: admin.userName,
              role: admin.role,
              position: admin.position,
            });
          }
        },
        (error) => console.error('Error fetching admin:', error)
      );
  }

  // Updated getValidationErrors method
  getValidationErrors(): string {
    const requiredFields: string[] = [];
    const otherErrors: string[] = [];

    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      if (control && control.invalid && (control.dirty || control.touched)) {
        if (control.hasError('required')) {
          // Group required field errors
          switch (key) {
            case 'userName':
              requiredFields.push('Username');
              break;
            case 'mail':
              requiredFields.push('Email');
              break;
            case 'password':
              requiredFields.push('Password');
              break;
            case 'role':
              requiredFields.push('Department');
              break;
            case 'position':
              requiredFields.push('Position');
              break;
          }
        } else {
          // Get specific error messages for non-required errors
          const errorMessage = this.getErrorMessage(key);
          if (errorMessage && !errorMessage.includes('required')) {
            otherErrors.push(errorMessage);
          }
        }
      }
    });

    let errorMessage = '';

    // Format required fields message
    if (requiredFields.length > 0) {
      if (requiredFields.length === 1) {
        errorMessage += `${requiredFields[0]} is required`;
      } else if (requiredFields.length === 2) {
        errorMessage += `${requiredFields[0]} & ${requiredFields[1]} are required`;
      } else {
        const lastField = requiredFields.pop();
        errorMessage += `${requiredFields.join(', ')} & ${lastField} are required`;
      }
    }

    // Add other validation errors
    if (otherErrors.length > 0) {
      if (errorMessage) {
        errorMessage += '\n\nAdditional errors:\n';
      }
      errorMessage += otherErrors.join('\n');
    }

    return errorMessage;
  }

  // Updated updateAdmin method
  updateAdmin(itemId: number | null) {
  // Log form values to verify
  console.log('userForm values before update:', this.userForm.value);

  const missingFields: string[] = [];

  // Validate form fields
  if (this.userForm.get('userName')?.invalid) {
    if (this.userForm.get('userName')?.errors?.['required']) {
      missingFields.push('User Name');
    } else if (this.userForm.get('userName')?.errors?.['pattern']) {
      missingFields.push('User Name - Must contain only letters and spaces');
    }
  }

  if (this.userForm.get('mail')?.invalid) {
    if (this.userForm.get('mail')?.errors?.['required']) {
      missingFields.push('Email');
    } else if (this.userForm.get('mail')?.errors?.['email']) {
      missingFields.push('Email - Invalid format (e.g., example@domain.com)');
    }
  }

  if (this.userForm.get('role')?.invalid) {
    missingFields.push('Department');
  }

  if (this.userForm.get('position')?.invalid) {
    missingFields.push('Position');
  }

  // If errors, show popup and stop submission
  if (missingFields.length > 0) {
    let errorMessage = '<div class="text-left"><p class="mb-2">Please fix the following issues:</p><ul class="list-disc pl-5">';
    missingFields.forEach((field) => {
      errorMessage += `<li>${field}</li>`;
    });
    errorMessage += '</ul></div>';

    Swal.fire({
      icon: 'error',
      title: 'Missing or Invalid Information',
      html: errorMessage,
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
        htmlContainer: 'text-left',
      },
    });

    // Mark all fields as touched to show real-time errors
    Object.keys(this.userForm.controls).forEach((key) => {
      const control = this.userForm.get(key);
      control!.markAsTouched();
    });
    return;
  }

  // If valid, confirm update
  const token = this.tokenService.getToken();
  if (!token) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Authentication token not found',
      confirmButtonText: 'OK',
    });
    return;
  }

  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you really want to update this admin user?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, update it!',
    cancelButtonText: 'Cancel',
  }).then((result) => {
    if (result.isConfirmed) {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      });

      this.http
        .put(`${environment.API_URL}auth/update-admin/${itemId}`, this.userForm.value, { headers })
        .subscribe(
          () => {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Admin updated successfully!',
            }).then(() => {
              this.navigatePath('/steckholders/action/admin');
            });
          },
          (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Unsuccess',
              text: error.error?.error || 'Update failed',
            });
          }
        );
    }
  });
}
  // Updated createAdmin method
createAdmin() {
  // Log form values to verify
  console.log('userForm values before create:', this.userForm.value);

  const missingFields: string[] = [];

  // Validate form fields
  if (this.userForm.get('userName')?.invalid) {
    if (this.userForm.get('userName')?.errors?.['required']) {
      missingFields.push('User Name');
    } else if (this.userForm.get('userName')?.errors?.['pattern']) {
      missingFields.push('User Name - Must contain only letters and spaces');
    }
  }

  if (this.userForm.get('mail')?.invalid) {
    if (this.userForm.get('mail')?.errors?.['required']) {
      missingFields.push('Email');
    } else if (this.userForm.get('mail')?.errors?.['email']) {
      missingFields.push('Email - Invalid format (e.g., example@domain.com)');
    }
  }

  if (this.userForm.get('role')?.invalid) {
    missingFields.push('Department');
  }

  if (!this.isSuperAdminSelected && this.userForm.get('position')?.invalid) {
    missingFields.push('Position');
  }

  if (this.userForm.get('password')?.invalid) {
    if (this.userForm.get('password')?.errors?.['required']) {
      missingFields.push('Password');
    } else if (this.userForm.get('password')?.errors?.['minlength']) {
      missingFields.push('Password - Must be at least 8 characters');
    }
  }

  // If errors, show popup and stop submission
  if (missingFields.length > 0) {
    let errorMessage = '<div class="text-left"><p class="mb-2">Please fix the following issues:</p><ul class="list-disc pl-5">';
    missingFields.forEach((field) => {
      errorMessage += `<li>${field}</li>`;
    });
    errorMessage += '</ul></div>';

    Swal.fire({
      icon: 'error',
      title: 'Missing or Invalid Information',
      html: errorMessage,
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
        htmlContainer: 'text-left',
      },
    });

    // Mark all fields as touched to show real-time errors
    Object.keys(this.userForm.controls).forEach((key) => {
      const control = this.userForm.get(key);
      control!.markAsTouched();
    });
    return;
  }

  // If valid, confirm creation
  const token = this.tokenService.getToken();
  if (!token) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Authentication token not found',
      confirmButtonText: 'OK',
    });
    return;
  }

  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you really want to create a new admin user?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, create it!',
    cancelButtonText: 'Cancel',
  }).then((result) => {
    if (result.isConfirmed) {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      });

      this.http
        .post(`${environment.API_URL}auth/create-admin`, this.userForm.value, { headers })
        .subscribe(
          () => {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Admin created successfully!',
            }).then(() => {
              this.userForm.reset();
              this.navigatePath('/steckholders/action/admin');
            });
          },
          (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Unsuccess',
              text: error.error?.error || 'Creation failed',
            });
          }
        );
    }
  });
}



  openPopup() {
    this.isPopupVisible = true;
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
      this.router.navigate(['/steckholders/action/admin']);
    }
  });
}



  onCancel2() {
    this.userForm.reset();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }
}

export class CreateAdmin {
  email: string = '';
  userName: string = '';
  role: string = '';
  password: string = '';
}
