import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from '../../../environment/environment';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { TokenService } from '../../../services/token/services/token.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    HttpClientModule,
    CommonModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  showPassword: boolean = false;
  disError: any;
  isLoading = false;

  loginObj: Login;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private tokenService: TokenService
  ) {
    this.loginObj = new Login();
  }

  ngOnInit() {
    this.tokenService.clearLoginDetails();
    this.clearAllCookies();
  }

  clearAllCookies() {
    const cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name =
        eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    }
  }

  onLogin() {
    this.isLoading = true; // Start loader when login begins

    if (!this.loginObj.email && !this.loginObj.password) {
      Swal.fire({
        icon: 'error',
        title: 'Unsuccessful',
        text: 'Username / Email and Password are required',
      }).then(() => {
        this.isLoading = false;
      });
      return;
    }

    if (!this.loginObj.email) {
      Swal.fire({
        icon: 'error',
        title: 'Unsuccessful',
        text: 'Username / Email is required',
      }).then(() => {
        this.isLoading = false;
      });
      return;
    }

    if (!this.loginObj.password) {
      Swal.fire({
        icon: 'error',
        title: 'Unsuccessful',
        text: 'Password is required',
      }).then(() => {
        this.isLoading = false;
      });
      return;
    }

    this.authService
      .login(this.loginObj.email, this.loginObj.password)
      .subscribe(
        (res: any) => {
          this.tokenService.saveLoginDetails(
            res.token,
            res.userName,
            res.userId,
            res.role,
            res.permissions,
            res.expiresIn
          );

          // Keeping your exact success message as is
          Swal.fire({
            icon: 'success',
            title: 'Logged In',
            text: 'Successfully Logged In',
            showConfirmButton: false,
            timer: 1500,
          }).then(() => {
            this.router.navigate(['steckholders/dashboard']);
            this.isLoading = false;
          });
        },
        (error) => {
          console.error('Error during login', error);

          // Enhanced error handling for incorrect credentials
          let errorMessage = 'An error occurred. Please try again.';

          if (error.status === 401) {
            errorMessage =
              'Incorrect username/email or password. Please try again.';
          } else if (error.error?.error) {
            errorMessage = error.error.error;
          }

          Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: errorMessage,
            confirmButtonColor: '#343434', // Optional: matching your theme
          }).then(() => {
            this.isLoading = false;
          });
        }
      );
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}

export class Login {
  email: string;
  password: string;

  constructor() {
    this.email = '';
    this.password = '';
  }
}
