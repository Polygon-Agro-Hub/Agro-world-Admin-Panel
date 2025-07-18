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
      mail: ['', [Validators.required, Validators.email]],
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

  getErrorMessage(controlName: string): string {
    const control = this.userForm.get(controlName);
    if (control?.hasError('required')) return 'This field is required';
    if (control?.hasError('email')) return 'Enter a valid email';
    if (control?.hasError('invalidPassword'))
      return 'Password must be 8+ chars, include upper/lowercase, number & special char';
    if (control?.hasError('singleWord'))
      return 'Username must be a single word (no spaces)';
    if (control?.hasError('containsNumber'))
      return 'Username cannot contain numbers';
    return '';
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

  updateAdmin(id: any) {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill out all required fields correctly.',
      });
      return;
    }

    const token = this.tokenService.getToken();
    if (!token || this.itemId === null) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Missing authentication or ID.',
      });
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    this.http
      .post(
        `${environment.API_URL}auth/edit-admin-user/${id}`,
        this.userForm.value,
        { headers }
      )
      .subscribe(
        () => {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Admin updated successfully!',
          });
          this.userForm.reset();
          this.navigatePath('/steckholders/action/admin');
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text:
              'Error updating Admin: ' +
              (error.error?.error || 'Unknown error'),
          });
        }
      );
  }

  createAdmin() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill out all required fields correctly.',
      });
      return;
    }

    const token = this.tokenService.getToken();
    if (!token) return;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    this.http
      .post(`${environment.API_URL}auth/create-admin`, this.userForm.value, {
        headers,
      })
      .subscribe(
        () => {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Admin created successfully!',
          });
          this.userForm.reset();
          this.navigatePath('/steckholders/action/admin');
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

  openPopup() {
    this.isPopupVisible = true;
  }

  onCancel() {
    this.userForm.reset();
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
