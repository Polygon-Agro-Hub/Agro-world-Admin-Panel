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
import { Console } from 'node:console';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environment/environment';
import { TokenService } from '../../../services/token/services/token.service';

interface Admin {
  id: number;
  email: string;
  userName: string;
  role: string;
  //storedCurrentPassword: string | null;
}

@Component({
  selector: 'app-create-admin-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HttpClientModule],
  templateUrl: './edit-admin-me-user.component.html',
  styleUrls: ['./edit-admin-me-user.component.css'], // Changed from styleUrl to styleUrls
})
export class EditAdminMeUserComponent implements OnInit {
  itemId: number | null = null;
  adminId: number | null = null;
  adminDetails: Admin[] = [];
  //createAdminObj: CreateAdmin = new CreateAdmin();
  showPassword1: boolean = false;
  showPassword2: boolean = false;
  showPassword3: boolean = false;
  isPopupVisible = false;

  storedCurrentPassword: string | null = null; // This will hold the current password fetched from the backend
  errorMessage: string = ''; // This will hold any error messages

  userForm: FormGroup;
  changePasswordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private tokenService: TokenService
  ) {
    this.userForm = this.fb.group({
      id: [''],
      mail: ['', [Validators.required, Validators.email]],
      userName: ['', [Validators.required, this.singleWordValidator]],
      role: [''],
    });

    this.changePasswordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, this.passwordValidator()]],
      confirmPassword: ['', [Validators.required]]
      },
      { validator: this.passwordMatchValidator }
    );

    this.changePasswordForm.valueChanges.subscribe(() => {
      this.updateErrorMessage();
    });
  }

  singleWordValidator(control: AbstractControl): ValidationErrors | null {
    const hasSpace = /\s/.test(control.value);
    return hasSpace ? { 'singleWord': true } : null;
  }

  passwordValidator(): ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      const value: string = control.value;
      if (!value) {
        return null;
      }
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);
      const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar && value.length >= 8;
      return !passwordValid ? { invalidPassword: true } : null;
    }
  }

  passwordMatchValidator(form: FormGroup): null | object {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true }; // Return an error object if passwords do not match
    } else {
      form.get('confirmPassword')?.setErrors(null); // Clear any previous error
      return null; // Explicitly return null if passwords match
    }
  }

  getErrorMessage(controlName: string, formGroup: FormGroup = this.userForm): string {
    const control = formGroup.get(controlName);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('singleWord')) {
      return 'Username must be a single word (no spaces allowed)';
    }
    if (control?.hasError('invalidPassword')) {
      return 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }
    if (formGroup.hasError('passwordMismatch') && controlName === 'confirmPassword') {
      return 'Passwords do not match';
    }
    return '';
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.itemId = params['id'] ? +params['id'] : null;
      console.log('Received item ID:', this.itemId);
    });
    this.getAdminById();
    console.log('ngonit data values', this.userForm.value);
    // this.getCurrentPassword(this.itemId);
  }

  getAdminById(): void {
    const token = this.tokenService.getToken();
    if (!token) {
      console.error('No token found');
      return;
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get<Admin[]>(`${environment.API_URL}auth/get-me`, {
        headers,
      })
      .subscribe(
        (data) => {
          this.userForm.patchValue(data);
          this.adminId = this.userForm.value.id;
          console.log('getAdminById data values', this.userForm.value);
          console.log(
            'getAdminById data values in data',
            this.userForm.value.id
          );
        },
        (error) => {
          console.error('Error fetching admin data:', error);
          if (error.status === 401) {
          }
        }
      );
  }

  openPopup() {
    this.isPopupVisible = true;
  }

  closePopup() {
    this.isPopupVisible = false;
  }

  updateMeAdmin() {
    const token = this.tokenService.getToken();
    if (!token) {
      console.error('No token found');
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json', // Setting the content type to JSON
    });

    console.log(this.userForm.value);

    this.http
      .post(
        `${environment.API_URL}auth/edit-admin-user-without-id`,
        this.userForm.value,
        { headers }
      )
      .subscribe(
        (res: any) => {
          this.userForm.patchValue(res);
          console.log('hi...... Admin updated successfully', res);
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Admin updated successfully!',
          }).then((result) => {
            if (result.isConfirmed) {
              // Redirect to the desired route
              this.router.navigate(['/login']);
              localStorage.removeItem('Login Token : ');
            }
          });
        },
        (error) => {
          console.error('Error updating Admin', error);
          Swal.fire({
            icon: 'error',
            title: 'Unsuccess',
            text: 'Error updating Admin',
          });
        }
      );
  }

  createAdmin() {
    console.log('clicked');
    //console.log(this.createAdminObj);

    const token = this.tokenService.getToken();
    if (!token) {
      console.error('No token found');
      return;
    }

    console.log('Admin Data:', this.userForm.value);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json', // Setting the content type to JSON
    });

    this.http
      .post(
        `${environment.API_URL}auth/create-admin`,
        this.userForm.value,
        {
          headers,
        }
      )
      .subscribe(
        (res: any) => {
          console.log('Admin created successfully', res);
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Admin created successfully!',
          });
        },
        (error) => {
          console.error('Error creating Admin', error);
          Swal.fire({
            icon: 'error',
            title: 'Unsuccess',
            text: 'Error creating Admin',
          });
        }
      );
  }

  onCancel() {
    console.log('Form cleared');
  }

  togglePasswordVisibility1() {
    this.showPassword1 = !this.showPassword1;
  }

  togglePasswordVisibility2() {
    this.showPassword2 = !this.showPassword2;
  }

  togglePasswordVisibility3() {
    this.showPassword3 = !this.showPassword3;
  }

  savePasswordChanges(): void {
    console.log('one savechangpsw is occured');

    const currentPassword =
      this.changePasswordForm.get('currentPassword')?.value;

    console.log('currentPassword ic', currentPassword);

    const newPassword = this.changePasswordForm.get('newPassword')?.value;

    const token = this.tokenService.getToken();
    if (!token) {
      console.error('No token found');
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    this.getAdminById();

    const requestBody = {
      id: this.adminId,
      currentPassword,
      newPassword,
    };

    console.error('two rbody id ', requestBody);

    this.http
      .post(
        `${environment.API_URL}auth/admin-change-password`,
        requestBody,
        {
          headers,
        }
      )
      .subscribe(
        (res: any) => {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Password updated successfully!',
          }).then((result) => {
            if (result.isConfirmed) {
              this.closePopup();
              this.router.navigate(['/login']);
              localStorage.removeItem('Login Token : ');
            }
          });
          this.closePopup();
        },
        (error) => {
          console.error('Error updating password', error);
          this.errorMessage = 'Error updating password.';
        }
      );
  }

  getCurrentPassword(id: any): void {}

  updateErrorMessage() {
    const newPassword = this.changePasswordForm.get('newPassword')?.value;
    const confirmPassword =
      this.changePasswordForm.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      this.errorMessage = 'New Password and Confirm Password do not match.';
    } else {
      this.errorMessage = '';
    }
  }
}

export class CreateAdmin {
  email: string = '';
  userName: string = '';
  role: string = '';
  password: string = '';
}
