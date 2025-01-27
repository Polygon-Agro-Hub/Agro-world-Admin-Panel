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

interface Admin {
  id: number;
  mail: string;
  userName: string;
  role: string;
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
  styleUrls: ['./create-admin-user.component.css'], // Changed from styleUrl to styleUrls
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
    private router: Router
  ) {
    this.userForm = this.fb.group({
      id: [''],
      mail: ['', [Validators.required, Validators.email]],
      userName: ['', [Validators.required, this.singleWordValidator]],
      role: ['', Validators.required],
      position: ['', Validators.required],
      password: ['', [Validators.required, this.passwordValidator()]]
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.itemId = params['id'] ? +params['id'] : null;
      console.log('Received item ID:', this.itemId);
    });
    if(this.itemId){
      this.getAdminById(this.itemId);
    }
    
    this.getAllRoles();
    this.getAllPosition();
  }

  getAllRoles() {
    const token = localStorage.getItem('Login Token : ');
    if (!token) {
      console.error('No token found');
      return;
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    
    this.http
      .get<any>(`${environment.API_BASE_URL}get-all-roles`, {
        headers,
      })
      .subscribe(
        (response) => {
          
          this.rolesList = response.roles;
          console.log(response);

        },
        (error) => {
          console.error('Error fetching news:', error);
          
          // Handle error...
        }
      );
  }



  getAllPosition() {
    const token = localStorage.getItem('Login Token : ');
    if (!token) {
      console.error('No token found');
      return;
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    
    this.http
      .get<any>(`${environment.API_BASE_URL}get-all-position`, {
        headers,
      })
      .subscribe(
        (response) => {
          
          this.positionList = response.positions;
          console.log(response);

        },
        (error) => {
          console.error('Error fetching news:', error);
          
          // Handle error...
        }
      );
  }

  singleWordValidator(control: AbstractControl): ValidationErrors | null {
    const hasSpace = /\s/.test(control.value);
    const hasNumber = /\d/.test(control.value)

    if(hasNumber){
      return{containsNumber: true};
    }

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

  getErrorMessage(controlName: string): string {
    const control = this.userForm.get(controlName);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('invalidPassword')) {
      return 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }
    if (control?.hasError('singleWord')) {
      return 'Username must be a single word (no spaces allowed)';
    }
    if(control?.hasError('containsNumber')){
      return 'Username cannot contain numbers';
    }
    return '';
  }

  getAdminById(id: any): void {
    const token = localStorage.getItem('Login Token : ');
    if (!token) {
      console.error('No token found');
      return;
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get<Admin[]>(`${environment.API_BASE_URL}get-admin-by-id/${id}`, {
        headers,
      })
      .subscribe(
        (data) => {
          if (data && data.length > 0) {
            const adminData = data[0]; // Access the first object in the array

            this.userForm.patchValue({
              id: adminData.id,
              mail: adminData.mail,
              userName: adminData.userName,
              role: adminData.role,
            });

            console.log('Form values after patch:', this.userForm.value);
          } else {
            console.warn('No data found for the provided ID.');
          }
        },
        (error) => {
          console.error('Error fetching admin data:', error);
          if (error.status === 401) {
            // Handle unauthorized access (e.g., redirect to login)
          }
        }
      );
  }

  openPopup() {
    this.isPopupVisible = true;
  }

  updateAdmin(id:any) {
    const token = localStorage.getItem('Login Token : ');
    if (!token) {
      console.error('No token found');
      return;
    }

    if (this.itemId === null) {
      console.error('No item ID found');
      return;
    }

    const originalId = this.userForm.get('id')?.value;

    // Assign the itemId to the id field in userForm
    this.userForm.patchValue({ id: this.itemId });

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json', // Setting the content type to JSON
    });

    console.log(this.userForm.value);

    this.http
      .post(
        `${environment.API_BASE_URL}edit-admin-user/${id}`,
        this.userForm.value,
        { headers }
      )
      .subscribe(
        (res: any) => {
          this.userForm.patchValue(res);
          console.log('hi...... Admin updated successfully', res);

          // Reassign the original id value back to the form
          this.userForm.patchValue({ id: originalId });

          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Admin updated successfully!',
          });
          this.userForm.reset(); 
          this.router.navigate(['/steckholders/admin'])
        },
        (error) => {
          console.error('Error updating Admin', error);
          // Reassign the original id value back to the form
          this.userForm.patchValue({ id: originalId });
          Swal.fire({
            icon: 'error',
            title: 'Unsuccess',
            text: 'Error updating Admin',
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
    console.log('clicked');
    console.log(this.createAdminObj);

    const token = localStorage.getItem('Login Token : ');
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
        `${environment.API_BASE_URL}create-admin`,
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
          this.userForm.reset(); 
          this.router.navigate(['/steckholders/admin'])
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
    this.userForm.reset();
    this.router.navigate(['/steckholders/admin'])
  }

  onCancel2() {
    this.userForm.reset();
    this.router.navigate(['/steckholders/admin'])
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}

export class CreateAdmin {
  email: string = '';
  userName: string = '';
  role: string = '';
  password: string = '';
}
