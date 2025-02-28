import { Component } from "@angular/core";
import { Router } from "@angular/router";

import { FormsModule } from "@angular/forms";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import Swal from "sweetalert2";
import { environment } from "../../../environment/environment";
import { AuthService } from "../../../services/auth.service";
import { CommonModule } from "@angular/common";
import { TokenService } from "../../../services/token/services/token.service";
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    FormsModule,
    HttpClientModule,
    CommonModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
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
    private tokenService: TokenService,
  ) {
    this.loginObj = new Login();
  }

  ngOnInit() {
    localStorage.removeItem("Login Token : ");
  }


  onLogin() {
    this.isLoading = true; // Start loader when login begins
  
    if (!this.loginObj.email && !this.loginObj.password) {
      Swal.fire({
        icon: 'error',
        title: 'Unsuccessful',
        text: 'Email and Password are required',
      }).then(() => {
        this.isLoading = false; // Stop loader after user sees the error
      });
      return;
    }
  
    if (!this.loginObj.email) {
      Swal.fire({
        icon: 'error',
        title: 'Unsuccessful',
        text: 'Email is required',
      }).then(() => {
        this.isLoading = false;
      });
      return;
    }
  
    if (!/\S+@\S+\.\S+/.test(this.loginObj.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Unsuccessful',
        text: 'Please enter a valid email address',
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
  
    
    this.authService.login(this.loginObj.email, this.loginObj.password).subscribe(
      (res: any) => {
        console.log('Successfully logged in', res);
        Swal.fire({
          icon: 'success',
          title: 'Logged In',
          text: 'Successfully Logged In',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          this.isLoading = false; 
        });
  
        localStorage.setItem('Login Token : ', res.token);
        localStorage.setItem('userName:', res.userName);
        localStorage.setItem('userId:', res.userId);
        localStorage.setItem('role:', res.role);
        localStorage.setItem('permissions', JSON.stringify(res.permissions));
        localStorage.setItem('Token Expiration', String(new Date().getTime() + (res.expiresIn * 20)));
  
        this.tokenService.saveLoginDetails(res.token, res.userName, res.userId, res.role, res.permissions, res.expiresIn);
        
        this.router.navigate(['steckholders/dashboard']);
      },
      (error) => {
        console.error('Error during login', error);
        this.disError = error.error?.error || 'An error occurred. Please try again.';
  
        Swal.fire({
          icon: 'error',
          title: 'Unsuccessful',
          text: this.disError,
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
    this.email = "";
    this.password = "";
  }
}
